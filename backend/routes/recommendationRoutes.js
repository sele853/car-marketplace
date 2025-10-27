import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getRecommendations } from '../controllers/recommendationController.js';
import { buyerOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect,buyerOnly, getRecommendations);

export default router;