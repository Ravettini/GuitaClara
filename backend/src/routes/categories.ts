import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['EXPENSE', 'INCOME', 'BOTH']),
  color: z.string().optional(),
  icon: z.string().optional(),
});

router.use(authenticate);
router.get('/', getCategories);
router.post('/', validate(categorySchema), createCategory);
router.get('/:id', getCategory);
router.put('/:id', validate(categorySchema.partial()), updateCategory);
router.delete('/:id', deleteCategory);

export default router;

