import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import type { Prisma } from '@prisma/client';

// ==========================================
// COURSES
// ==========================================

export const createCourse = async (req: Request, res: Response) => {
    const { name, code, description, minAge, maxAge, durationMonths, imageUrl } = req.body;

    try {
        const newCourse = await prisma.course.create({
            data: {
                name,
                code,
                description,
                minAge: Number(minAge),
                maxAge: Number(maxAge),
                durationMonths: durationMonths ? Number(durationMonths) : null,
                imageUrl,
                isActive: true
            }
        });
        res.status(201).json(newCourse);
    } catch (error: any) {
        console.error('Error creating course:', error);
        res.status(400).json({ message: 'Error creating course' });
    }
};

export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                levels: {
                    where: { isActive: true },
                    orderBy: { orderIndex: 'asc' }
                }
            },
            where: { isActive: true }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses' });
    }
};

// ==========================================
// LEVELS
// ==========================================

export const createLevel = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const {
        name,
        code,
        orderIndex,
        description,
        durationWeeks,
        totalHours,
        basePrice, // Decimal
        objectives,
        requirements
    } = req.body;

    try {
        const newLevel = await prisma.level.create({
            data: {
                courseId: Number(courseId),
                name,
                code,
                orderIndex: Number(orderIndex),
                description,
                durationWeeks: Number(durationWeeks),
                totalHours: Number(totalHours),
                basePrice: basePrice, // Prisma handles Decimal from string/number usually, but safely passed
                objectives,
                requirements,
                isActive: true
            }
        });
        res.status(201).json(newLevel);
    } catch (error) {
        console.error('Error creating level:', error);
        res.status(400).json({ message: 'Error creating level' });
    }
};

// ==========================================
// GROUPS
// ==========================================

export const createGroup = async (req: Request, res: Response) => {
    const {
        levelId,
        teacherId,
        name,
        code,
        startDate,
        endDate,
        maxCapacity,
        minCapacity,
        classroom,
        notes,
        schedules // Array of { dayOfWeek, startTime, endTime }
    } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Group
            const newGroup = await tx.group.create({
                data: {
                    levelId: Number(levelId),
                    teacherId: Number(teacherId),
                    name,
                    code,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    maxCapacity: Number(maxCapacity),
                    minCapacity: minCapacity ? Number(minCapacity) : 5,
                    currentEnrolled: 0,
                    status: 'OPEN',
                    classroom,
                    notes
                }
            });

            // 2. Create Schedules
            if (schedules && Array.isArray(schedules) && schedules.length > 0) {
                await tx.schedule.createMany({
                    data: schedules.map((s: any) => ({
                        groupId: newGroup.id,
                        dayOfWeek: s.dayOfWeek,
                        startTime: new Date(`1970-01-01T${s.startTime}Z`), // Expecting "HH:mm:ss" or ISO
                        endTime: new Date(`1970-01-01T${s.endTime}Z`)
                    }))
                });
            }

            return newGroup;
        });

        res.status(201).json(result);
    } catch (error: any) {
        console.error('Error creating group:', error);
        res.status(400).json({ message: 'Error creating group: ' + error.message });
    }
};

export const getGroups = async (req: Request, res: Response) => {
    try {
        const groups = await prisma.group.findMany({
            include: {
                level: {
                    include: { course: true }
                },
                teacher: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                },
                schedules: true,
                enrollments: {
                    select: { id: true } // Just to count if needed, though currentEnrolled is a field
                }
            },
            orderBy: { startDate: 'desc' }
        });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups' });
    }
};
