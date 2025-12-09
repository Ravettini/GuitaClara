import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as incomeService from '../services/incomeService';

export const getIncomes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');

    const filters: incomeService.IncomeFilters = {};
    
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    if (req.query.categoryId) {
      filters.categoryId = req.query.categoryId as string;
    }
    if (req.query.minAmount) {
      filters.minAmount = parseFloat(req.query.minAmount as string);
    }
    if (req.query.maxAmount) {
      filters.maxAmount = parseFloat(req.query.maxAmount as string);
    }

    const incomes = await incomeService.getIncomes(req.userId, filters);
    res.json({ success: true, data: incomes });
  } catch (error) {
    next(error);
  }
};

export const getIncome = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const income = await incomeService.getIncomeById(req.params.id, req.userId);
    res.json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

export const createIncome = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const income = await incomeService.createIncome(req.userId, {
      ...req.body,
      date: new Date(req.body.date),
    });
    res.status(201).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

export const updateIncome = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const updateData: any = { ...req.body };
    if (req.body.date) {
      updateData.date = new Date(req.body.date);
    }
    
    const income = await incomeService.updateIncome(
      req.params.id,
      req.userId,
      updateData
    );
    res.json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

export const deleteIncome = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    await incomeService.deleteIncome(req.params.id, req.userId);
    res.json({ success: true, message: 'Income deleted' });
  } catch (error) {
    next(error);
  }
};

