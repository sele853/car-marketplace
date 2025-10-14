import express from 'express';
import { createCar, deleteCar, getCar, getCars, updateCar } from '../controllers/carController.js';
import {protect} from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.get('/',getCars);
router.get('/:id',getCar);
router.post('/',protect,upload.array('images',5),createCar);
router.put('/:id',protect,upload.fields([
  { name: 'images', maxCount: 5 } 
]),updateCar);
router.delete('/:id',protect,deleteCar);

export default router;