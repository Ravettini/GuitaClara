import { PrismaClient, InvestmentInstrumentType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateInstrumentData {
  ticker: string;
  name: string;
  type: InvestmentInstrumentType;
  market: string;
  currency?: string;
}

export interface CreatePositionData {
  instrumentId: string;
  quantity: number;
  averageBuyPrice: number;
  accountName?: string;
  brokerName?: string;
}

export interface UpdatePositionData {
  quantity?: number;
  averageBuyPrice?: number;
  accountName?: string;
  brokerName?: string;
}

export interface PortfolioPosition {
  position: any;
  instrument: any;
  lastPrice: number | null;
  currentValue: number;
  totalCost: number;
  pnl: number;
  pnlPercent: number;
}

// Obtener o crear instrumento por ticker
export const getOrCreateInstrument = async (
  userId: string,
  data: CreateInstrumentData
) => {
  const existing = await prisma.investmentInstrument.findUnique({
    where: {
      userId_ticker: {
        userId,
        ticker: data.ticker,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.investmentInstrument.create({
    data: {
      ...data,
      userId,
      currency: data.currency || 'ARS',
    },
  });
};

export const getInstruments = async (userId: string) => {
  return prisma.investmentInstrument.findMany({
    where: { userId },
    orderBy: { ticker: 'asc' },
  });
};

export const getInstrumentById = async (
  instrumentId: string,
  userId: string
) => {
  const instrument = await prisma.investmentInstrument.findFirst({
    where: {
      id: instrumentId,
      userId,
    },
  });

  if (!instrument) {
    throw new AppError(404, 'Instrument not found');
  }

  return instrument;
};

export const createInstrument = async (
  userId: string,
  data: CreateInstrumentData
) => {
  return getOrCreateInstrument(userId, data);
};

export const updateInstrument = async (
  instrumentId: string,
  userId: string,
  data: Partial<CreateInstrumentData>
) => {
  await getInstrumentById(instrumentId, userId);

  return prisma.investmentInstrument.update({
    where: { id: instrumentId },
    data,
  });
};

export const deleteInstrument = async (
  instrumentId: string,
  userId: string
) => {
  await getInstrumentById(instrumentId, userId);
  return prisma.investmentInstrument.delete({
    where: { id: instrumentId },
  });
};

export const getPositions = async (userId: string) => {
  return prisma.investmentPosition.findMany({
    where: { userId },
    include: {
      instrument: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPositionById = async (positionId: string, userId: string) => {
  const position = await prisma.investmentPosition.findFirst({
    where: {
      id: positionId,
      userId,
    },
    include: {
      instrument: true,
    },
  });

  if (!position) {
    throw new AppError(404, 'Position not found');
  }

  return position;
};

export const createPosition = async (
  userId: string,
  data: CreatePositionData
) => {
  // Verificar que el instrumento pertenece al usuario
  await getInstrumentById(data.instrumentId, userId);

  return prisma.investmentPosition.create({
    data: {
      ...data,
      userId,
    },
    include: {
      instrument: true,
    },
  });
};

export const updatePosition = async (
  positionId: string,
  userId: string,
  data: UpdatePositionData
) => {
  await getPositionById(positionId, userId);

  return prisma.investmentPosition.update({
    where: { id: positionId },
    data,
    include: {
      instrument: true,
    },
  });
};

export const deletePosition = async (positionId: string, userId: string) => {
  await getPositionById(positionId, userId);
  return prisma.investmentPosition.delete({
    where: { id: positionId },
  });
};

// Obtener último precio de un instrumento
export const getLastPrice = async (instrumentId: string) => {
  const snapshot = await prisma.investmentPriceSnapshot.findFirst({
    where: { instrumentId },
    orderBy: { at: 'desc' },
  });

  return snapshot ? Number(snapshot.price) : null;
};

// Actualizar precio de un instrumento
export const updatePrice = async (
  instrumentId: string,
  price: number,
  currency: string
) => {
  return prisma.investmentPriceSnapshot.create({
    data: {
      instrumentId,
      price,
      currency,
    },
  });
};

// Obtener portfolio completo con precios y P&L
export const getPortfolio = async (userId: string): Promise<PortfolioPosition[]> => {
  const positions = await prisma.investmentPosition.findMany({
    where: { userId },
    include: {
      instrument: true,
    },
  });

  const portfolio: PortfolioPosition[] = [];

  // Obtener todos los precios en paralelo para mejor performance
  const pricePromises = positions.map(pos => getLastPrice(pos.instrumentId));
  const prices = await Promise.all(pricePromises);

  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    const lastPrice = prices[i];
    const quantity = Number(position.quantity);
    const avgPrice = Number(position.averageBuyPrice);
    const totalCost = quantity * avgPrice;
    const currentValue = lastPrice ? quantity * lastPrice : totalCost;
    const pnl = currentValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

    portfolio.push({
      position,
      instrument: position.instrument,
      lastPrice,
      currentValue,
      totalCost,
      pnl,
      pnlPercent,
    });
  }

  return portfolio;
};

// Actualizar precios desde API externa
export const updatePricesFromAPI = async (userId: string) => {
  const instruments = await getInstruments(userId);
  const { getMarketPrice } = await import('./marketApiService');

  let updated = 0;
  let failed = 0;

  for (const instrument of instruments) {
    try {
      const marketData = await getMarketPrice(instrument.ticker, instrument.market);
      
      if (marketData) {
        await updatePrice(
          instrument.id,
          marketData.price,
          marketData.currency
        );
        updated++;
      } else {
        // Si no se puede obtener precio, usar precio promedio de compra de las posiciones
        const positions = await prisma.investmentPosition.findMany({
          where: { instrumentId: instrument.id },
          select: { averageBuyPrice: true },
        });
        
        if (positions.length > 0) {
          const avgPrice = positions.reduce((sum, p) => sum + Number(p.averageBuyPrice), 0) / positions.length;
          await updatePrice(instrument.id, avgPrice, instrument.currency);
          updated++;
        } else {
          failed++;
        }
      }
      
      // Pequeño delay para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error updating price for ${instrument.ticker}:`, error);
      failed++;
    }
  }

  return { updated, failed, total: instruments.length };
};

