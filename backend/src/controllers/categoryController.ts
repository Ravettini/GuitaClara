import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as categoryService from '../services/categoryService';

export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const type = req.query.type as string | undefined;
    const categories = await categoryService.getCategories(
      req.userId,
      type as any
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const category = await categoryService.getCategoryById(
      req.params.id,
      req.userId
    );
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const category = await categoryService.createCategory(req.userId, req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    const category = await categoryService.updateCategory(
      req.params.id,
      req.userId,
      req.body
    );
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) throw new Error('Not authenticated');
    
    await categoryService.deleteCategory(req.params.id, req.userId);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

