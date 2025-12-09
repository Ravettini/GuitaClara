import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} from '../controllers/budgetController'
import { validate } from '../middleware/validation'
import { z } from 'zod'

const router = Router()

const budgetSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().optional(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  repeat: z.boolean().optional(),
  repeatUntil: z.string().datetime().nullable().optional(),
  notes: z.string().optional(),
})

router.use(authenticate)

router.get('/summary', getBudgetSummary)
router.get('/', getAllBudgets)
router.get('/:id', getBudgetById)
router.post('/', validate(budgetSchema), createBudget)
router.put('/:id', validate(budgetSchema.partial()), updateBudget)
router.delete('/:id', deleteBudget)

export default router

