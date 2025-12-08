
import { Router } from 'express';
import {
    createClassroom,
    getClassrooms,
    updateClassroom,
    deleteClassroom
} from '../controllers/classroom.controller.js';

const router = Router();

router.get('/', getClassrooms);
router.post('/', createClassroom);
router.put('/:id', updateClassroom);
router.delete('/:id', deleteClassroom);

export default router;
