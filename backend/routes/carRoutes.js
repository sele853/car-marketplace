import express from 'express';
import { createCar, deleteCar, getCar, getCars, updateCar } from '../controllers/carController.js';
import {protect} from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';
import { sellerOrAdminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/',getCars);
router.get('/:id',getCar);
router.post('/',protect,sellerOrAdminOnly,upload.array('images',5),createCar);
router.put('/:id',protect,sellerOrAdminOnly,upload.fields([
  { name: 'images', maxCount: 5 } 
]),updateCar);
router.delete('/:id',protect,sellerOrAdminOnly,deleteCar);

export default router;