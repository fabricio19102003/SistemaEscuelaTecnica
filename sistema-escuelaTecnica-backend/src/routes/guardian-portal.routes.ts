import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import * as guardianPortalController from '../controllers/guardian-portal.controller.js';

const router = Router();

// All routes require authentication and GUARDIAN role
router.use(authenticateJWT);
router.use(authorizeRoles('GUARDIAN'));

// Get my assigned students
router.get('/my-students', guardianPortalController.getMyStudents);

// Get courses for a specific student
router.get('/student-courses/:studentId', guardianPortalController.getStudentCourses);

// Get grades for a specific student's enrollment
router.get('/student-grades/:studentId/:enrollmentId', guardianPortalController.getStudentGrades);

// Get attendance for a specific student's enrollment
router.get('/student-attendance/:studentId/:enrollmentId', guardianPortalController.getStudentAttendance);

export default router;
