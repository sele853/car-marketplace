import express from 'express';
import { signup, login } from '../controllers/authController.js';
import validatePassword from '../middleware/validatePassword.js';

const router = express.Router();

router.post('/signup', validatePassword, signup);
router.post('/login', login);

export default router;