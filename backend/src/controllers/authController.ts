import { Request, Response, NextFunction } from 'express';
import { register, login, getCurrentUser } from '../services/authService';
import { generateAccessToken } from '../utils/jwt';
import { verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await register(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await login(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token is required');
    }

    const { userId } = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(userId);

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(new AppError(401, 'Invalid refresh token'));
  }
};

export const meController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const user = await getCurrentUser(req.userId);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

