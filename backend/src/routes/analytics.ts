import { Router } from 'express';
import {
  getSummary,
  getExpensesByCategory,
  getIncomeVsExpense,
  getCashFlow,
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/summary', getSummary);
router.get('/expenses-by-category', getExpensesByCategory);
router.get('/income-vs-expense', getIncomeVsExpense);
router.get('/cashflow', getCashFlow);

export default router;

