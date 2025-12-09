import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import incomeRoutes from './routes/incomes';
import expenseRoutes from './routes/expenses';
import fixedTermRoutes from './routes/fixedTermDeposits';
import investmentRoutes from './routes/investments';
import analyticsRoutes from './routes/analytics';
import budgetRoutes from './routes/budgets';
import goalRoutes from './routes/goals';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/incomes', incomeRoutes);
app.use('/expenses', expenseRoutes);
app.use('/fixed-term-deposits', fixedTermRoutes);
app.use('/investments', investmentRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/budgets', budgetRoutes);
app.use('/goals', goalRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

