import { Router } from 'express';
import {
    getAgreements,
    getAgreementById,
    createAgreement,
    updateAgreement,
    deleteAgreement
} from '../controllers/agreement.controller.js';
const router = Router();

// router.use(authenticate); // Add later if needed

router.get('/', getAgreements);
router.get('/:id', getAgreementById);
router.post('/', createAgreement);
router.put('/:id', updateAgreement);
router.delete('/:id', deleteAgreement);

export default router;
