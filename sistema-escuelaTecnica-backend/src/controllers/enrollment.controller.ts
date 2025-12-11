import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { hashPassword } from '../utils/auth.utils.js';
import { Prisma, DayOfWeek } from '@prisma/client';

export const createEnrollment = async (req: Request, res: Response) => {
    try {
        console.log('--- Create Enrollment Request ---');
        console.log('Body:', req.body);
        let { studentId, groupId, courseId } = req.body;
        // Assuming user is attached to req by middleware
        const userId = (req as any).user?.id;

        // 1. Fetch Student with School info
        const student = await prisma.student.findUnique({
            where: { id: Number(studentId) },
            include: {
                user: true,
                school: {
                    include: {
                        agreement: true
                    }
                }
            }
        });

        console.log('Student Found:', student ? 'YES' : 'NO');
        if (student) {
            console.log('Student School:', student.school);
            console.log('Student Agreement:', student.school?.agreement);
        }

        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        // 1.5 Resolve Group if courseId provided
        if (!groupId && courseId) {
            console.log('Resolving Group for CourseId:', courseId);
            // Find an OPEN group for this course
            // We need to join with Level -> Course
            let availableGroup = await prisma.group.findFirst({
                where: {
                    level: {
                        courseId: Number(courseId)
                    },
                    status: 'OPEN' // Assuming 'OPEN' is the status for active/enrollable groups.
                },
                orderBy: {
                    startDate: 'desc'
                }
            });

            console.log('Available Group Found:', availableGroup);

            // AUTO-CREATE LOGIC IF NO GROUP FOUND
            if (!availableGroup) {
                console.log('No active group found. Checking for existing levels or creating defaults...');

                // 1. Check if ANY level exists for this course
                let level = await prisma.level.findFirst({
                    where: { courseId: Number(courseId) }
                });

                if (!level) {
                    console.log('No level found. Creating default Level...');
                    // Create default level
                    level = await prisma.level.create({
                        data: {
                            courseId: Number(courseId),
                            name: 'Nivel Único',
                            code: `NIV-${Math.floor(Math.random() * 10000)}`,
                            orderIndex: 1,
                            durationWeeks: 4, // Default
                            totalHours: 20,   // Default
                            basePrice: 450,   // Default price
                            isActive: true
                        }
                    });
                }

                console.log('Using Level:', level.id);

                // 2. Create a default Group for this level
                const currentYear = new Date().getFullYear();
                console.log('Creating default Group for current year...');

                try {
                    const fallbackTeacher = await prisma.teacher.findFirst();
                    const teacherIdToUse = fallbackTeacher ? fallbackTeacher.id : 1;

                    availableGroup = await prisma.group.create({
                        data: {
                            levelId: level.id,
                            teacherId: teacherIdToUse,
                            name: `Grupo ${currentYear}`,
                            code: `GRP-${currentYear}-${Math.floor(Math.random() * 10000)}`,
                            startDate: new Date(),
                            endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)), // 6 months default
                            maxCapacity: 30,
                            status: 'OPEN',
                            schedules: {
                                create: [
                                    { dayOfWeek: DayOfWeek.MONDAY, startTime: new Date('1970-01-01T08:00:00Z'), endTime: new Date('1970-01-01T12:00:00Z') },
                                    { dayOfWeek: DayOfWeek.WEDNESDAY, startTime: new Date('1970-01-01T08:00:00Z'), endTime: new Date('1970-01-01T12:00:00Z') },
                                    { dayOfWeek: DayOfWeek.FRIDAY, startTime: new Date('1970-01-01T08:00:00Z'), endTime: new Date('1970-01-01T12:00:00Z') }
                                ]
                            }
                        }
                    });
                } catch (e) {
                    console.error('Error creating default group:', e);
                    throw new Error('No se pudo crear un grupo automático. Asegurese de tener al menos un docente registrado.');
                }
            }

            if (availableGroup) {
                groupId = availableGroup.id;
            } else {
                return res.status(500).json({ message: 'Error interno: No se pudo asignar un grupo automático.' });
            }
        }

        if (!groupId) {
            return res.status(400).json({ message: 'Debe especificar un Grupo o un Curso.' });
        }

        // 2. Fetch Group with Level/Course info for pricing
        const group = await prisma.group.findUnique({
            where: { id: Number(groupId) },
            include: {
                level: {
                    include: {
                        course: {
                            include: {
                                schedules: true
                            }
                        }
                    }
                },
                enrollments: true
            }
        });

        if (!group) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }


        // 3. Calculate Price
        // Use Level base price or default to 450
        const basePrice = Number(group.level.basePrice) || 450;
        let finalPrice = basePrice;
        let discountPercentage = 0;
        let agreementId = null;

        console.log('Base Price:', basePrice);

        // Check for active agreement via School
        if (student.school?.agreement?.isActive) {
            const agreement = student.school.agreement;
            const now = new Date();
            console.log('Checking Agreement:', agreement.name);
            console.log('Agreement Dates:', agreement.startDate, agreement.endDate, 'Now:', now);

            // Validate dates
            if (agreement.startDate <= now && (!agreement.endDate || agreement.endDate >= now)) {
                console.log('Agreement is Valid');
                agreementId = agreement.id;
                if (agreement.discountType === 'PERCENTAGE') {
                    discountPercentage = Number(agreement.discountValue);
                    const discountAmount = (basePrice * discountPercentage) / 100;
                    finalPrice = basePrice - discountAmount;
                    console.log('Applied Percentage Discount:', discountPercentage, '%');
                } else if (agreement.discountType === 'FIXED_AMOUNT') {
                    const discountAmount = Number(agreement.discountValue);
                    finalPrice = Math.max(0, basePrice - discountAmount);
                    discountPercentage = (discountAmount / basePrice) * 100;
                    console.log('Applied Fixed Discount:', discountAmount);
                }
            } else {
                console.log('Agreement Date Invalid');
            }
        } else {
            console.log('No Active Agreement found for School');
        }

        console.log('Final Price:', finalPrice);

        // 4. Generate Credentials
        // Username: First Letter Name + Paternal + Random 3
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const cleanPaternal = student.user.paternalSurname.replace(/\s+/g, '').toUpperCase();
        const username = `${student.user.firstName.charAt(0).toUpperCase()}${cleanPaternal}${randomSuffix}`;

        // Password: Random 8 chars (alphanumeric)
        const plainPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await hashPassword(plainPassword);

        // 5. Transaction: Update User + Create Enrollment
        const result = await prisma.$transaction(async (tx) => {
            // Update User Credentials
            await tx.user.update({
                where: { id: student.userId },
                data: {
                    passwordHash: hashedPassword,
                    username: username // Set generated username
                }
            });

            // Create Enrollment
            const enrollment = await tx.enrollment.create({
                data: {
                    studentId: Number(studentId),
                    groupId: Number(groupId),
                    enrollmentDate: new Date(),
                    startDate: group.startDate,
                    endDate: group.endDate,
                    status: 'ACTIVE', // Assuming active upon enrollment creation
                    agreedPrice: finalPrice,
                    discountPercentage: discountPercentage,
                    agreementId: agreementId,
                    enrollmentNotes: 'Matricula regular',
                    createdById: userId ? Number(userId) : null
                },
                include: {
                    student: {
                        include: {
                            user: true,
                            school: true
                        }
                    },
                    group: {
                        include: {
                            level: {
                                include: {
                                    course: {
                                        include: {
                                            schedules: true
                                        }
                                    }
                                }
                            },
                            schedules: true
                        }
                    },
                    agreement: true,
                    createdBy: true
                }
            });

            return enrollment;
        });

        // 6. Return Data with Clear Text Credentials
        res.status(201).json({
            ...result,
            credentials: {
                username: username, // Return the generated username
                password: plainPassword
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al matricular', error });
    }
};

export const getEnrollments = async (req: Request, res: Response) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            include: {
                student: {
                    include: {
                        user: true
                    }
                },
                group: {
                    include: {
                        level: {
                            include: {
                                course: {
                                    include: {
                                        schedules: true
                                    }
                                }
                            }
                        },
                        schedules: true // Added schedules
                    }
                },
                createdBy: true
            },
            orderBy: { enrollmentDate: 'desc' }
        });
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener matriculas' });
    }
};

export const getEnrollmentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: Number(id) },
            include: {
                student: {
                    include: {
                        user: true,
                        school: true
                    }
                },
                group: {
                    include: {
                        level: {
                            include: {
                                course: {
                                    include: {
                                        schedules: true
                                    }
                                }
                            }
                        },
                        schedules: true,
                        teacher: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                agreement: true,
                createdBy: true
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Matricula no encontrada' });
        }

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener matricula' });
    }
};

export const deleteEnrollment = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.enrollment.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Matrícula eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar matrícula' });
    }
};

export const getEnrollmentReport = async (req: Request, res: Response) => {
    try {
        const { period, courseId, year, academicPeriod } = req.query;

        const whereClause: any = {};
        const groupWhere: any = {};

        if (courseId) {
            groupWhere.level = { courseId: Number(courseId) };
        }

        // Filter by Year (Gestión)
        if (year) {
            const startOfYear = new Date(`${year}-01-01`);
            const endOfYear = new Date(`${year}-12-31`);
            groupWhere.startDate = {
                gte: startOfYear,
                lte: endOfYear
            };
        }

        // Filter by Academic Period (1 or 2)
        // If year is selected, restricting to that year's semesters.
        // If no year selected, this might be ambiguous, but we'll assume current year or just month filter if Prisma allowed simple month filtering (which it doesn't easily in simple where).
        // Let's enforce that Period filtering relies on the StartDate range.
        if (year && academicPeriod) {
            const y = Number(year);
            if (String(academicPeriod) === '1') {
                groupWhere.startDate = {
                    gte: new Date(`${y}-01-01`),
                    lte: new Date(`${y}-06-30`)
                };
            } else if (String(academicPeriod) === '2') {
                groupWhere.startDate = {
                    gte: new Date(`${y}-07-01`),
                    lte: new Date(`${y}-12-31`)
                };
            }
        }

        // Legacy period string filter (keep if needed or remove if replaced)
        // Keeping it strictly for backward compatibility if the frontend still sends 'period' as a string search
        if (period && !year && !academicPeriod) {
            // Filter by period in group code or name
            groupWhere.OR = [
                { code: { contains: String(period) } },
                { name: { contains: String(period) } }
            ];
        }

        if (Object.keys(groupWhere).length > 0) {
            whereClause.group = groupWhere;
        }

        const enrollments = await prisma.enrollment.findMany({
            where: whereClause,
            include: {
                student: {
                    include: {
                        user: true
                    }
                },
                group: {
                    include: {
                        level: {
                            include: {
                                course: true
                            }
                        },
                        teacher: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { group: { level: { course: { name: 'asc' } } } }, // Group by course name
                { student: { user: { paternalSurname: 'asc' } } }  // Then alphabetical by student
            ]
        });

        res.json(enrollments);
    } catch (error) {
        console.error('Error fetching enrollment report:', error);
        res.status(500).json({ message: 'Error al generar el reporte de matriculas' });
    }
};
