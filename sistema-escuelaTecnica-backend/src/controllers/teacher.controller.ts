import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { hashPassword } from '../utils/auth.utils.js';
import { Prisma } from '@prisma/client';
import { uploadToCloudinary } from '../utils/file-upload.js';

export const createTeacher = async (req: Request, res: Response) => {
    try {
        let bodyData = req.body;
        // Handle FormData JSON string parsing
        if (req.body.data && typeof req.body.data === 'string') {
            try {
                bodyData = JSON.parse(req.body.data);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid JSON data in request' });
            }
        }

        const {
            // User info
            email,
            password,
            firstName,
            paternalSurname,
            maternalSurname,
            phone,

            // Teacher info
            documentType,
            documentNumber,
            specialization,
            hireDate,
            contractType,
            hourlyRate,
        } = bodyData;

        // Validations
        if (!email || !firstName || !paternalSurname || !documentNumber || !hireDate || !contractType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Check existing user
            const existingUser = await tx.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // 2. Create User
            const finalPassword = password || documentNumber || 'teacher123'; // Default password
            const hashedPassword = await hashPassword(finalPassword);

            let profileImageUrl: string | null = null;
            let cvUrl: string | null = null;

            // Handle file uploads
            if (req.files) {
                const files = req.files as { [fieldname: string]: Express.Multer.File[] };

                if (files['photo'] && files['photo'][0]) {
                    profileImageUrl = await uploadToCloudinary(files['photo'][0].buffer, 'teachers');
                }

                if (files['cv'] && files['cv'][0]) {
                    cvUrl = await uploadToCloudinary(files['cv'][0].buffer, 'teachers-cvs');
                }
            }

            // Generate Username
            const randomSuffix = Math.floor(100 + Math.random() * 900);
            const cleanPaternal = paternalSurname.replace(/\s+/g, '').toUpperCase();
            const username = `${firstName.charAt(0).toUpperCase()}${cleanPaternal}${randomSuffix}`;

            const newUser = await tx.user.create({
                data: {
                    email,
                    username, // Set generated username
                    passwordHash: hashedPassword,
                    firstName: firstName.toUpperCase(),
                    paternalSurname: paternalSurname.toUpperCase(),
                    maternalSurname: maternalSurname?.toUpperCase(),
                    phone,
                    profileImageUrl,
                    isActive: true,
                    userRoles: {
                        create: { role: { connect: { name: 'TEACHER' } } }
                    }
                }
            });

            // 3. Create Teacher
            const parsedHireDate = new Date(hireDate);
            if (isNaN(parsedHireDate.getTime())) {
                throw new Error('Invalid hire date');
            }

            const newTeacher = await tx.teacher.create({
                data: {
                    userId: newUser.id,
                    documentType: documentType as any,
                    documentNumber,
                    specialization: specialization?.toUpperCase(),
                    hireDate: parsedHireDate,
                    contractType: contractType as any,
                    hourlyRate: hourlyRate ? new Prisma.Decimal(hourlyRate) : null,
                    cvUrl,
                    isActive: true
                }
            });

            // 4. Return full object
            return await tx.teacher.findUniqueOrThrow({
                where: { id: newTeacher.id },
                include: {
                    user: true
                }
            });
        });

        res.status(201).json(result);

    } catch (error: any) {
        console.error('Error creating teacher:', error);
        res.status(400).json({
            message: error.message || 'Error creating teacher'
        });
    }
};

export const getTeachers = async (req: Request, res: Response) => {
    try {
        const teachers = await prisma.teacher.findMany({
            where: { deletedAt: null },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        paternalSurname: true,
                        maternalSurname: true,
                        email: true,
                        phone: true,
                        profileImageUrl: true,
                        isActive: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving teachers' });
    }
};

export const getTeacherById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const teacher = await prisma.teacher.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
                groups: true
            }
        });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving teacher details' });
    }
};

export const updateTeacher = async (req: Request, res: Response) => {
    const { id } = req.params;

    let bodyData = req.body;
    if (req.body.data && typeof req.body.data === 'string') {
        try {
            bodyData = JSON.parse(req.body.data);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid JSON data in request' });
        }
    } else if (req.body.data && typeof req.body.data === 'object') {
        bodyData = req.body.data;
    }

    const {
        firstName,
        paternalSurname,
        maternalSurname,
        phone,
        specialization,
        hireDate,
        contractType,
        hourlyRate,
        documentType,
        documentNumber
    } = bodyData;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Update Teacher Profile
            const teacherUpdateData: Prisma.TeacherUpdateInput = {};
            if (specialization !== undefined) teacherUpdateData.specialization = specialization.toUpperCase();
            if (hireDate !== undefined) teacherUpdateData.hireDate = new Date(hireDate);
            if (contractType !== undefined) teacherUpdateData.contractType = contractType as any;
            if (hourlyRate !== undefined) {
                if (hourlyRate === null || (typeof hourlyRate === 'string' && hourlyRate.trim() === '')) {
                    teacherUpdateData.hourlyRate = null;
                } else {
                    teacherUpdateData.hourlyRate = new Prisma.Decimal(hourlyRate);
                }
            }
            if (documentType !== undefined) teacherUpdateData.documentType = documentType as any;
            if (documentNumber !== undefined) teacherUpdateData.documentNumber = documentNumber;

            // Define userUpdateData explicitly before usage
            const userUpdateData: Prisma.UserUpdateInput = {};

            // Handle file uploads
            if (req.files) {
                const files = req.files as { [fieldname: string]: Express.Multer.File[] };

                if (files['cv'] && files['cv'][0]) {
                    teacherUpdateData.cvUrl = await uploadToCloudinary(files['cv'][0].buffer, 'teachers-cvs');
                }

                if (files['photo'] && files['photo'][0]) {
                    userUpdateData.profileImageUrl = await uploadToCloudinary(files['photo'][0].buffer, 'teachers');
                }
            }

            const updatedTeacher = await tx.teacher.update({
                where: { id: Number(id) },
                data: teacherUpdateData,
                include: { user: true }
            });

            // Update User Profile
            const userUpdateDataToApply: Prisma.UserUpdateInput = { ...userUpdateData };
            if (firstName !== undefined) userUpdateDataToApply.firstName = firstName.toUpperCase();
            if (paternalSurname !== undefined) userUpdateDataToApply.paternalSurname = paternalSurname.toUpperCase();
            if (maternalSurname !== undefined) userUpdateDataToApply.maternalSurname = maternalSurname.toUpperCase();
            if (phone !== undefined) userUpdateDataToApply.phone = phone;

            if (Object.keys(userUpdateDataToApply).length > 0) {
                await tx.user.update({
                    where: { id: updatedTeacher.userId },
                    data: userUpdateDataToApply
                });

                // Refresh user data in return object
                if (updatedTeacher.user) {
                    Object.assign(updatedTeacher.user, userUpdateDataToApply);
                }
            }

            return updatedTeacher;
        });

        res.json(result);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: 'Error updating teacher: ' + error.message });
    }
};

export const deleteTeacher = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const teacher = await tx.teacher.findUnique({ where: { id: Number(id) } });

            if (!teacher) {
                throw new Error('Teacher not found');
            }

            // Soft delete teacher
            await tx.teacher.update({
                where: { id: Number(id) },
                data: {
                    deletedAt: new Date(),
                    isActive: false
                }
            });

            // Deactivate user
            await tx.user.update({
                where: { id: teacher.userId },
                data: {
                    isActive: false
                }
            });

            return { message: 'Teacher deleted successfully' };
        });

        res.json(result);
    } catch (error: any) {
        if (error.message === 'Teacher not found') {
            res.status(404).json({ message: 'Teacher not found' });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Error deleting teacher' });
        }
    }
};
