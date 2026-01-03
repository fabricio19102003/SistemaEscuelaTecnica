import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { GroupStatus, EnrollmentStatus } from '@prisma/client';

export const submitGrades = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const userId = (req as any).user?.id;

    console.log(`[submitGrades] Request for groupId: ${groupId} by userId: ${userId}`);

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID missing' });
    }

    try {
        const group = await prisma.group.findUnique({
            where: { id: Number(groupId) },
            include: {
                teacher: {
                    include: { user: true }
                }
            }
        });

        if (!group) {
            console.warn(`[submitGrades] Group not found: ${groupId}`);
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.teacher) {
            console.error(`[submitGrades] Data Integrity Error: Group ${groupId} has no teacher assigned.`);
            return res.status(500).json({ message: 'Data integrity error: Group has no teacher assigned.' });
        }

        // Verify teacher ownership
        // Ensure type compatibility (DB is Int, JWT payload might be number or string)
        if (Number(group.teacher.userId) !== Number(userId)) {
            console.warn(`[submitGrades] Forbidden: Teacher ${group.teacher.userId} != Request User ${userId}`);
            // TODO: Allow ADMIN override if needed, but for now strict.
            return res.status(403).json({ message: 'Only the assigned teacher can submit grades' });
        }

        if (group.status === GroupStatus.GRADES_SUBMITTED || group.status === GroupStatus.COMPLETED) {
            return res.status(400).json({ message: 'Grades already submitted or course completed' });
        }

        // Update status
        const updatedGroup = await prisma.group.update({
            where: { id: Number(groupId) },
            data: { status: GroupStatus.GRADES_SUBMITTED }
        });

        console.log(`[submitGrades] Group status updated to GRADES_SUBMITTED`);

        // Notify Admins
        try {
            const admins = await prisma.user.findMany({
                where: {
                    userRoles: {
                        some: {
                            role: { name: 'ADMIN' }
                        }
                    }
                }
            });

            if (admins.length > 0) {
                const teacherName = `${group.teacher.user.firstName} ${group.teacher.user.paternalSurname}`;
                const notificationPromises = admins.map(admin =>
                    prisma.notification.create({
                        data: {
                            userId: admin.id,
                            title: 'Notas Finalizadas',
                            message: `El docente ${teacherName} ha finalizado la carga de notas para el curso ${group.name} (${group.code}). Listo para revisión y cierre.`,
                            type: 'INFO'
                        }
                    })
                );
                await Promise.all(notificationPromises);
                console.log(`[submitGrades] Notifications sent to ${admins.length} admins`);
            }
        } catch (notifError) {
            // Non-blocking error
            console.error('[submitGrades] Error sending notifications:', notifError);
        }

        res.json({ message: 'Grades submitted successfully', group: updatedGroup });

    } catch (error: any) {
        console.error('[submitGrades] Critical Error:', error);
        res.status(500).json({ message: 'Error submitting grades: ' + (error instanceof Error ? error.message : 'Unknown error') });
    }
};

export const closeGroup = async (req: Request, res: Response) => {
    const { groupId } = req.params;

    try {
        const group = await prisma.group.findUnique({
            where: { id: Number(groupId) },
            include: { enrollments: true }
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Update Group
            await tx.group.update({
                where: { id: Number(groupId) },
                data: { status: GroupStatus.COMPLETED }
            });

            // 2. Update Enrollments
            await tx.enrollment.updateMany({
                where: {
                    groupId: Number(groupId),
                    status: EnrollmentStatus.ACTIVE
                },
                data: { status: EnrollmentStatus.COMPLETED }
            });
        });

        res.json({ message: 'Curso cerrado correctamente.' });
    } catch (error: any) {
        console.error('Error closing group:', error);
        res.status(500).json({ message: 'Error closing group: ' + error.message });
    }
};
