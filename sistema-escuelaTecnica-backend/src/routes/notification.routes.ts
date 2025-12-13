import { Router } from 'express';
import {
    sendNotification,
    broadcastNotification,
    sendBulkNotifications,
    getMyNotifications,
    markAsRead,
    markAllAsRead
} from '../controllers/notification.controller';
import { authenticateJWT as authenticateToken, authorizeRoles as requireRole } from '../middleware/auth.middleware';

const router = Router();

// Get my notifications
router.get('/', authenticateToken, getMyNotifications);

// Mark as read
router.patch('/:id/read', authenticateToken, markAsRead);
router.patch('/read-all', authenticateToken, markAllAsRead);

// Send - Admin only
router.post('/send', authenticateToken, requireRole('ADMIN'), sendNotification);
router.post('/broadcast', authenticateToken, requireRole('ADMIN'), broadcastNotification);
router.post('/send-bulk', authenticateToken, requireRole('ADMIN'), sendBulkNotifications);

export default router;
