import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';
import {
  getUsers,
  toggleUserBlock,
  getCars,
  updateCarStatus,
  deleteCar,
  getPayments,
  getAnalytics
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:userId/block', protect, adminOnly, toggleUserBlock);
router.get('/cars', protect, adminOnly, getCars);
router.put('/cars/:carId/status', protect, adminOnly, updateCarStatus);
router.delete('/cars/:carId', protect, adminOnly, deleteCar);
router.get('/payments', protect, adminOnly, getPayments);
router.get('/analytics', protect, adminOnly, getAnalytics);

export default router;