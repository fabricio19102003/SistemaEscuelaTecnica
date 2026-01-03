import { Router } from 'express';
import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent, getStudentHistory, getEligibleStudents, getMyAcademicHistory } from '../controllers/student.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Routes
// TODO: Add auth middleware when frontend ready to send tokens: router.use(authenticateJWT);

import { upload } from '../middleware/upload.middleware.js';

router.get('/', getStudents);
router.get('/eligible', getEligibleStudents);
router.get('/me/history', authenticateJWT, getMyAcademicHistory);
router.get('/:id', getStudentById);
router.get('/:id/history', getStudentHistory);
router.post('/', upload.single('photo'), createStudent);
router.put('/:id', upload.single('photo'), updateStudent);
router.delete('/:id', deleteStudent);

export default router;
