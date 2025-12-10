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
                status: 'ACTIVE' // Only active students
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
                status: 'ACTIVE'
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
                status: 'ACTIVE'
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
                status: 'ACTIVE'
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
    console.log('User ID:', (req as any).user?.id);

    try {
        if (!enrollmentId || !Array.isArray(grades)) {
            console.error('Invalid data: enrollmentId or grades array missing');
            return res.status(400).json({ message: 'Datos inválidos' });
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
                            progressTest: gradeItem.progressTest ? Number(gradeItem.progressTest) : null,
                            classPerformance: gradeItem.classPerformance ? Number(gradeItem.classPerformance) : null,
                            gradeValue: finalScore,
                            comments: gradeItem.comments,
                            recordedBy: (req as any).user?.id ?? null
                        }
                    });
                } else {
                    console.log(`Creating new grade for ${gradeItem.type}`);
                    await tx.grade.create({
                        data: {
                            enrollmentId: Number(enrollmentId),
                            evaluationName: gradeItem.type,
                            evaluationType: gradeItem.type as EvaluationType,
                            progressTest: gradeItem.progressTest ? Number(gradeItem.progressTest) : null,
                            classPerformance: gradeItem.classPerformance ? Number(gradeItem.classPerformance) : null,
                            gradeValue: finalScore || 0,
                            comments: gradeItem.comments,
                            evaluationDate: new Date(),
                            maxGrade: 100,
                            recordedBy: (req as any).user?.id ?? null
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
                        level: {
                            include: {
                                course: {
                                    include: {
                                        schedules: true
                                    }
                                }
                            }
                        }
                    }
                },
                grades: true,
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
        const average = coreGrades.length > 0 ? total / coreGrades.length : 0;

        res.json({
            ...enrollment,
            calculatedAverage: average
        });

    } catch (error) {
        console.error('Error fetching report card data:', error);
        res.status(500).json({ message: 'Error al obtener datos del boletín' });
    }
};
