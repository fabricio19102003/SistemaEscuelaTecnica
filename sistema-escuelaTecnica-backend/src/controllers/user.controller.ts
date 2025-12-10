import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { hashPassword } from '../utils/auth.utils.js';

// Get all users with roles
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform to flatten roles for easier frontend consumption if needed, 
        // or just send as is. sending as is for now.
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Create new user
export const createUser = async (req: Request, res: Response) => {
    const { firstName, paternalSurname, maternalSurname, email, username, password, roles } = req.body;

    try {
        // Validation
        if (!username || !password || !firstName || !paternalSurname) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // Check duplicates
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email: email || undefined } // only check email if provided
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'El usuario o correo ya existe' });
        }

        const passwordHash = await hashPassword(password);

        // Transaction to create user and assign roles
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    firstName,
                    paternalSurname,
                    maternalSurname,
                    email,
                    username,
                    passwordHash,
                    isActive: true
                }
            });

            if (roles && Array.isArray(roles) && roles.length > 0) {
                // Assuming roles is array of role IDs
                const userRolesData = roles.map((roleId: number) => ({
                    userId: user.id,
                    roleId
                }));
                await tx.userRole.createMany({
                    data: userRolesData
                });
            }

            return user;
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { firstName, paternalSurname, maternalSurname, email, username, password, roles, isActive } = req.body;
    const userId = Number(id);

    try {
        const passwordHash = password ? await hashPassword(password) : undefined;

        await prisma.$transaction(async (tx) => {
            // 1. Update basic info
            await tx.user.update({
                where: { id: userId },
                data: {
                    firstName,
                    paternalSurname,
                    maternalSurname,
                    email,
                    username,
                    ...(passwordHash && { passwordHash }), // Only update if new password provided
                    ...(isActive !== undefined && { isActive })
                }
            });

            // 2. Update roles if provided
            if (roles && Array.isArray(roles)) {
                // Remove all existing roles
                await tx.userRole.deleteMany({
                    where: { userId }
                });

                // Add new roles
                if (roles.length > 0) {
                    const userRolesData = roles.map((roleId: number) => ({
                        userId,
                        roleId
                    }));
                    await tx.userRole.createMany({
                        data: userRolesData
                    });
                }
            }
        });

        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { userRoles: { include: { role: true } } }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

// Toggle Status (Enable/Disable)
export const toggleUserStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = Number(id);

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error toggling status:', error);
        res.status(500).json({ message: 'Error al cambiar estado' });
    }
};

// Get Dashboard Metrics
export const getUserMetrics = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const activeUsers = await prisma.user.count({ where: { isActive: true } });
        const inactiveUsers = totalUsers - activeUsers;

        // Group by Role
        // Prisma doesn't support complex deep groupBy easily on relations in one go, 
        // but we can query UserRole grouping.
        const rolesDistribution = await prisma.userRole.groupBy({
            by: ['roleId'],
            _count: {
                userId: true
            }
        });

        // Resolve Role Names
        const roles = await prisma.role.findMany();
        const rolesMap = roles.reduce((acc: any, role) => {
            acc[role.id] = role.name;
            return acc;
        }, {});

        const distribution = rolesDistribution.map(item => ({
            role: rolesMap[item.roleId] || 'Unknown',
            count: item._count.userId
        }));

        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers,
            rolesDistribution: distribution
        });
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ message: 'Error al obtener métricas' });
    }
};
// Get All Roles
export const getAllRoles = async (req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany();
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Error al obtener roles' });
    }
};
