import { Router } from 'express';
import {
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher
} from '../controllers/teacher.controller.js'; // Note: Ensure extension is correct for your config (usually .js in imports if using ESM in TS/Node setup, or try without if standard)
// Checking other files... student.routes.ts probably uses .js if "type":"module" in package.json or standard ts-node.
// Let's assume .js for now based on previous controller imports I saw.
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.post('/', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'cv', maxCount: 1 }]), createTeacher);
router.put('/:id', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'cv', maxCount: 1 }]), updateTeacher);
router.delete('/:id', deleteTeacher);

export default router;
