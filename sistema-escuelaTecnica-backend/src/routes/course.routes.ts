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
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.post('/courses', upload.single('image'), createCourse);
router.put('/courses/:id', upload.single('image'), updateCourse);
router.delete('/courses/:id', deleteCourse);

// Levels (Nested under courses usually, but here flat for simplicity in router definition, though logic requires courseId)
router.post('/courses/:courseId/levels', createLevel);



export default router;
