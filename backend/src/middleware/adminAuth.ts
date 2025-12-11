import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';
import { AuthRequest } from './auth';

const prisma = new PrismaClient();

/**
 * Middleware que verifica si el usuario autenticado es superadmin
 * El superadmin se identifica por su email configurado en SUPERADMIN_EMAIL
 */
export const requireSuperAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError(401, 'Not authenticated'));
    }

    const superAdminEmail = process.env.SUPERADMIN_EMAIL;
    
    if (!superAdminEmail) {
      console.warn('⚠️ SUPERADMIN_EMAIL no está configurado. El acceso de admin está deshabilitado.');
      return next(new AppError(403, 'Admin access is not configured'));
    }

    // Obtener el usuario actual
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { email: true },
    });

    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    // Verificar si el email del usuario coincide con el superadmin
    if (user.email.toLowerCase() !== superAdminEmail.toLowerCase()) {
      return next(new AppError(403, 'Access denied. Superadmin only.'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

