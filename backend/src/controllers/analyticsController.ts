import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as analyticsService from '../services/analyticsService';

export const getSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');

    const dateRange: analyticsService.DateRange | undefined = req.query.startDate
      ? {
          startDate: new Date(req.query.startDate as string),
          endDate: new Date(req.query.endDate as string),
        }
      : undefined;

    const summary = await analyticsService.getSummary(req.userId, dateRange);
    
    // Obtener cotización del dólar si se solicita conversión
    const convertTo = req.query.convertTo as string | undefined;
    let dollarRate: number | null = null;
    
    if (convertTo === 'ARS' || convertTo === 'USD') {
      try {
        const { getCachedDollarRate } = await import('../services/exchangeRateService');
        dollarRate = await getCachedDollarRate();
        
        if (dollarRate) {
          // Agregar el rate al objeto summary para que el frontend lo use
          (summary as any).dollarRate = dollarRate;
          
          if (convertTo === 'ARS') {
            // Convertir USD a ARS y sumar a ARS
            summary.totalIncome = summary.totalIncome + (summary.totalIncomeUSD * dollarRate);
            summary.totalExpenses = summary.totalExpenses + (summary.totalExpensesUSD * dollarRate);
            summary.balance = summary.balance + (summary.balanceUSD * dollarRate);
            summary.totalFixedTermsValue = summary.totalFixedTermsValue + (summary.totalFixedTermsValueUSD * dollarRate);
            summary.totalPortfolioValue = summary.totalPortfolioValue + (summary.totalPortfolioValueUSD * dollarRate);
            summary.netWorth = summary.netWorth + (summary.netWorthUSD * dollarRate);
            
            // Mantener USD en 0 para que el frontend solo muestre ARS
            summary.totalIncomeUSD = 0;
            summary.totalExpensesUSD = 0;
            summary.balanceUSD = 0;
            summary.totalFixedTermsValueUSD = 0;
            summary.totalPortfolioValueUSD = 0;
            summary.netWorthUSD = 0;
          } else if (convertTo === 'USD') {
            // Convertir ARS a USD y sumar a USD
            summary.totalIncomeUSD = summary.totalIncomeUSD + (summary.totalIncome / dollarRate);
            summary.totalExpensesUSD = summary.totalExpensesUSD + (summary.totalExpenses / dollarRate);
            summary.balanceUSD = summary.balanceUSD + (summary.balance / dollarRate);
            summary.totalFixedTermsValueUSD = summary.totalFixedTermsValueUSD + (summary.totalFixedTermsValue / dollarRate);
            summary.totalPortfolioValueUSD = summary.totalPortfolioValueUSD + (summary.totalPortfolioValue / dollarRate);
            summary.netWorthUSD = summary.netWorthUSD + (summary.netWorth / dollarRate);
            
            // Mantener ARS en 0 para que el frontend solo muestre USD
            summary.totalIncome = 0;
            summary.totalExpenses = 0;
            summary.balance = 0;
            summary.totalFixedTermsValue = 0;
            summary.totalPortfolioValue = 0;
            summary.netWorth = 0;
          }
        }
      } catch (error) {
        console.error('Error fetching dollar rate:', error);
        // Continuar sin conversión si falla la API
      }
    }
    
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

export const getExpensesByCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');

    const dateRange: analyticsService.DateRange | undefined = req.query.startDate
      ? {
          startDate: new Date(req.query.startDate as string),
          endDate: new Date(req.query.endDate as string),
        }
      : undefined;

    const data = await analyticsService.getExpensesByCategory(
      req.userId,
      dateRange
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getIncomeVsExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');

    const dateRange: analyticsService.DateRange | undefined = req.query.startDate
      ? {
          startDate: new Date(req.query.startDate as string),
          endDate: new Date(req.query.endDate as string),
        }
      : undefined;

    const data = await analyticsService.getIncomeVsExpense(
      req.userId,
      dateRange
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCashFlow = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');

    const dateRange: analyticsService.DateRange | undefined = req.query.startDate
      ? {
          startDate: new Date(req.query.startDate as string),
          endDate: new Date(req.query.endDate as string),
        }
      : undefined;

    const data = await analyticsService.getCashFlow(req.userId, dateRange);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

