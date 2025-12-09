import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { goalService } from '../services/goalService'
import { AppError } from '../middleware/errorHandler'

export const getAllGoals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    const status = req.query.status as string | undefined
    const goals = await goalService.getAll(req.userId, status)
    res.json({ success: true, data: goals })
  } catch (error) {
    next(error)
  }
}

export const getGoalById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    const goal = await goalService.getById(req.userId, req.params.id)
    res.json({ success: true, data: goal })
  } catch (error) {
    next(error)
  }
}

export const createGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    const goal = await goalService.create(req.userId, req.body)
    res.status(201).json({ success: true, data: goal })
  } catch (error) {
    next(error)
  }
}

export const updateGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    const goal = await goalService.update(req.userId, req.params.id, req.body)
    res.json({ success: true, data: goal })
  } catch (error) {
    next(error)
  }
}

export const deleteGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    await goalService.delete(req.userId, req.params.id)
    res.json({ success: true, message: 'Meta eliminada' })
  } catch (error) {
    next(error)
  }
}

export const getGoalSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated')

    const summary = await goalService.getSummary(req.userId)
    res.json({ success: true, data: summary })
  } catch (error) {
    next(error)
  }
}

