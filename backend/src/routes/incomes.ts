import { Router } from 'express';
import {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../controllers/incomeController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const incomeSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().optional(),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  sourceType: z.string().optional(),
});

router.use(authenticate);
router.get('/', getIncomes);
router.get('/:id', getIncome);
router.post('/', validate(incomeSchema), createIncome);
router.put('/:id', validate(incomeSchema.partial()), updateIncome);
router.delete('/:id', deleteIncome);

export default router;

