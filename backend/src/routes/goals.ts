import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalSummary,
} from '../controllers/goalController'
import { validate } from '../middleware/validation'
import { z } from 'zod'

const router = Router()

const goalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  currency: z.string().optional(),
  targetDate: z.string().datetime(),
  calculationMode: z.string().optional(),
  tagKey: z.string().nullable().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
})

router.use(authenticate)

router.get('/summary', getGoalSummary)
router.get('/', getAllGoals)
router.get('/:id', getGoalById)
router.post('/', validate(goalSchema), createGoal)
router.put('/:id', validate(goalSchema.partial()), updateGoal)
router.delete('/:id', deleteGoal)

export default router

