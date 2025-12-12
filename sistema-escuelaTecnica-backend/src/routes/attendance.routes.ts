import { Router } from 'express';
import { getAttendanceByGroupAndDate, saveAttendanceBatch, getAttendanceStats } from '../controllers/attendance.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all routes
router.use(authenticateJWT);

// Get attendance for a group and date
router.get('/:groupId/date', getAttendanceByGroupAndDate);

// Get attendance stats for a group
router.get('/:groupId/stats', getAttendanceStats);

// Save/Update attendance batch
router.post('/batch', saveAttendanceBatch);

export default router;
