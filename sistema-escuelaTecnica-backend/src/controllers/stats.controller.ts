import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const getFinancialStatsByCourse = async (req: Request, res: Response) => {
    try {
        // We need to calculate executed payments grouped by course
        // Path: Course -> Level -> Group -> Enrollment -> Invoice -> PaymentRecord

        // 1. Get all courses with their levels and groups
        // 1. Get all courses with their levels and groups
        const courses = await prisma.course.findMany({
            where: { isActive: true },
            include: {
                levels: {
                    include: {
                        groups: {
                            include: {
                                enrollments: {
                                    where: {
                                        status: { not: 'CANCELLED' } // Don't count cancelled enrollments
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // 2. Aggregate revenue based on Agreed Price (Sales)
        const revenueByCourse = courses.map(course => {
            let totalRevenue = 0;
            let totalStudents = 0;

            course.levels.forEach(level => {
                level.groups.forEach(group => {
                    group.enrollments.forEach(enrollment => {
                        totalStudents++;
                        // Use agreedPrice as the revenue source since we don't have separate payment records yet
                        totalRevenue += Number(enrollment.agreedPrice) || 0;
                    });
                });
            });

            return {
                id: course.id,
                name: course.name,
                totalRevenue,
                totalStudents
            };
        });

        // Sort by revenue desc
        revenueByCourse.sort((a, b) => b.totalRevenue - a.totalRevenue);

        res.json(revenueByCourse);

    } catch (error) {
        console.error('Error fetching financial stats:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas financieras' });
    }
};
