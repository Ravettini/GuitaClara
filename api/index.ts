import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from '../backend/src/middleware/errorHandler';
import authRoutes from '../backend/src/routes/auth';
import categoryRoutes from '../backend/src/routes/categories';
import incomeRoutes from '../backend/src/routes/incomes';
import expenseRoutes from '../backend/src/routes/expenses';
import fixedTermRoutes from '../backend/src/routes/fixedTermDeposits';
import investmentRoutes from '../backend/src/routes/investments';
import analyticsRoutes from '../backend/src/routes/analytics';
import budgetRoutes from '../backend/src/routes/budgets';
import goalRoutes from '../backend/src/routes/goals';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // En producción, permitir cualquier origen de Vercel
    if (process.env.VERCEL || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Exportar el handler para Vercel
export default app;

