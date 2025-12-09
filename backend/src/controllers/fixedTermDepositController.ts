import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as fixedTermService from '../services/fixedTermDepositService';

export const getFixedTermDeposits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const deposits = await fixedTermService.getFixedTermDeposits(req.userId);
    res.json({ success: true, data: deposits });
  } catch (error) {
    next(error);
  }
};

export const getFixedTermDeposit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const deposit = await fixedTermService.getFixedTermDepositById(
      req.params.id,
      req.userId
    );
    res.json({ success: true, data: deposit });
  } catch (error) {
    next(error);
  }
};

export const createFixedTermDeposit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const deposit = await fixedTermService.createFixedTermDeposit(req.userId, {
      ...req.body,
      startDate: new Date(req.body.startDate),
    });
    res.status(201).json({ success: true, data: deposit });
  } catch (error) {
    next(error);
  }
};

export const updateFixedTermDeposit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const updateData: any = { ...req.body };
    if (req.body.startDate) {
      updateData.startDate = new Date(req.body.startDate);
    }
    
    const deposit = await fixedTermService.updateFixedTermDeposit(
      req.params.id,
      req.userId,
      updateData
    );
    res.json({ success: true, data: deposit });
  } catch (error) {
    next(error);
  }
};

export const deleteFixedTermDeposit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    await fixedTermService.deleteFixedTermDeposit(req.params.id, req.userId);
    res.json({ success: true, message: 'Fixed term deposit deleted' });
  } catch (error) {
    next(error);
  }
};

