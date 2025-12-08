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
                school: true,
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
    const { id } = req.params;

    let bodyData = req.body;
    // Check if data is coming as stringified JSON (from FormData)
    if (req.body.data && typeof req.body.data === 'string') {
        try {
            bodyData = JSON.parse(req.body.data);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid JSON data in request' });
        }
    } else if (req.body.data && typeof req.body.data === 'object') {
        bodyData = req.body.data;
    }

    const {
        firstName,
        paternalSurname,
        maternalSurname,
        phone,
        address,
        medicalNotes,
        schoolId,
        enrollmentStatus
    } = bodyData;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Prepare update data dynamic to avoid undefined issues with exactOptionalPropertyTypes
            const studentUpdateData: Prisma.StudentUpdateInput = {};
            if (address !== undefined) studentUpdateData.address = address;
            if (medicalNotes !== undefined) studentUpdateData.medicalNotes = medicalNotes;
            if (schoolId !== undefined) studentUpdateData.school = schoolId ? { connect: { id: Number(schoolId) } } : { disconnect: true };
            if (enrollmentStatus !== undefined) studentUpdateData.enrollmentStatus = enrollmentStatus;

            // Update Student Profile
            const updatedStudent = await tx.student.update({
                where: { id: Number(id) },
                data: studentUpdateData,
                include: {
                    user: true,
                    school: true
                }
            });

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


            return updatedStudent;
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
