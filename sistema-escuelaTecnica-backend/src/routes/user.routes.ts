import { Router } from 'express';
import {
    getAllUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    getUserMetrics,
    getAllRoles
} from '../controllers/user.controller.js';

const router = Router();

// Dashboard Metrics
router.get('/metrics', getUserMetrics);
router.get('/roles', getAllRoles);

// CRUD
router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/status', toggleUserStatus);

export default router;
