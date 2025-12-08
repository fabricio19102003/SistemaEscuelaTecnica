import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { Prisma } from '@prisma/client';

export const getSchools = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const where: Prisma.SchoolWhereInput = {
            isActive: true
        };

        if (search) {
            where.OR = [
                { name: { contains: String(search) } }, // Remove mode: 'insensitive' as MySQL default collation is usually insensitive, or check DB
                // If using PostgreSQL: { name: { contains: String(search), mode: 'insensitive' } }
                { code: { contains: String(search) } }
            ];
        }

        const schools = await prisma.school.findMany({
            where,
            orderBy: { name: 'asc' }
        });
        res.json(schools);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving schools' });
    }
};

export const getSchoolById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const school = await prisma.school.findUnique({
            where: { id: Number(id) }
        });

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.json(school);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving school' });
    }
};

export const createSchool = async (req: Request, res: Response) => {
    try {
        const {
            name,
            // code, // Auto-generated
            sieCode,
            directorName,
            directorPhone,
            levels,
            address,
            district,
            city,
            phone,
            email,
            contactPerson,
            contactPhone
        } = req.body;

        // Auto-generate Code: SCH-{YEAR}-{RANDOM} or similar
        // Let's use SCH-{YEAR}-{TIMESTAMP_SUFFIX} for uniqueness or check DB count
        const timestampSuffix = Date.now().toString().slice(-4);
        const code = `SCH-${new Date().getFullYear()}-${timestampSuffix}`;

        const newSchool = await prisma.school.create({
            data: {
                name,
                code,
                sieCode,
                directorName,
                directorPhone,
                levels: levels ? levels : Prisma.JsonNull,
                address,
                district,
                city,
                phone,
                email,
                contactPerson,
                contactPhone
            }
        });

        res.status(201).json(newSchool);
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(400).json({ message: 'School with this SIE code already exists' });
        }
        res.status(400).json({ message: 'Error creating school' });
    }
};

export const updateSchool = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const {
            name,
            sieCode,
            directorName,
            directorPhone,
            levels,
            address,
            district,
            city,
            phone,
            email,
            contactPerson,
            contactPhone,
            isActive
        } = req.body;

        const updatedSchool = await prisma.school.update({
            where: { id: Number(id) },
            data: {
                name,
                sieCode,
                directorName,
                directorPhone,
                levels: levels ? levels : undefined,
                address,
                district,
                city,
                phone,
                email,
                contactPerson,
                contactPhone,
                isActive
            }
        });

        res.json(updatedSchool);
    } catch (error) {
        res.status(400).json({ message: 'Error updating school' });
    }
};

export const deleteSchool = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Soft delete
        await prisma.school.update({
            where: { id: Number(id) },
            data: { isActive: false }
        });
        res.json({ message: 'School deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting school' });
    }
};
