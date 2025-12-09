import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { budgetService } from '../services/budgetService'
import { AppError } from '../middleware/errorHandler'

export const getAllBudgets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    const periodStart = req.query.periodStart
      ? new Date(req.query.periodStart as string)
      : undefined
    const periodEnd = req.query.periodEnd
      ? new Date(req.query.periodEnd as string)
      : undefined

    const budgets = await budgetService.getAll(req.userId, periodStart, periodEnd)
    res.json({ success: true, data: budgets })
  } catch (error) {
    next(error)
  }
}

export const getBudgetById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    const budget = await budgetService.getById(req.userId, req.params.id)
    res.json({ success: true, data: budget })
  } catch (error) {
    next(error)
  }
}

export const createBudget = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    const budget = await budgetService.create(req.userId, req.body)
    res.status(201).json({ success: true, data: budget })
  } catch (error) {
    next(error)
  }
}

export const updateBudget = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    const budget = await budgetService.update(req.userId, req.params.id, req.body)
    res.json({ success: true, data: budget })
  } catch (error) {
    next(error)
  }
}

export const deleteBudget = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    await budgetService.delete(req.userId, req.params.id)
    res.json({ success: true, message: 'Presupuesto eliminado' })
  } catch (error) {
    next(error)
  }
}

export const getBudgetSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    const periodStart = req.query.periodStart
      ? new Date(req.query.periodStart as string)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const periodEnd = req.query.periodEnd
      ? new Date(req.query.periodEnd as string)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    const summary = await budgetService.getSummary(req.userId, periodStart, periodEnd)
    res.json({ success: true, data: summary })
  } catch (error) {
    next(error)
  }
}

