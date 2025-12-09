import { type Request, type Response } from 'express';
import prisma from '../utils/prisma.js';

export const getScheduleTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await prisma.scheduleTemplate.findMany({
            include: {
                items: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.json(templates);
    } catch (error) {
        console.error('Error fetching schedule templates:', error);
        res.status(500).json({ message: 'Error fetching schedule templates' });
    }
};

export const createScheduleTemplate = async (req: Request, res: Response) => {
    try {
        const { name, description, items } = req.body;

        if (!name || !items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid data' });
        }

        const template = await prisma.scheduleTemplate.create({
            data: {
                name,
                description,
                items: {
                    create: items.map((item: any) => ({
                        dayOfWeek: item.dayOfWeek,
                        startTime: parseTime(item.startTime),
                        endTime: parseTime(item.endTime)
                    }))
                }
            },
            include: {
                items: true
            }
        });

        res.status(201).json(template);
    } catch (error: any) {
        console.error('Error creating schedule template:', error);

        // Handle Prisma Unique Constraint Violation
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'El nombre de la plantilla ya existe. Por favor elige otro.' });
        }

        res.status(400).json({ message: error.message || 'Error creating schedule template' });
    }
};

const parseTime = (timeString: string): Date => {
    // Expected formats: "HH:mm" or "HH:mm:ss"
    const [hours, minutes] = timeString.split(':');
    const date = new Date('1970-01-01T00:00:00Z');
    date.setUTCHours(Number(hours));
    date.setUTCMinutes(Number(minutes));
    return date;
};

export const deleteScheduleTemplate = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.scheduleTemplate.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting template' });
    }
};
