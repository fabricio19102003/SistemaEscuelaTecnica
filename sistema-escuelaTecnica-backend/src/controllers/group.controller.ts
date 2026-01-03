import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import type { Prisma } from '@prisma/client';

// ==========================================
// GROUPS CONTROLER
// ==========================================

export const createGroup = async (req: Request, res: Response) => {
    const {
        levelId,
        startDate,
        endDate,
        maxCapacity,
        minCapacity,
        notes
        // Removed: teacherId, name, code, classroom, schedules (Auto-generated/fetched)
    } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch Level and associated Course details
            const level = await tx.level.findUnique({
                where: { id: Number(levelId) },
                include: {
                    course: {
                        include: {
                            teacher: true,
                            classrooms: true,
                            schedules: true
                        }
                    }
                }
            });

            if (!level) {
                throw new Error('Level not found');
            }

            const course = level.course;

            // TODO: Decide if we strictly require a teacher or allow null
            if (!course.teacherId) {
                // For now, let's allow it but warn or just leave empty if schema allows
                // Schema has teacherId as Int (required) or Int? (optional)?
                // Checking schema... Group.teacherId is Int (required).
                // So we MUST have a teacher.
                throw new Error(`The course "${course.name}" does not have a teacher assigned. Cannot create group.`);
            }

            // 2. Auto-generate Name and Code
            // Name format: "{CourseName} - {LevelName}"
            const groupName = `${course.name} - ${level.name}`;

            // Code format: "GRP-{CourseCode}-{LevelCode}-{Year}-{Random4}"
            const periodYear = new Date(startDate).getFullYear();
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const groupCode = `GRP-${course.code}-${level.code}-${periodYear}-${randomSuffix}`;

            // 3. Auto-populate other fields
            const assignedTeacherId = course.teacherId;
            const assignedClassroom = course.classrooms?.[0]?.name ?? null;

            // 4. Create Group
            const newGroup = await tx.group.create({
                data: {
                    levelId: Number(levelId),
                    teacherId: assignedTeacherId,
                    name: groupName,
                    code: groupCode,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    maxCapacity: Number(maxCapacity),
                    minCapacity: minCapacity ? Number(minCapacity) : 5,
                    currentEnrolled: 0,
                    status: 'OPEN',
                    classroom: assignedClassroom,
                    notes
                }
            });

            // 5. Copy Schedules from Course
            if (course.schedules && course.schedules.length > 0) {
                await tx.schedule.createMany({
                    data: course.schedules.map((s) => ({
                        groupId: newGroup.id,
                        dayOfWeek: s.dayOfWeek,
                        startTime: s.startTime,
                        endTime: s.endTime
                    }))
                });
            }

            return newGroup;
        });

        res.status(201).json(result);
    } catch (error: any) {
        console.error('Error creating group:', error);
        res.status(400).json({ message: error.message || 'Error creating group' });
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
                            select: { firstName: true, paternalSurname: true }
                        }
                    }
                },
                schedules: true,
                enrollments: {
                    select: { id: true }
                }
            },
            orderBy: { startDate: 'desc' }
        });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups' });
    }
};

export const getGroupById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const group = await prisma.group.findUnique({
            where: { id: Number(id) },
            include: {
                level: {
                    include: { course: true }
                },
                teacher: {
                    include: {
                        user: {
                            select: { firstName: true, paternalSurname: true }
                        }
                    }
                },
                schedules: true,
                enrollments: true
            }
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching group' });
    }
};

export const updateGroup = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        levelId,
        teacherId,
        name,
        code,
        startDate,
        endDate,
        maxCapacity,
        minCapacity,
        status,
        classroom,
        notes,
        schedules
    } = req.body;

    try {
        const updateData: Prisma.GroupUpdateInput = {
            name,
            code,
            status,
            classroom,
            notes
        };

        if (maxCapacity) updateData.maxCapacity = Number(maxCapacity);
        if (minCapacity) updateData.minCapacity = Number(minCapacity);

        if (levelId) updateData.level = { connect: { id: Number(levelId) } };
        if (teacherId) updateData.teacher = { connect: { id: Number(teacherId) } };
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);

        const updatedGroup = await prisma.$transaction(async (tx) => {
            // Update Schedules if provided
            if (schedules) {
                // Delete existing schedules for this group
                await tx.schedule.deleteMany({ where: { groupId: Number(id) } });

                // Create new schedules
                if (Array.isArray(schedules) && schedules.length > 0) {
                    await tx.schedule.createMany({
                        data: schedules.map((s: any) => ({
                            groupId: Number(id),
                            dayOfWeek: s.dayOfWeek,
                            startTime: new Date(`1970-01-01T${s.startTime}:00Z`), // Ensure correct format
                            endTime: new Date(`1970-01-01T${s.endTime}:00Z`)
                        }))
                    });
                }
            }

            return await tx.group.update({
                where: { id: Number(id) },
                data: updateData,
                include: { schedules: true }
            });
        });

        res.json(updatedGroup);
    } catch (error: any) {
        console.error('Error updating group:', error);
        res.status(400).json({ message: 'Error updating group' });
    }
};

export const deleteGroup = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Hard delete or Soft delete? The model has no isActive for Group, but it has Status. 
        // Typically we might want to check for enrollments before deleting.
        // For now, let's just change status to CANCELLED as a soft delete equivalent, 
        // or actually allow delete if no enrollments.
        // Let's go with updating status to CANCELLED for safety.

        const updated = await prisma.group.update({
            where: { id: Number(id) },
            data: { status: 'CANCELLED' }
        });

        res.json({ message: 'Group cancelled successfully', group: updated });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting group' });
    }
};
