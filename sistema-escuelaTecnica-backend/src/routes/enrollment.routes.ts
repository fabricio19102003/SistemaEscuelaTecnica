import { Router } from 'express';
import { createEnrollment, getEnrollments, getEnrollmentById, deleteEnrollment, getEnrollmentReport } from '../controllers/enrollment.controller.js';

const router = Router();

router.post('/', createEnrollment);
router.get('/', getEnrollments);
router.get('/report', getEnrollmentReport); // Specific route goes first
router.get('/:id', getEnrollmentById);
router.delete('/:id', deleteEnrollment);

export default router;
