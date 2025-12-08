import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import teacherRoutes from './teacher.routes.js';
import courseRoutes from './course.routes.js';
import schoolRoutes from './school.routes.js';
import classroomRoutes from './classroom.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/schools', schoolRoutes);
router.use('/', courseRoutes); // Mounting at root so paths are /courses, /groups, etc.
router.use('/classrooms', classroomRoutes);

export default router;
