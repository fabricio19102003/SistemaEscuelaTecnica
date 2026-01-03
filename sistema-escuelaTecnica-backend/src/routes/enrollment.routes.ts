import { Router } from 'express';
import * as enrollmentController from '../controllers/enrollment.controller.js';

const router = Router();

router.post('/', enrollmentController.createEnrollment);
router.get('/', enrollmentController.getEnrollments);
router.get('/report', enrollmentController.getEnrollmentReport); // Move up to avoid collision with :id
router.get('/:id', enrollmentController.getEnrollmentById);
router.delete('/:id', enrollmentController.deleteEnrollment);

// Auto Promotion
router.get('/candidates/course/:courseId', enrollmentController.getApprovedCandidateStudents);
router.post('/auto-promote', enrollmentController.autoPromoteStudents);

export default router;
