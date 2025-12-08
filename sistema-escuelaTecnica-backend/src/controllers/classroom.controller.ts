
import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const createClassroom = async (req: Request, res: Response) => {
    try {
        const { name, capacity, location, description } = req.body;
        const classroom = await prisma.classroom.create({
            data: {
                name,
                capacity: Number(capacity),
                location,
                description
            }
        });
        res.status(201).json(classroom);
    } catch (error) {
        res.status(400).json({ message: 'Error creating classroom' });
    }
};

export const getClassrooms = async (req: Request, res: Response) => {
    try {
        const classrooms = await prisma.classroom.findMany({
            where: { isActive: true }
        });
        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching classrooms' });
    }
};

export const updateClassroom = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { name, capacity, location, description, isActive } = req.body;

        const updateData: any = {}; // Using any for flexibility or better: explicit type construct

        if (name !== undefined) updateData.name = name;
        if (capacity !== undefined) updateData.capacity = Number(capacity);
        if (location !== undefined) updateData.location = location;
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        const classroom = await prisma.classroom.update({
            where: { id: Number(id) },
            data: updateData
        });
        res.json(classroom);
    } catch (error) {
        res.status(400).json({ message: 'Error updating classroom' });
    }
};

export const deleteClassroom = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.classroom.update({
            where: { id: Number(id) },
            data: { isActive: false }
        });
        res.json({ message: 'Classroom deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting classroom' });
    }
};
