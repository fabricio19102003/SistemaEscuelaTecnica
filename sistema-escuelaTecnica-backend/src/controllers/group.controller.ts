import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import type { Prisma } from '@prisma/client';

// ==========================================
// GROUPS CONTROLER
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
