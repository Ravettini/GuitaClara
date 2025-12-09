import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as expenseService from '../services/expenseService';

export const getExpenses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');

    const filters: expenseService.ExpenseFilters = {};
    
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    if (req.query.categoryId) {
      filters.categoryId = req.query.categoryId as string;
    }
    if (req.query.paymentMethod) {
      filters.paymentMethod = req.query.paymentMethod as string;
    }
    if (req.query.minAmount) {
      filters.minAmount = parseFloat(req.query.minAmount as string);
    }
    if (req.query.maxAmount) {
      filters.maxAmount = parseFloat(req.query.maxAmount as string);
    }

    const expenses = await expenseService.getExpenses(req.userId, filters);
    res.json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
};

export const getExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const expense = await expenseService.getExpenseById(req.params.id, req.userId);
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const expense = await expenseService.createExpense(req.userId, {
      ...req.body,
      date: new Date(req.body.date),
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (
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
    
    const expense = await expenseService.updateExpense(
      req.params.id,
      req.userId,
      updateData
    );
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    await expenseService.deleteExpense(req.params.id, req.userId);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

