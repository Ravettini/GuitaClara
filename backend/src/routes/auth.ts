import { Router } from 'express';
import {
  registerController,
  loginController,
  refreshTokenController,
  meController,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

router.post('/register', validateRegister, registerController);
router.post('/login', validateLogin, loginController);
router.post('/refresh', refreshTokenController);
router.get('/me', authenticate, meController);

export default router;

