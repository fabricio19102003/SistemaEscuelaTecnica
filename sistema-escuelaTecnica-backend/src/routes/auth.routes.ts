import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
// router.post('/register', register); // Uncomment if open registration is desired

export default router;
