import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as adminService from '../services/adminService';

/**
 * Obtiene estadísticas generales de la aplicación
 * Solo accesible para superadmin
 */
export const getStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const stats = await adminService.getAdminStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

