import { Router } from 'express';
import {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    deleteGroup
} from '../controllers/group.controller.js';
import { submitGrades, closeGroup } from '../controllers/group-lifecycle.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// Lifecycle routes
router.post('/:groupId/submit-grades', authenticateJWT, submitGrades);
router.post('/:groupId/close', authenticateJWT, authorizeRoles('ADMIN'), closeGroup);

export default router;
