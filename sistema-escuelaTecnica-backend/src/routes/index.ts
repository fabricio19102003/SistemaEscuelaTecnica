import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import teacherRoutes from './teacher.routes.js';
import courseRoutes from './course.routes.js';
import schoolRoutes from './school.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/schools', schoolRoutes);
router.use('/academic', courseRoutes); // Mounting under /academic for variety, or keep flat. Let's use /academic so endpoints are /academic/courses

export default router;
