import { Router } from 'express';
import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent, getStudentHistory } from '../controllers/student.controller.js';
// import { authenticate, requireRole } from '../middleware/auth.middleware'; // TODO: Enable auth middleware later

const router = Router();

// Routes
// TODO: Add auth middleware when frontend ready to send tokens: router.use(authenticate);

import { upload } from '../middleware/upload.middleware.js';

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.get('/:id/history', getStudentHistory);
router.post('/', upload.single('photo'), createStudent);
router.put('/:id', upload.single('photo'), updateStudent);
router.delete('/:id', deleteStudent);

export default router;
