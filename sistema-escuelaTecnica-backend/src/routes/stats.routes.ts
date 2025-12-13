import { Router } from 'express';
import { getFinancialStatsByCourse } from '../controllers/stats.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Only ADMIN can view financial stats
router.get('/financial/revenue-by-course', authenticateJWT, authorizeRoles('ADMIN'), getFinancialStatsByCourse);

export default router;
