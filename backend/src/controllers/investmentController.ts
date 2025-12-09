import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as investmentService from '../services/investmentService';

// Instruments
export const getInstruments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const instruments = await investmentService.getInstruments(req.userId);
    res.json({ success: true, data: instruments });
  } catch (error) {
    next(error);
  }
};

export const getInstrument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const instrument = await investmentService.getInstrumentById(
      req.params.id,
      req.userId
    );
    res.json({ success: true, data: instrument });
  } catch (error) {
    next(error);
  }
};

export const createInstrument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const instrument = await investmentService.createInstrument(
      req.userId,
      req.body
    );
    res.status(201).json({ success: true, data: instrument });
  } catch (error) {
    next(error);
  }
};

export const updateInstrument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const instrument = await investmentService.updateInstrument(
      req.params.id,
      req.userId,
      req.body
    );
    res.json({ success: true, data: instrument });
  } catch (error) {
    next(error);
  }
};

export const deleteInstrument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    await investmentService.deleteInstrument(req.params.id, req.userId);
    res.json({ success: true, message: 'Instrument deleted' });
  } catch (error) {
    next(error);
  }
};

// Positions
export const getPositions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const positions = await investmentService.getPositions(req.userId);
    res.json({ success: true, data: positions });
  } catch (error) {
    next(error);
  }
};

export const getPosition = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const position = await investmentService.getPositionById(
      req.params.id,
      req.userId
    );
    res.json({ success: true, data: position });
  } catch (error) {
    next(error);
  }
};

export const createPosition = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const position = await investmentService.createPosition(
      req.userId,
      req.body
    );
    res.status(201).json({ success: true, data: position });
  } catch (error) {
    next(error);
  }
};

export const updatePosition = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const position = await investmentService.updatePosition(
      req.params.id,
      req.userId,
      req.body
    );
    res.json({ success: true, data: position });
  } catch (error) {
    next(error);
  }
};

export const deletePosition = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    await investmentService.deletePosition(req.params.id, req.userId);
    res.json({ success: true, message: 'Position deleted' });
  } catch (error) {
    next(error);
  }
};

// Portfolio
export const getPortfolio = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const portfolio = await investmentService.getPortfolio(req.userId);
    res.json({ success: true, data: portfolio });
  } catch (error) {
    next(error);
  }
};

// Update prices
export const updatePrices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const result = await investmentService.updatePricesFromAPI(req.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

