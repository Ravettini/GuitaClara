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
import assistantRoutes from './routes/assistant';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS Configuration
const allowedOrigins: string[] = [];

// Función helper para normalizar URLs (agregar https:// si no tiene protocolo)
const normalizeUrl = (url: string): string => {
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

// En producción, solo permitir el frontend configurado
if (process.env.FRONTEND_URL) {
  // Soporte para múltiples URLs separadas por coma
  const urls = process.env.FRONTEND_URL.split(',').map(u => normalizeUrl(u));
  allowedOrigins.push(...urls);
}

// Agregar URL de Vercel por defecto si está en producción
if (process.env.NODE_ENV === 'production') {
  const vercelUrl = normalizeUrl('guitaclara.vercel.app');
  if (!allowedOrigins.includes(vercelUrl)) {
    allowedOrigins.push(vercelUrl);
  }
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
      // Normalizar el origin recibido para comparación
      const normalizedOrigin = normalizeUrl(origin);
      
      // Verificar si el origin está en la lista (con o sin protocolo)
      const isAllowed = allowedOrigins.some(allowed => {
        const normalizedAllowed = normalizeUrl(allowed);
        return normalizedOrigin === normalizedAllowed || 
               origin === allowed || 
               origin === normalizedAllowed ||
               normalizedOrigin === allowed;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS bloqueado: ${origin} (permitidos: ${allowedOrigins.join(', ')})`);
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
app.use('/assistant', assistantRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

