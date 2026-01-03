import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { hashPassword } from '../utils/auth.utils.js';
import { Prisma } from '@prisma/client';
import { uploadToCloudinary } from '../utils/file-upload.js';

export const createStudent = async (req: Request, res: Response) => {
    try {
        let bodyData = req.body;
        // Check if data is coming as stringified JSON (from FormData)
        if (req.body.data && typeof req.body.data === 'string') {
            try {
                bodyData = JSON.parse(req.body.data);
                // Merge parsed data back into req.body for convenience if needed, or just use bodyData locally
            } catch (e) {
                return res.status(400).json({ message: 'Invalid JSON data in request' });
            }
        } else if (req.body.data && typeof req.body.data === 'object') {
            // Already parsed by some middleware ?
            bodyData = req.body.data;
        }

        const {
            // User info
            email,
            password,
            firstName,
            paternalSurname,
            maternalSurname,
            phone,

            // Student info
            documentType,
            documentNumber,
            dateOfBirth,
            gender,
            address,
            previousSchool,
            medicalNotes,
            schoolId,
            enrollmentStatus,
            emergencyContactName,
            emergencyContactPhone,

            // Guardian info
            guardian
        } = bodyData;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Check if user exists
            const existingUser = await tx.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // 2. Create User
            // Authenticated user creation (Admin creating student) might not send password.
            // Generate a default password if not provided (e.g., Document Number or generic).
            const finalPassword = password || documentNumber || 'student123';
            const hashedPassword = await hashPassword(finalPassword);

            // Prefer paternalSurname, fallback to lastName if provided (handled by caller ideally, 
            // but here we ensure we have a surname)
            if (!paternalSurname) {
                // throw new Error('Paternal surname is required');
                // For now assume it was passed
            }

            let profileImageUrl: string | null = null;
            if (req.file) {
                profileImageUrl = await uploadToCloudinary(req.file.buffer);
            }

            const newUser = await tx.user.create({
                data: {
                    email,
                    username: `${firstName.charAt(0).toUpperCase()}${paternalSurname.replace(/\s+/g, '').toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
                    passwordHash: hashedPassword,
                    firstName,
                    paternalSurname: paternalSurname || '', // Ensure not null if schema requires it
                    maternalSurname,
                    phone,
                    profileImageUrl,
                    userRoles: {
                        create: { role: { connect: { name: 'STUDENT' } } }
                    }
                }
            });

            // 3. Create Student
            // Generate code: ST-{YEAR}-{RANDOM}
            const registrationCode = `ST${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

            // Validate dateOfBirth
            const parsedDate = new Date(dateOfBirth);
            if (isNaN(parsedDate.getTime())) {
                throw new Error('Invalid date of birth provided');
            }

            const newStudent = await tx.student.create({
                data: {
                    userId: newUser.id,
                    registrationCode,
                    documentType: documentType as any, // Cast to enum
                    documentNumber,
                    dateOfBirth: parsedDate,
                    gender: gender as any, // Cast to enum
                    address,
                    previousSchool,
                    schoolId: schoolId ? Number(schoolId) : null,
                    medicalNotes,
                    emergencyContactName,
                    emergencyContactPhone,
                    enrollmentStatus: enrollmentStatus || 'ACTIVE'
                }
            });

            // 4. Handle Guardian
            if (guardian) {
                let guardianId: number | null = null;
                const existingGuardianUser = await tx.user.findUnique({
                    where: { email: guardian.email }
                });

                if (existingGuardianUser) {
                    const existingGuardianProfile = await tx.guardian.findUnique({
                        where: { userId: existingGuardianUser.id }
                    });

                    if (existingGuardianProfile) {
                        guardianId = existingGuardianProfile.id;
                    } else {
                        const newGuardianProfile = await tx.guardian.create({
                            data: {
                                userId: existingGuardianUser.id,
                                documentType: guardian.documentType,
                                documentNumber: guardian.documentNumber,
                                relationship: guardian.relationship,
                                occupation: guardian.occupation,
                                workplace: guardian.workplace
                            }
                        });
                        guardianId = newGuardianProfile.id;
                    }
                } else {
                    const guardianPasswordHash = await hashPassword(guardian.password || 'guardian123');
                    const newGuardianUser = await tx.user.create({
                        data: {
                            email: guardian.email,
                            username: `${guardian.firstName.charAt(0).toUpperCase()}${guardian.paternalSurname.replace(/\s+/g, '').toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
                            passwordHash: guardianPasswordHash,
                            firstName: guardian.firstName,
                            paternalSurname: guardian.paternalSurname,
                            maternalSurname: guardian.maternalSurname,
                            phone: guardian.phone,
                            isActive: true,
                            userRoles: {
                                create: [{ role: { connect: { name: 'LEGAL_GUARDIAN' } } }]
                            }
                        }
                    });

                    const newGuardianProfile = await tx.guardian.create({
                        data: {
                            userId: newGuardianUser.id,
                            documentType: guardian.documentType,
                            documentNumber: guardian.documentNumber,
                            relationship: guardian.relationship,
                            occupation: guardian.occupation,
                            workplace: guardian.workplace
                        }
                    });
                    guardianId = newGuardianProfile.id;
                }

                if (guardianId) {
                    await tx.studentGuardian.create({
                        data: {
                            studentId: newStudent.id,
                            guardianId: guardianId,
                            isPrimary: true,
                            canPickup: true
                        }
                    });
                }
            }

            // 5. Fetch complete student data to return
            return await tx.student.findUniqueOrThrow({
                where: { id: newStudent.id },
                include: {
                    user: true,
                    school: true,
                    studentGuardians: {
                        include: {
                            guardian: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });
        });

        res.status(201).json(result);

    } catch (error: any) {
        console.error('Error creating student:', error);
        res.status(400).json({
            message: error.message || 'Error creating student'
        });
    }
};

export const getStudents = async (req: Request, res: Response) => {
    try {
        const students = await prisma.student.findMany({
            where: { deletedAt: null },
            include: {
                user: {
                    select: {
                        firstName: true,
                        paternalSurname: true,
                        maternalSurname: true,
                        email: true,
                        phone: true,
                        profileImageUrl: true,
                        isActive: true
                    }
                },
                school: {
                    include: {
                        agreement: true
                    }
                },
                studentGuardians: {
                    include: {
                        guardian: {
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        paternalSurname: true,
                                        maternalSurname: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving students' });
    }
};

export const getStudentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const student = await prisma.student.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
                school: true,
                studentGuardians: {
                    include: {
                        guardian: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                enrollments: {
                    include: {
                        group: {
                            include: {
                                level: {
                                    include: {
                                        course: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        enrollmentDate: 'desc'
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving student details' });
    }
};

export const updateStudent = async (req: Request, res: Response) => {
    console.log('🔥🔥🔥 UPDATE STUDENT FUNCTION CALLED 🔥🔥🔥');
    const { id } = req.params;

    let bodyData = req.body;

    console.log('========== UPDATE STUDENT DEBUG ==========');
    console.log('Student ID:', id);
    console.log('req.body keys:', Object.keys(req.body));

    // Check if data is coming as stringified JSON (from FormData)
    if (req.body.data && typeof req.body.data === 'string') {
        try {
            bodyData = JSON.parse(req.body.data);
            console.log('✓ Parsed JSON from string');
        } catch (e) {
            console.error('✗ JSON Parse Error:', e);
            return res.status(400).json({ message: 'Invalid JSON data in request' });
        }
    } else if (req.body.data && typeof req.body.data === 'object') {
        bodyData = req.body.data;
        console.log('✓ Using req.body.data as object');
    }

    console.log('bodyData keys:', Object.keys(bodyData));
    console.log('Has guardian?', 'guardian' in bodyData);
    if (bodyData.guardian) {
        console.log('Guardian data keys:', Object.keys(bodyData.guardian));
        console.log('Guardian email:', bodyData.guardian.email);
    }

    const {
        firstName,
        paternalSurname,
        maternalSurname,
        phone,
        address,
        medicalNotes,
        schoolId,
        enrollmentStatus,
        documentType,
        documentNumber,
        dateOfBirth,
        gender,
        guardian
    } = bodyData;

    console.log('Extracted fields:');
    console.log('- firstName:', firstName);
    console.log('- documentType:', documentType);
    console.log('- documentNumber:', documentNumber);
    console.log('- dateOfBirth:', dateOfBirth);
    console.log('- gender:', gender);
    console.log('- guardian:', guardian ? 'YES' : 'NO');
    console.log('==========================================');

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Prepare update data dynamic to avoid undefined issues with exactOptionalPropertyTypes
            const studentUpdateData: Prisma.StudentUpdateInput = {};
            if (address !== undefined) studentUpdateData.address = address;
            if (medicalNotes !== undefined) studentUpdateData.medicalNotes = medicalNotes;
            if (schoolId !== undefined) studentUpdateData.school = schoolId ? { connect: { id: Number(schoolId) } } : { disconnect: true };
            if (enrollmentStatus !== undefined) studentUpdateData.enrollmentStatus = enrollmentStatus;

            // Add new student fields
            if (documentType !== undefined) studentUpdateData.documentType = documentType as any;
            if (documentNumber !== undefined) studentUpdateData.documentNumber = documentNumber;
            if (gender !== undefined) studentUpdateData.gender = gender as any;
            if (dateOfBirth !== undefined) {
                const parsedDate = new Date(dateOfBirth);
                if (!isNaN(parsedDate.getTime())) {
                    studentUpdateData.dateOfBirth = parsedDate;
                }
            }

            // Update Student Profile
            const updatedStudent = await tx.student.update({
                where: { id: Number(id) },
                data: studentUpdateData,
                include: {
                    user: true,
                    school: true,
                    studentGuardians: {
                        include: {
                            guardian: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });

            console.log('Student updated, has guardians?', updatedStudent.studentGuardians?.length || 0);

            // Update User Profile (Name, Phone, Photo)
            const userUpdateData: Prisma.UserUpdateInput = {};
            if (firstName !== undefined) userUpdateData.firstName = firstName;
            if (paternalSurname !== undefined) userUpdateData.paternalSurname = paternalSurname;
            if (maternalSurname !== undefined) userUpdateData.maternalSurname = maternalSurname;
            if (phone !== undefined) userUpdateData.phone = phone;
            if (req.file) {
                userUpdateData.profileImageUrl = await uploadToCloudinary(req.file.buffer);
            }

            if (Object.keys(userUpdateData).length > 0) {
                await tx.user.update({
                    where: { id: updatedStudent.userId },
                    data: userUpdateData
                });

                // Refresh user data in updatedStudent return object if user changed
                if (updatedStudent.user) {
                    Object.assign(updatedStudent.user, userUpdateData);
                }
            }

            // Handle Guardian Update/Create
            if (guardian) {
                console.log('Processing guardian data...');
                const primaryGuardianRel = updatedStudent.studentGuardians && updatedStudent.studentGuardians.length > 0
                    ? (updatedStudent.studentGuardians.find((sg: any) => sg.isPrimary) || updatedStudent.studentGuardians[0])
                    : null;

                if (primaryGuardianRel) {
                    console.log('Updating existing guardian:', primaryGuardianRel.guardianId);
                    const guardianId = primaryGuardianRel.guardianId;

                    // Update Guardian User
                    const guardianUserUpdateData: Prisma.UserUpdateInput = {};
                    if (guardian.firstName) guardianUserUpdateData.firstName = guardian.firstName;
                    if (guardian.paternalSurname) guardianUserUpdateData.paternalSurname = guardian.paternalSurname;
                    if (guardian.maternalSurname) guardianUserUpdateData.maternalSurname = guardian.maternalSurname;
                    if (guardian.email) guardianUserUpdateData.email = guardian.email;
                    if (guardian.phone) guardianUserUpdateData.phone = guardian.phone;

                    if (Object.keys(guardianUserUpdateData).length > 0) {
                        const guardianProfile = await tx.guardian.findUnique({ where: { id: guardianId } });
                        if (guardianProfile) {
                            await tx.user.update({
                                where: { id: guardianProfile.userId },
                                data: guardianUserUpdateData
                            });
                        }
                    }

                    // Update Guardian Profile
                    const guardianProfileUpdateData: Prisma.GuardianUpdateInput = {};
                    if (guardian.documentType) guardianProfileUpdateData.documentType = guardian.documentType;
                    if (guardian.documentNumber) guardianProfileUpdateData.documentNumber = guardian.documentNumber;
                    if (guardian.relationship) guardianProfileUpdateData.relationship = guardian.relationship;
                    if (guardian.occupation) guardianProfileUpdateData.occupation = guardian.occupation;
                    if (guardian.workplace) guardianProfileUpdateData.workplace = guardian.workplace;

                    if (Object.keys(guardianProfileUpdateData).length > 0) {
                        await tx.guardian.update({
                            where: { id: guardianId },
                            data: guardianProfileUpdateData
                        });
                    }

                } else {
                    console.log('Creating NEW guardian...');
                    let guardianId: number | null = null;
                    const existingGuardianUser = await tx.user.findUnique({
                        where: { email: guardian.email }
                    });

                    if (existingGuardianUser) {
                        console.log('Found existing user with email:', guardian.email);
                        const existingGuardianProfile = await tx.guardian.findUnique({
                            where: { userId: existingGuardianUser.id }
                        });

                        if (existingGuardianProfile) {
                            guardianId = existingGuardianProfile.id;
                        } else {
                            const newGuardianProfile = await tx.guardian.create({
                                data: {
                                    userId: existingGuardianUser.id,
                                    documentType: guardian.documentType,
                                    documentNumber: guardian.documentNumber,
                                    relationship: guardian.relationship,
                                    occupation: guardian.occupation,
                                    workplace: guardian.workplace
                                }
                            });
                            guardianId = newGuardianProfile.id;
                        }
                    } else {
                        console.log('Creating completely new guardian user');
                        const guardianPasswordHash = await hashPassword('guardian123');
                        const newGuardianUser = await tx.user.create({
                            data: {
                                email: guardian.email,
                                passwordHash: guardianPasswordHash,
                                firstName: guardian.firstName,
                                paternalSurname: guardian.paternalSurname,
                                maternalSurname: guardian.maternalSurname,
                                phone: guardian.phone,
                                isActive: true,
                                userRoles: {
                                    create: [{ role: { connect: { name: 'LEGAL_GUARDIAN' } } }]
                                }
                            }
                        });

                        const newGuardianProfile = await tx.guardian.create({
                            data: {
                                userId: newGuardianUser.id,
                                documentType: guardian.documentType,
                                documentNumber: guardian.documentNumber,
                                relationship: guardian.relationship,
                                occupation: guardian.occupation,
                                workplace: guardian.workplace
                            }
                        });
                        guardianId = newGuardianProfile.id;
                    }

                    if (guardianId) {
                        console.log('Linking guardianId', guardianId, 'to studentId', updatedStudent.id);
                        await tx.studentGuardian.create({
                            data: {
                                studentId: updatedStudent.id,
                                guardianId: guardianId,
                                isPrimary: true,
                                canPickup: true
                            }
                        });
                    }
                }
            }

            // Refetch complete student data
            const freshStudent = await tx.student.findUnique({
                where: { id: Number(id) },
                include: {
                    user: true,
                    school: true,
                    studentGuardians: {
                        include: {
                            guardian: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });

            console.log('Final student has guardians?', freshStudent?.studentGuardians?.length || 0);
            return freshStudent;
        });

        res.json(result);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: 'Error updating student: ' + error.message });
    }
};

export const deleteStudent = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const student = await tx.student.findUnique({ where: { id: Number(id) } });

            if (!student) {
                throw new Error('Student not found');
            }

            // Soft delete student
            await tx.student.update({
                where: { id: Number(id) },
                data: {
                    deletedAt: new Date(),
                    enrollmentStatus: 'INACTIVE'
                }
            });

            // Deactivate user
            await tx.user.update({
                where: { id: student.userId },
                data: {
                    isActive: false
                }
            });

            return { message: 'Student deleted successfully' };
        });

        res.json(result);
    } catch (error: any) {
        if (error.message === 'Student not found') {
            res.status(404).json({ message: 'Student not found' });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Error deleting student' });
        }
    }
};

export const getStudentHistory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const studentId = Number(id);

        // 1. Get all enrollments for the student
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: studentId,
                status: { not: 'CANCELLED' } // Optionally exclude cancelled
            },
            include: {
                group: {
                    include: {
                        level: {
                            include: {
                                course: true
                            }
                        }
                    }
                },
                reportCards: {
                    where: { status: 'APPROVED' }, // Mostly interested in final approved grades
                    orderBy: { periodEnd: 'desc' },
                    take: 1
                },
                grades: true, // Fetch grades to calculate average if report card is missing
                certificates: true
            },
            orderBy: {
                enrollmentDate: 'desc'
            }
        });

        // 2. Format the history
        const history = enrollments.map(enrollment => {
            const course = enrollment.group.level.course;
            const level = enrollment.group.level;
            const reportCard = enrollment.reportCards[0];

            let period = 'N/A';
            if (reportCard && reportCard.periodName) {
                period = reportCard.periodName;
            } else {
                const date = new Date(enrollment.enrollmentDate);
                const month = date.getMonth() + 1; // 1-12
                const year = date.getFullYear();
                // Simple logic: Period 1 (Jan-Jun), Period 2 (Jul-Dec)
                period = month <= 6 ? `1/${year}` : `2/${year}`;
            }

            let finalGrade = null;
            if (reportCard && reportCard.finalGrade) {
                finalGrade = Number(reportCard.finalGrade);
            } else if (enrollment.grades && enrollment.grades.length > 0) {
                // Calculate average from raw grades if report card is missing/not approved
                const coreCompetencies = ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'VOCABULARY', 'GRAMMAR'];
                const coreGrades = enrollment.grades.filter((g: any) => coreCompetencies.includes(g.evaluationType));

                if (coreGrades.length > 0) {
                    const total = coreGrades.reduce((sum: number, g: any) => sum + Number(g.gradeValue), 0);
                    finalGrade = total / 6; // Fixed division by 6 for standard scale
                }
            }

            return {
                id: enrollment.id,
                enrollmentDate: enrollment.enrollmentDate,
                year: new Date(enrollment.enrollmentDate).getFullYear(), // Academic Year (Gestión)
                period: period,
                courseName: course.name,
                courseCode: course.code,
                levelName: level.name,
                finalGrade: finalGrade,
                status: enrollment.status === 'COMPLETED' ? 'Aprobado' :
                    enrollment.status === 'ACTIVE' ? 'Cursando' :
                        enrollment.status, // Translate statuses as needed
                certificateUrl: enrollment.certificates[0]?.certificateFileUrl || null
            };
        });

        // DEBUG LOG
        console.log('Sending student history:', JSON.stringify(history, null, 2));

        res.json(history);
    } catch (error) {
        console.error('Error fetching student history:', error);
        res.status(500).json({ message: 'Error retrieving student history' });
    }
};

import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getMyAcademicHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const student = await prisma.student.findUnique({
            where: { userId: Number(userId) }
        });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found for this user' });
        }

        // Reuse logic or call internal helper if refactored, but for now copying the logic is safer to avoid breaking existing admin function
        // 1. Get all enrollments for the student (Only COMPLETED)
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: 'COMPLETED'
            },
            include: {
                group: {
                    include: {
                        level: {
                            include: {
                                course: true
                            }
                        }
                    }
                },
                reportCards: {
                    where: { status: 'APPROVED' },
                    orderBy: { periodEnd: 'desc' },
                    take: 1
                },
                grades: true,
                certificates: true
            },
            orderBy: {
                enrollmentDate: 'desc'
            }
        });

        // 2. Format the history
        const history = enrollments.map(enrollment => {
            const course = enrollment.group.level.course;
            const level = enrollment.group.level;
            const reportCard = enrollment.reportCards[0];

            let period = 'N/A';
            if (reportCard && reportCard.periodName) {
                period = reportCard.periodName;
            } else {
                const date = new Date(enrollment.enrollmentDate);
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                period = month <= 6 ? `1/${year}` : `2/${year}`;
            }

            let finalGrade = null;
            if (reportCard && reportCard.finalGrade) {
                finalGrade = Number(reportCard.finalGrade);
            } else if (enrollment.grades && enrollment.grades.length > 0) {
                const coreCompetencies = ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'VOCABULARY', 'GRAMMAR'];
                const coreGrades = enrollment.grades.filter((g: any) => coreCompetencies.includes(g.evaluationType));

                if (coreGrades.length > 0) {
                    const total = coreGrades.reduce((sum: number, g: any) => sum + Number(g.gradeValue), 0);
                    finalGrade = total / 6;
                }
            }

            return {
                id: enrollment.id,
                enrollmentDate: enrollment.enrollmentDate,
                year: new Date(enrollment.enrollmentDate).getFullYear(),
                period: period,
                courseName: course.name,
                courseCode: course.code,
                levelName: level.name,
                finalGrade: finalGrade,
                status: enrollment.status === 'COMPLETED' ? 'Aprobado' :
                    enrollment.status === 'ACTIVE' ? 'Cursando' :
                        enrollment.status,
                certificateUrl: enrollment.certificates[0]?.certificateFileUrl || null
            };
        });

        res.json(history);
    } catch (error) {
        console.error('Error fetching my history:', error);
        res.status(500).json({ message: 'Error retrieving academic history' });
    }
};

// getMyAttendance function removed - use StudentPortalController instead

export const getEligibleStudents = async (req: Request, res: Response) => {
    const { courseId } = req.query;

    if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
    }

    try {
        const targetCourseId = Number(courseId);

        // 1. Get Course Info (to check prerequisite)
        const course = await prisma.course.findUnique({
            where: { id: targetCourseId }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // 2. Define Query
        let whereClause: any = {
            deletedAt: null,
            enrollmentStatus: 'ACTIVE' // Only active students can enroll
        };

        // 3. Check Prerequisite
        // If course has a prerequisite, filter students who completed it.
        // If NOT, we basically allow everyone (subject to business rules, maybe just ACTIVE ones?)

        if (course.previousCourseId) {
            // Must have COMPLETED the previous course
            // We search for students who have at least one enrollment in a group belonging to the previous course
            // AND that enrollment status is COMPLETED
            whereClause.enrollments = {
                some: {
                    group: {
                        level: {
                            courseId: course.previousCourseId
                        }
                    },
                    status: 'COMPLETED' // Logic: You must have completed the previous level
                }
            };
        }

        // 4. Exclude students ALREADY enrolled in the TARGET course (Active or Completed or Pending)
        // We don't want to double enroll in the same course.
        // We append this condition to the whereClause. 
        // Note: 'some' in Prisma works as "at least one matches". We want "NONE match".
        // Prisma `none` filter is perfect here.

        const alreadyEnrolledFilter = {
            enrollments: {
                none: {
                    group: {
                        level: {
                            courseId: targetCourseId
                        }
                    },
                    status: { in: ['ACTIVE', 'COMPLETED', 'PENDING'] }
                }
            }
        };

        // If we already have an enrollments filter (from prerequisite), we must combine them.
        // Prisma doesn't support implicit AND on the same relation field easily in the top level object without explicit AND operator if colliding.
        // But here:
        // Case A (Has Prereq): whereClause.enrollments = { some: ... }
        // Case B (No Prereq): whereClause.enrollments = undefined so far.

        if (whereClause.enrollments) {
            // We have a prerequisite check. We need to ADD the "not already enrolled" check.
            // We can use AND array.
            whereClause.AND = [
                { enrollments: whereClause.enrollments }, // The prerequisite check
                alreadyEnrolledFilter
            ];
            delete whereClause.enrollments; // Remove the top-level property to avoid conflict or overwrite
        } else {
            // No prerequisite check, just apply the "not already enrolled" filter directly
            whereClause.enrollments = alreadyEnrolledFilter.enrollments;
        }

        // 5. Execute Query
        const eligibleStudents = await prisma.student.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        firstName: true,
                        paternalSurname: true,
                        maternalSurname: true,
                        email: true,
                        phone: true,
                        profileImageUrl: true,
                        isActive: true
                    }
                },
                school: true
            },
            orderBy: {
                user: {
                    paternalSurname: 'asc'
                }
            }
        });

        res.json(eligibleStudents);

    } catch (error) {
        console.error('Error fetching eligible students:', error);
        res.status(500).json({ message: 'Error determining student eligibility' });
    }
};
