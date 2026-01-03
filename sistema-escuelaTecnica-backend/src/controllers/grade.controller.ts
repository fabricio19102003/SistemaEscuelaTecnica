import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { EvaluationType } from '@prisma/client';

// Get grades for all students in a group
export const getGradesByGroup = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                groupId: Number(groupId),
                status: { in: ['ACTIVE', 'COMPLETED'] } // Active and Completed students
            },
            include: {
                student: {
                    include: {
                        user: true
                    }
                },
                grades: true
            },
            orderBy: {
                student: {
                    user: {
                        paternalSurname: 'asc'
                    }
                }
            }
        });
        res.json(enrollments);
    } catch (error) {
        console.error('Error fetching grades by group:', error);
        res.status(500).json({ message: 'Error al obtener calificaciones del grupo' });
    }
};

// Get grades for all students in a course (across all groups of that course)
export const getGradesByCourse = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                group: {
                    level: {
                        courseId: Number(courseId)
                    }
                },
                status: { in: ['ACTIVE', 'COMPLETED'] }
            },
            include: {
                student: {
                    include: {
                        user: true
                    }
                },
                group: true, // properties like name might be useful
                grades: true
            },
            orderBy: {
                student: {
                    user: {
                        paternalSurname: 'asc'
                    }
                }
            }
        });
        res.json(enrollments);
    } catch (error) {
        console.error('Error fetching grades by course:', error);
        res.status(500).json({ message: 'Error al obtener calificaciones del curso' });
    }
};

// NEW: Get detailed group report data (Acta de Calificaciones)
export const getGroupReportData = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    try {
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
                teacher: {
                    include: {
                        user: true
                    }
                },
                schedules: true
            }
        });

        if (!group) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: {
                groupId: Number(groupId),
                status: { in: ['ACTIVE', 'COMPLETED'] }
            },
            include: {
                student: {
                    include: {
                        user: true
                    }
                },
                grades: true
            },
            orderBy: {
                student: {
                    user: {
                        paternalSurname: 'asc'
                    }
                }
            }
        });

        res.json({
            group,
            enrollments
        });

    } catch (error) {
        console.error('Error fetching group report data:', error);
        res.status(500).json({ message: 'Error al obtener datos del acta' });
    }
};

// NEW: Get grades for ALL active enrollments across the system
export const getAllGrades = async (req: Request, res: Response) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                status: { in: ['ACTIVE', 'COMPLETED'] }
            },
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
                        }
                    }
                },
                grades: true
            },
            orderBy: {
                student: {
                    user: {
                        paternalSurname: 'asc'
                    }
                }
            }
        });
        res.json(enrollments);
    } catch (error) {
        console.error('Error fetching all grades:', error);
        res.status(500).json({ message: 'Error al obtener todas las calificaciones' });
    }
};

// Save grades for a single student (enrollment)
export const saveGrades = async (req: Request, res: Response) => {
    const { enrollmentId, grades } = req.body; // grades: { type: EvaluationType, progressTest?: number, classPerformance?: number, score?: number, comments: string }[]

    console.log('--- SAVE GRADES REQUEST ---');
    console.log('Enrollment ID:', enrollmentId);
    console.log('Grades Payload:', JSON.stringify(grades, null, 2));

    const userId = (req as any).user?.id;
    console.log('User ID:', userId);

    try {
        if (!enrollmentId || !Array.isArray(grades)) {
            console.error('Invalid data: enrollmentId or grades array missing');
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        // Check if grade entry is enabled (Admin global switch)
        const userRoles = (req as any).user?.roles || [];
        const isAdmin = userRoles.includes('ADMIN');

        if (!isAdmin) {
            const setting = await prisma.systemSetting.findUnique({
                where: { key: 'GRADES_OPEN' }
            });
            const areGradesOpen = setting ? setting.value === 'true' : true; // Default open if not set

            if (!areGradesOpen) {
                return res.status(403).json({ message: 'El registro de notas está deshabilitado por administración.' });
            }

            // NEW: Check if specific GROUP is finalized (GRADES_SUBMITTED or COMPLETED)
            const enrollment = await prisma.enrollment.findUnique({
                where: { id: Number(enrollmentId) },
                include: { group: true }
            });

            if (!enrollment) {
                return res.status(404).json({ message: 'Inscripción no encontrada' });
            }

            if (enrollment.group.status === 'GRADES_SUBMITTED' || enrollment.group.status === 'COMPLETED') {
                return res.status(403).json({ message: 'El curso ha sido finalizado. No se permiten más modificaciones.' });
            }
        }

        // Find teacher associated with user to correctly link recordedBy
        let recorderId: number | null = null;
        if (userId) {
            const teacher = await prisma.teacher.findUnique({
                where: { userId: Number(userId) }
            });
            if (teacher) {
                recorderId = teacher.id;
            } else {
                console.warn(`User ${userId} is saving grades but has no associated Teacher profile. recordedBy will be null.`);
            }
        }

        // Transactional update
        await prisma.$transaction(async (tx) => {
            for (const gradeItem of grades) {
                console.log(`Processing grade: ${gradeItem.type}`);

                if (!Object.values(EvaluationType).includes(gradeItem.type as EvaluationType)) {
                    console.warn(`Invalid evaluation type skipped: ${gradeItem.type}`);
                    continue;
                }

                // Calculate score if sub-aspects are present
                let finalScore = gradeItem.score;
                if (gradeItem.progressTest !== undefined && gradeItem.classPerformance !== undefined) {
                    // Ensure they are treated as numbers
                    const pt = Number(gradeItem.progressTest);
                    const cp = Number(gradeItem.classPerformance);
                    finalScore = (pt + cp) / 2;
                }

                const existing = await tx.grade.findFirst({
                    where: {
                        enrollmentId: Number(enrollmentId),
                        evaluationType: gradeItem.type as EvaluationType
                    }
                });

                if (existing) {
                    console.log(`Updating existing grade ID: ${existing.id}`);
                    await tx.grade.update({
                        where: { id: existing.id },
                        data: {
                            progressTest: gradeItem.progressTest !== undefined && gradeItem.progressTest !== null ? Number(gradeItem.progressTest) : null,
                            classPerformance: gradeItem.classPerformance !== undefined && gradeItem.classPerformance !== null ? Number(gradeItem.classPerformance) : null,
                            gradeValue: finalScore,
                            comments: gradeItem.comments,
                            recordedBy: recorderId
                        }
                    });
                } else {
                    console.log(`Creating new grade for ${gradeItem.type}`);
                    await tx.grade.create({
                        data: {
                            enrollmentId: Number(enrollmentId),
                            evaluationName: gradeItem.type,
                            evaluationType: gradeItem.type as EvaluationType,
                            progressTest: gradeItem.progressTest !== undefined && gradeItem.progressTest !== null ? Number(gradeItem.progressTest) : null,
                            classPerformance: gradeItem.classPerformance !== undefined && gradeItem.classPerformance !== null ? Number(gradeItem.classPerformance) : null,
                            gradeValue: finalScore || 0,
                            comments: gradeItem.comments,
                            evaluationDate: new Date(),
                            maxGrade: 100,
                            recordedBy: recorderId
                        }
                    });
                }
            }
        });

        console.log('Grades saved successfully');
        res.json({ message: 'Calificaciones guardadas correctamente' });

    } catch (error) {
        console.error('Error saving grades:', error);
        res.status(500).json({ message: 'Error al guardar calificaciones' });
    }
};

// Get data for report card
export const getReportCardData = async (req: Request, res: Response) => {
    const { enrollmentId } = req.params;
    try {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: Number(enrollmentId) },
            include: {
                student: {
                    include: {
                        user: true
                    }
                },
                group: {
                    include: {
                        teacher: {
                            include: {
                                user: true
                            }
                        },
                        schedules: true,
                        level: {
                            include: {
                                course: {
                                    include: {
                                        schedules: true,
                                        nextCourses: true // Include next courses to determine "Pass to"
                                    }
                                }
                            }
                        }
                    }
                },
                grades: true,
                attendances: true, // Include attendance to count absences
                reportCards: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Matrícula no encontrada' });
        }

        // Calculate average if not persisted in reportCard
        // Filter only the 6 core competencies
        const coreCompetencies = ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'VOCABULARY', 'GRAMMAR'];
        const coreGrades = enrollment.grades.filter(g => coreCompetencies.includes(g.evaluationType));

        const total = coreGrades.reduce((sum, g) => sum + Number(g.gradeValue), 0);
        const average = coreGrades.length > 0 ? (total / 6) : 0; // Divide by 6 fixed competencies for correct average

        // Format Period
        const startYear = new Date(enrollment.group.startDate).getFullYear();
        const period = `GESTIÓN ${startYear}`;

        // Format Schedule (Strictly Course schedule as requested)
        const relevantSchedules = enrollment.group.level.course.schedules;

        const formatTime = (date: Date | string) => {
            if (date instanceof Date) {
                // Extracts UTC HH:MM to avoid local timezone shifts (e.g., getting 04:00 for 08:00 stored as UTC)
                const hours = date.getUTCHours().toString().padStart(2, '0');
                const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            }
            return String(date).substring(0, 5);
        };

        const scheduleString = [...new Set(relevantSchedules
            .map(s => {
                const startRaw = formatTime(s.startTime);
                const endRaw = formatTime(s.endTime);
                return `${startRaw} - ${endRaw}`;
            }))]
            .join(' / ');

        // Format Names
        const studentName = `${enrollment.student.user.firstName} ${enrollment.student.user.paternalSurname} ${enrollment.student.user.maternalSurname || ''}`.trim().toUpperCase();
        const teacherName = enrollment.group.teacher
            ? `${enrollment.group.teacher.user.firstName} ${enrollment.group.teacher.user.paternalSurname} ${enrollment.group.teacher.user.maternalSurname || ''}`.trim().toUpperCase()
            : 'S/D';

        const courseName = enrollment.group.level.course.name.toUpperCase();
        const levelName = enrollment.group.level.name.toUpperCase();

        // Determine "Pass to" course
        const nextCourses = enrollment.group.level.course.nextCourses;
        let nextCourseName = 'APROBADO';
        if (nextCourses && nextCourses.length > 0 && nextCourses[0]) {
            // Usually there is only one next course in linear progression
            nextCourseName = nextCourses[0].name.toUpperCase();
        }

        const responseData = {
            ...enrollment,
            studentName,
            teacherName,
            courseName,
            levelName,
            period,
            schedule: scheduleString || 'POR DEFINIR',
            groupName: enrollment.group.name,
            absences: enrollment.attendances.filter(a => a.status === 'ABSENT').length, // Count actual absences
            finalScore: average, // Mapped to finalScore as expected by PDF
            calculatedAverage: average,
            passed: average >= 51,
            nextCourse: nextCourseName // Return the calculated next course name
        };

        res.json(responseData);

    } catch (error) {
        console.error('Error fetching report card data:', error);
        res.status(500).json({ message: 'Error al obtener datos del boletín' });
    }
};

// NEW: Get School Statistics (Top Schools by student count)
export const getSchoolStatistics = async (req: Request, res: Response) => {
    try {
        // 1. Group students by schoolId to count them
        const schoolCounts = await prisma.student.groupBy({
            by: ['schoolId'],
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 10 // Top 10 schools
        });

        // 2. Fetch school details for the mapped IDs
        const schoolIds = schoolCounts
            .map(s => s.schoolId)
            .filter((id): id is number => id !== null); // Filter out null schoolIds

        const schools = await prisma.school.findMany({
            where: {
                id: { in: schoolIds }
            },
            select: {
                id: true,
                name: true
            }
        });

        // 3. Map counts to names
        const result = schoolCounts
            .filter(s => s.schoolId !== null)
            .map(countItem => {
                const schoolDef = schools.find(s => s.id === countItem.schoolId);
                return {
                    schoolId: countItem.schoolId,
                    name: schoolDef?.name || 'Desconocido',
                    count: countItem._count.id
                };
            });

        res.json(result);

    } catch (error) {
        console.error('Error fetching school statistics:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas de colegios' });
    }
};
