import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import teacherRoutes from './teacher.routes.js';
import courseRoutes from './course.routes.js';
import schoolRoutes from './school.routes.js';
import classroomRoutes from './classroom.routes.js';
import scheduleTemplateRoutes from './schedule-template.routes.js';
import groupRoutes from './group.routes.js';
import agreementRoutes from './agreement.routes.js';
import enrollmentRoutes from './enrollment.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/schools', schoolRoutes);
router.use('/', courseRoutes); // Mounting at root so paths are /courses, /groups, etc.
router.use('/groups', groupRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/schedule-templates', scheduleTemplateRoutes);
router.use('/agreements', agreementRoutes);
router.use('/enrollments', enrollmentRoutes);

export default router;
