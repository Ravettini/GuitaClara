import { Router } from 'express';
import {
  getInstruments,
  getInstrument,
  createInstrument,
  updateInstrument,
  deleteInstrument,
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition,
  getPortfolio,
  updatePrices,
} from '../controllers/investmentController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const instrumentSchema = z.object({
  ticker: z.string().min(1, 'Ticker is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['STOCK', 'CEDEAR', 'BOND', 'LECAP', 'ETF', 'OTHER']),
  market: z.string().min(1, 'Market is required'),
  currency: z.string().optional(),
});

const positionSchema = z.object({
  instrumentId: z.string().uuid('Instrument ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  averageBuyPrice: z.number().positive('Average buy price must be positive'),
  accountName: z.string().optional(),
  brokerName: z.string().optional(),
});

router.use(authenticate);

// Instruments
router.get('/instruments', getInstruments);
router.get('/instruments/:id', getInstrument);
router.post('/instruments', validate(instrumentSchema), createInstrument);
router.put('/instruments/:id', validate(instrumentSchema.partial()), updateInstrument);
router.delete('/instruments/:id', deleteInstrument);

// Positions
router.get('/positions', getPositions);
router.get('/positions/:id', getPosition);
router.post('/positions', validate(positionSchema), createPosition);
router.put('/positions/:id', validate(positionSchema.partial()), updatePosition);
router.delete('/positions/:id', deletePosition);

// Portfolio
router.get('/portfolio', getPortfolio);

// Update prices
router.post('/update-prices', updatePrices);

export default router;

