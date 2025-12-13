import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Student Portal Controller
 * Handles all student-specific portal endpoints
 * Students can only access their own data
 */

/**
 * GET /api/student-portal/my-courses
 * Get active courses for the logged-in student
 */
export const getMyCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        // Get student record from user
        const student = await prisma.student.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!student) {
            res.status(404).json({ error: 'Estudiante no encontrado' });
            return;
        }

        // Get active enrollments with course details
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: 'ACTIVE',
                deletedAt: null
            },
            include: {
                group: {
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        paternalSurname: true,
                                        maternalSurname: true,
                                        profileImageUrl: true
                                    }
                                }
                            }
                        },
                        level: {
                            include: {
                                course: {
                                    select: {
                                        id: true,
                                        name: true,
                                        code: true,
                                        description: true,
                                        imageUrl: true,
                                        schedules: {
                                            select: {
                                                dayOfWeek: true,
                                                startTime: true,
                                                endTime: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        schedules: {
                            select: {
                                dayOfWeek: true,
                                startTime: true,
                                endTime: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                enrollmentDate: 'desc'
            }
        });

        res.json({ enrollments });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student-portal/my-grades/:enrollmentId
 * Get grades for a specific enrollment (only if it belongs to the logged-in student)
 */
export const getMyGrades = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const enrollmentId = parseInt(req.params.enrollmentId ?? '');

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        if (isNaN(enrollmentId)) {
            res.status(400).json({ error: 'ID de inscripción inválido' });
            return;
        }

        // Get student record
        const student = await prisma.student.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!student) {
            res.status(404).json({ error: 'Estudiante no encontrado' });
            return;
        }

        // Verify enrollment belongs to this student
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                id: enrollmentId,
                studentId: student.id,
                deletedAt: null
            },
            include: {
                group: {
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        paternalSurname: true,
                                        maternalSurname: true
                                    }
                                }
                            }
                        },
                        level: {
                            include: {
                                course: {
                                    select: {
                                        name: true,
                                        code: true,
                                        imageUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!enrollment) {
            res.status(403).json({ error: 'No tienes acceso a esta inscripción' });
            return;
        }

        // Get grades for this enrollment
        const grades = await prisma.grade.findMany({
            where: {
                enrollmentId
            },
            orderBy: {
                evaluationDate: 'desc'
            }
        });

        // Calculate statistics
        const totalEvaluations = grades.length;
        const averageGrade = totalEvaluations > 0
            ? grades.reduce((sum, grade) => sum + Number(grade.gradeValue), 0) / totalEvaluations
            : 0;
        const passedEvaluations = grades.filter(g => Number(g.gradeValue) >= 51).length;

        res.json({
            enrollment,
            grades,
            stats: {
                averageGrade: parseFloat(averageGrade.toFixed(2)),
                totalEvaluations,
                passedEvaluations
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student-portal/my-academic-history
 * Get complete academic history for the logged-in student
 */
export const getMyAcademicHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        // Get student record
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        paternalSurname: true,
                        maternalSurname: true,
                        email: true,
                        phone: true,
                        profileImageUrl: true
                    }
                }
            }
        });

        if (!student) {
            res.status(404).json({ error: 'Estudiante no encontrado' });
            return;
        }

        // Get all enrollments with grades
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                deletedAt: null
            },
            include: {
                group: {
                    include: {
                        level: {
                            include: {
                                course: {
                                    select: {
                                        name: true,
                                        code: true
                                    }
                                }
                            }
                        }
                    }
                },
                grades: true
            },
            orderBy: {
                enrollmentDate: 'desc'
            }
        });

        // Format academic history
        const history = enrollments.map(enrollment => {
            const finalGrades = enrollment.grades.filter(g => g.evaluationType === 'EXAM');
            const finalGrade = finalGrades.length > 0
                ? finalGrades.reduce((sum, g) => sum + Number(g.gradeValue), 0) / finalGrades.length
                : null;

            return {
                id: enrollment.id,
                enrollmentDate: enrollment.enrollmentDate,
                year: enrollment.enrollmentDate.getFullYear(),
                period: `${enrollment.enrollmentDate.getMonth() < 6 ? '1' : '2'}/${enrollment.enrollmentDate.getFullYear()}`,
                courseName: enrollment.group.level.course.name,
                courseCode: enrollment.group.level.course.code,
                levelName: enrollment.group.level.name,
                finalGrade,
                status: enrollment.status,
                certificateUrl: null
            };
        });

        res.json({
            student,
            history
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student-portal/my-attendance/:enrollmentId
 * Get attendance records for a specific enrollment
 */
export const getMyAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const enrollmentId = parseInt(req.params.enrollmentId ?? '');

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        if (isNaN(enrollmentId)) {
            res.status(400).json({ error: 'ID de inscripción inválido' });
            return;
        }

        // Get student record
        const student = await prisma.student.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!student) {
            res.status(404).json({ error: 'Estudiante no encontrado' });
            return;
        }

        // Verify enrollment belongs to this student
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                id: enrollmentId,
                studentId: student.id
            }
        });

        if (!enrollment) {
            res.status(403).json({ error: 'No tienes acceso a esta inscripción' });
            return;
        }

        // Get attendance records
        const attendances = await prisma.attendance.findMany({
            where: {
                enrollmentId
            },
            orderBy: {
                attendanceDate: 'desc'
            }
        });

        // Calculate statistics
        const totalDays = attendances.length;
        const presentDays = attendances.filter(a => a.status === 'PRESENT').length;
        const lateDays = attendances.filter(a => a.status === 'LATE').length;
        const absentDays = attendances.filter(a => a.status === 'ABSENT').length;
        const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;

        res.json({
            attendances,
            stats: {
                totalDays,
                presentDays,
                lateDays,
                absentDays,
                attendancePercentage: parseFloat(attendancePercentage.toFixed(2))
            }
        });
    } catch (error) {
        next(error);
    }
};
