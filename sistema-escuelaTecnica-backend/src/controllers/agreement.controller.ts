import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { Prisma } from '@prisma/client';

export const getAgreements = async (req: Request, res: Response) => {
    try {
        const { search, isActive } = req.query;

        const where: Prisma.AgreementWhereInput = {};

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        if (search) {
            where.OR = [
                { agreementCode: { contains: String(search) } },
                { name: { contains: String(search) } },
                { schools: { some: { name: { contains: String(search) } } } }
            ];
        }

        const agreements = await prisma.agreement.findMany({
            where,
            include: {
                _count: {
                    select: { schools: true }
                },
                schools: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(agreements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving agreements' });
    }
};

export const getAgreementById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const agreement = await prisma.agreement.findUnique({
            where: { id: Number(id) },
            include: {
                schools: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found' });
        }

        res.json(agreement);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving agreement' });
    }
};

export const createAgreement = async (req: Request, res: Response) => {
    try {
        const {
            name,
            discountType,
            discountValue,
            startDate,
            endDate,
            notes,
            schoolIds
        } = req.body;

        // Generate Agreement Code: AG-{YEAR}-{RANDOM}
        const timestampSuffix = Date.now().toString().slice(-6);
        const agreementCode = `AG-${new Date().getFullYear()}-${timestampSuffix}`;

        const newAgreement = await prisma.agreement.create({
            data: {
                name,
                agreementCode,
                discountType,
                discountValue,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                notes,
                schools: schoolIds && schoolIds.length > 0 ? {
                    connect: schoolIds.map((id: number) => ({ id: Number(id) }))
                } : undefined
            }
        });

        res.status(201).json(newAgreement);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error creating agreement' });
    }
};

export const updateAgreement = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const {
            name,
            discountType,
            discountValue,
            startDate,
            endDate,
            notes,
            isActive,
            schoolIds
        } = req.body;

        const updateData: Prisma.AgreementUpdateInput = {
            name,
            discountType,
            discountValue,
            notes,
            isActive
        };

        if (startDate) {
            updateData.startDate = new Date(startDate);
        }

        if (endDate !== undefined) {
            updateData.endDate = endDate ? new Date(endDate) : null;
        }

        if (schoolIds !== undefined) {
            updateData.schools = {
                set: schoolIds.map((id: number) => ({ id: Number(id) }))
            };
        }

        const updatedAgreement = await prisma.agreement.update({
            where: { id: Number(id) },
            data: updateData
        });

        res.json(updatedAgreement);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error updating agreement' });
    }
};

export const deleteAgreement = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Soft delete
        await prisma.agreement.update({
            where: { id: Number(id) },
            data: { isActive: false }
        });
        res.json({ message: 'Agreement deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting agreement' });
    }
};
