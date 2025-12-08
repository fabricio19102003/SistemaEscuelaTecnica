import { Router } from 'express';
import {
    createCourse,
    getCourses,
    createLevel,
    createGroup,
    getGroups
} from '../controllers/course.controller.js';

const router = Router();

// Courses
router.get('/courses', getCourses);
router.post('/courses', createCourse);

// Levels (Nested under courses usually, but here flat for simplicity in router definition, though logic requires courseId)
router.post('/courses/:courseId/levels', createLevel);

// Groups (Independent entity mostly)
router.get('/groups', getGroups);
router.post('/groups', createGroup);

export default router;
