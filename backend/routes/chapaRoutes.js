import express from 'express';
import { 
  createChapaPayment, 
  verifyChapaPayment, 
  getChapaPayments 
} from '../controllers/chapaController.js';
import { protect } from '../middleware/authMiddleware.js';
import { buyerOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/create', protect,buyerOnly, createChapaPayment);
router.get('/verify', verifyChapaPayment);
router.get('/my-payments', protect,buyerOnly, getChapaPayments);

export default router;