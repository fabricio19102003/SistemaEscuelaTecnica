import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

// Send a single notification
export const sendNotification = async (req: Request, res: Response) => {
    try {
        const { userId, title, message, type } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({ message: 'Faltan datos requeridos (userId, title, message)' });
        }

        const notification = await prisma.notification.create({
            data: {
                userId: Number(userId),
                title,
                message,
                type: type || 'INFO'
            }
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ message: 'Error al enviar notificación' });
    }
};

// Broadcast notification to a Role (e.g. TEACHER, STUDENT)
export const broadcastNotification = async (req: Request, res: Response) => {
    try {
        const { roleName, title, message, type } = req.body; // roleName: 'TEACHER', 'STUDENT'

        if (!roleName || !title || !message) {
            return res.status(400).json({ message: 'Faltan datos requeridos (roleName, title, message)' });
        }

        // Find role ID
        const role = await prisma.role.findUnique({
            where: { name: roleName }
        });

        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        // Find all users with this role
        const userRoles = await prisma.userRole.findMany({
            where: { roleId: role.id },
            select: { userId: true }
        });

        if (userRoles.length === 0) {
            return res.json({ message: 'No hay usuarios con este rol para notificar', count: 0 });
        }

        // Create notifications in bulk
        const notificationsData = userRoles.map(ur => ({
            userId: ur.userId,
            title,
            message,
            type: type || 'INFO',
            isRead: false,
            createdAt: new Date()
        }));

        await prisma.notification.createMany({
            data: notificationsData
        });

        res.json({ message: `Notificación enviada a ${notificationsData.length} usuarios`, count: notificationsData.length });

    } catch (error) {
        console.error('Error broadcasting notification:', error);
        res.status(500).json({ message: 'Error al enviar notificación masiva' });
    }
};

// Send bulk notification to a list of User IDs (e.g. specific students)
export const sendBulkNotifications = async (req: Request, res: Response) => {
    try {
        const { userIds, title, message, type } = req.body;

        if (!userIds || !Array.isArray(userIds) || !title || !message) {
            return res.status(400).json({ message: 'Faltan datos requeridos (userIds array, title, message)' });
        }

        const notificationsData = userIds.map((id: number) => ({
            userId: Number(id),
            title,
            message,
            type: type || 'INFO',
            isRead: false,
            createdAt: new Date()
        }));

        await prisma.notification.createMany({
            data: notificationsData
        });

        res.json({ message: `Notificación enviada a ${notificationsData.length} usuarios`, count: notificationsData.length });

    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        res.status(500).json({ message: 'Error al enviar notificaciones masivas' });
    }
};


export const getMyNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ message: 'No autenticado' });

        const notifications = await prisma.notification.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50
        });

        const unreadCount = await prisma.notification.count({
            where: { userId: Number(userId), isRead: false }
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error al obtener notificaciones' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        // Verify ownership for security
        const notification = await prisma.notification.findFirst({
            where: { id: Number(id), userId: Number(userId) }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        await prisma.notification.update({
            where: { id: Number(id) },
            data: { isRead: true }
        });

        res.json({ message: 'Marcada como leída' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar notificación' });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        await prisma.notification.updateMany({
            where: { userId: Number(userId), isRead: false },
            data: { isRead: true }
        });
        res.json({ message: 'Todas marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar notificaciones' });
    }
};
