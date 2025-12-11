import { Router } from 'express';
import {
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getTeacherAssignments,
    getGroupEnrollments
} from '../controllers/teacher.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Teacher portal routes
router.get('/assignments/my-courses', authenticateJWT, getTeacherAssignments);
router.get('/assignments/:groupId/students', authenticateJWT, getGroupEnrollments);

// Admin routes

router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.post('/', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'cv', maxCount: 1 }]), createTeacher);
router.put('/:id', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'cv', maxCount: 1 }]), updateTeacher);
router.delete('/:id', deleteTeacher);

export default router;
