import express from 'express';
import { 
  createChapaPayment, 
  verifyChapaPayment, 
  getChapaPayments 
} from '../controllers/chapaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createChapaPayment);
router.get('/verify', verifyChapaPayment);
router.get('/my-payments', protect, getChapaPayments);

export default router;