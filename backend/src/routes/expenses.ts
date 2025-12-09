import { Router } from 'express';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const expenseSchema = z.object({
  categoryId: z.string().uuid('Category ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().optional(),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  paymentMethod: z.string().optional(),
  tags: z.any().optional(),
});

router.use(authenticate);
router.get('/', getExpenses);
router.get('/:id', getExpense);
router.post('/', validate(expenseSchema), createExpense);
router.put('/:id', validate(expenseSchema.partial()), updateExpense);
router.delete('/:id', deleteExpense);

export default router;

