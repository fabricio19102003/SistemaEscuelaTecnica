import { Router } from 'express';
import {
    createSchool,
    deleteSchool,
    getSchoolById,
    getSchools,
    updateSchool
} from '../controllers/school.controller.js';
// import { authenticate, authorize } from '../middleware/auth.middleware.js'; // Add later if needed

const router = Router();

// Public/Protected routes
router.get('/', getSchools);
router.get('/:id', getSchoolById);
router.post('/', createSchool);
router.put('/:id', updateSchool);
router.delete('/:id', deleteSchool);

export default router;
