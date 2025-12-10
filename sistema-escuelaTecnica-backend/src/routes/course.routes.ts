import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.js';
import {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    createLevel
} from '../controllers/course.controller.js';

const router = Router();

// Courses
// Courses
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', upload.single('image'), createCourse);
router.put('/:id', upload.single('image'), updateCourse);
router.delete('/:id', deleteCourse);

// Levels (Nested under courses usually, but here flat for simplicity in router definition, though logic requires courseId)
router.post('/:courseId/levels', createLevel);



export default router;
