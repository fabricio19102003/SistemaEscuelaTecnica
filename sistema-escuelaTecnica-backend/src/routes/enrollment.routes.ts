import { Router } from 'express';
import { createEnrollment, getEnrollments, getEnrollmentById, deleteEnrollment } from '../controllers/enrollment.controller.js';

const router = Router();

router.post('/', createEnrollment);
router.get('/', getEnrollments);
router.get('/:id', getEnrollmentById);
router.delete('/:id', deleteEnrollment);

export default router;
