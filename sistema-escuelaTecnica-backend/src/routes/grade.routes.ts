import { Router } from 'express';
import { getGradesByGroup, saveGrades, getReportCardData, getGradesByCourse, getAllGrades, getGroupReportData, getSchoolStatistics } from '../controllers/grade.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateJWT); // Protect all grade routes

router.get('/group/:groupId', getGradesByGroup);
router.get('/course/:courseId', getGradesByCourse);
router.post('/save', saveGrades);
router.get('/report-card/:enrollmentId', getReportCardData);
router.get('/report/group/:groupId', getGroupReportData);
router.get('/stats/all', getAllGrades);
router.get('/stats/schools', getSchoolStatistics);

export default router;
