import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { comparePassword, generateToken, hashPassword } from '../utils/auth.utils.js';

export const login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: identifier },
                    { email: identifier }
                ]
            },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        if (!user || !user.isActive || !user.passwordHash) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isValidPassword = await comparePassword(password, user.passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const roles = user.userRoles.map((ur: any) => ur.role.name);

        const token = generateToken({
            id: user.id,
            email: user.email,
            roles,
        });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                paternalSurname: user.paternalSurname,
                maternalSurname: user.maternalSurname,
                roles,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const register = async (req: Request, res: Response) => {
    // This is a basic registration endpoint, largely for development or admin use
    // In a real app, you might restrict this to Admins only
    const { email, password, firstName, paternalSurname, maternalSurname } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordHash = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                paternalSurname,
                maternalSurname,
                // Default role assignment could go here if needed, or handle separately
            },
        });

        res.status(201).json({ message: 'User created successfully', userId: newUser.id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
