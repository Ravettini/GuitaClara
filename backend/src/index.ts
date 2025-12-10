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

// Middleware - CORS Configuration
const allowedOrigins: string[] = [];

// En producción, solo permitir el frontend configurado
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// En desarrollo, permitir localhost del frontend
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173');
}

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // En producción, solo permitir orígenes explícitos
    if (process.env.NODE_ENV === 'production') {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    } else {
      // En desarrollo, permitir cualquier origen
      callback(null, true);
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

