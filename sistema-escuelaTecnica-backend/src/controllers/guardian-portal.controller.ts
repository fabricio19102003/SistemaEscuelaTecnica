import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Guardian Portal Controller
 * Handles all guardian-specific portal endpoints
 * Guardians can only access data of their assigned students (wards)
 */

/**
 * GET /api/guardian-portal/my-students
 * Get all students assigned to the logged-in guardian
 */
export const getMyStudents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        // Get guardian record from user
        const guardian = await prisma.guardian.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!guardian) {
            res.status(404).json({ error: 'Tutor no encontrado' });
            return;
        }

        // Get all students assigned to this guardian
        const studentGuardians = await prisma.studentGuardian.findMany({
            where: {
                guardianId: guardian.id
            },
            include: {
                guardian: true,
                student: {
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
                        },
                        enrollments: {
                            where: {
                                status: 'ACTIVE',
                                deletedAt: null
                            }
                        }
                    }
                }
            }
        });

        // Format response
        const students = studentGuardians.map(sg => ({
            id: sg.student.id,
            registrationCode: sg.student.registrationCode,
            documentNumber: sg.student.documentNumber,
            enrollmentStatus: sg.student.enrollmentStatus,
            user: sg.student.user,
            relationship: sg.guardian.relationship,
            isPrimary: sg.isPrimary,
            activeEnrollments: sg.student.enrollments.length
        }));

        res.json({ students });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/guardian-portal/student-courses/:studentId
 * Get active courses for a specific student (must be assigned to guardian)
 */
export const getStudentCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const studentIdParam = req.params.studentId;
        const studentId = studentIdParam ? parseInt(studentIdParam) : NaN;

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        if (isNaN(studentId)) {
            res.status(400).json({ error: 'ID de estudiante inválido' });
            return;
        }

        // Get guardian record
        const guardian = await prisma.guardian.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!guardian) {
            res.status(404).json({ error: 'Tutor no encontrado' });
            return;
        }

        // Verify this student is assigned to this guardian
        const studentGuardian = await prisma.studentGuardian.findFirst({
            where: {
                studentId,
                guardianId: guardian.id
            }
        });

        if (!studentGuardian) {
            res.status(403).json({ error: 'No tienes acceso a este estudiante' });
            return;
        }

        // Get active enrollments with course details
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId,
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
 * GET /api/guardian-portal/student-grades/:studentId/:enrollmentId
 * Get grades for a specific student's enrollment (must be assigned to guardian)
 */
export const getStudentGrades = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const studentIdParam = req.params.studentId;
        const enrollmentIdParam = req.params.enrollmentId;
        const studentId = studentIdParam ? parseInt(studentIdParam) : NaN;
        const enrollmentId = enrollmentIdParam ? parseInt(enrollmentIdParam) : NaN;

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        if (isNaN(studentId) || isNaN(enrollmentId)) {
            res.status(400).json({ error: 'IDs inválidos' });
            return;
        }

        // Get guardian record
        const guardian = await prisma.guardian.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!guardian) {
            res.status(404).json({ error: 'Tutor no encontrado' });
            return;
        }

        // Verify this student is assigned to this guardian
        const studentGuardian = await prisma.studentGuardian.findFirst({
            where: {
                studentId,
                guardianId: guardian.id
            }
        });

        if (!studentGuardian) {
            res.status(403).json({ error: 'No tienes acceso a este estudiante' });
            return;
        }

        // Verify enrollment belongs to this student
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                id: enrollmentId,
                studentId,
                deletedAt: null
            },
            include: {
                student: {
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
 * GET /api/guardian-portal/student-attendance/:studentId/:enrollmentId
 * Get attendance records for a specific student's enrollment
 */
export const getStudentAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const studentIdParam = req.params.studentId;
        const enrollmentIdParam = req.params.enrollmentId;
        const studentId = studentIdParam ? parseInt(studentIdParam) : NaN;
        const enrollmentId = enrollmentIdParam ? parseInt(enrollmentIdParam) : NaN;

        if (!userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        if (isNaN(studentId) || isNaN(enrollmentId)) {
            res.status(400).json({ error: 'IDs inválidos' });
            return;
        }

        // Get guardian record
        const guardian = await prisma.guardian.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!guardian) {
            res.status(404).json({ error: 'Tutor no encontrado' });
            return;
        }

        // Verify this student is assigned to this guardian
        const studentGuardian = await prisma.studentGuardian.findFirst({
            where: {
                studentId,
                guardianId: guardian.id
            }
        });

        if (!studentGuardian) {
            res.status(403).json({ error: 'No tienes acceso a este estudiante' });
            return;
        }

        // Verify enrollment belongs to this student
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                id: enrollmentId,
                studentId
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
