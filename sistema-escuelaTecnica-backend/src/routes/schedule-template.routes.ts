import { Router } from 'express';
import { getScheduleTemplates, createScheduleTemplate, deleteScheduleTemplate } from '../controllers/schedule-template.controller.js';

const router = Router();

router.get('/', getScheduleTemplates);
router.post('/', createScheduleTemplate);
router.delete('/:id', deleteScheduleTemplate);

export default router;
