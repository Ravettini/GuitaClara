import { Router } from 'express';
import { chat } from '../controllers/assistantController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/chat', chat);

export default router;

