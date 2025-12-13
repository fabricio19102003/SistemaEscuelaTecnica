import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import * as studentPortalController from '../controllers/student-portal.controller.js';

const router = Router();

// All routes require authentication and STUDENT role
router.use(authenticateJWT);
router.use(authorizeRoles('STUDENT'));

// Get my active courses
router.get('/my-courses', studentPortalController.getMyCourses);

// Get my grades for a specific enrollment
router.get('/my-grades/:enrollmentId', studentPortalController.getMyGrades);

// Get my academic history
router.get('/my-academic-history', studentPortalController.getMyAcademicHistory);

// Get my attendance for a specific enrollment
router.get('/my-attendance/:enrollmentId', studentPortalController.getMyAttendance);

export default router;
