import { Router } from 'express';
import {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    deleteGroup
} from '../controllers/group.controller.js';

const router = Router();

router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

export default router;
