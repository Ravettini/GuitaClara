import { Router } from 'express';
import {
  getFixedTermDeposits,
  getFixedTermDeposit,
  createFixedTermDeposit,
  updateFixedTermDeposit,
  deleteFixedTermDeposit,
} from '../controllers/fixedTermDepositController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const fixedTermSchema = z.object({
  principalAmount: z.number().positive('Principal amount must be positive'),
  currency: z.string().optional(),
  tna: z.number().positive('TNA must be positive'),
  startDate: z.string().or(z.date()),
  termInDays: z.number().int().positive('Term in days must be positive'),
  bankName: z.string().optional(),
  autoRenew: z.boolean().optional(),
});

router.use(authenticate);
router.get('/', getFixedTermDeposits);
router.get('/:id', getFixedTermDeposit);
router.post('/', validate(fixedTermSchema), createFixedTermDeposit);
router.put('/:id', validate(fixedTermSchema.partial()), updateFixedTermDeposit);
router.delete('/:id', deleteFixedTermDeposit);

export default router;

