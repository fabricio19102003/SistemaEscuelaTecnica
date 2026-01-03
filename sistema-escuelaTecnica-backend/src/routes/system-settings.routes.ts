import { Router } from 'express';
import { getSetting, updateSetting, getAllSettings } from '../controllers/system-settings.controller.js';
import { authenticateJWT as authenticateToken, authorizeRoles as requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Base path: /settings

// Admin only routes
// Basic settings access for all authenticated users
router.get('/', authenticateToken, getAllSettings);
router.get('/:key', authenticateToken, getSetting);
router.put('/:key', authenticateToken, requireRole('ADMIN'), updateSetting);

export default router;
