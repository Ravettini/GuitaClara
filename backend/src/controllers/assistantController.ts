import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { askFinancialAssistant } from '../services/aiAssistantService';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1, 'El mensaje no puede estar vacío').max(1000, 'El mensaje es demasiado largo'),
});

export const chat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Validar body
    const validationResult = chatSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: validationResult.error.errors,
      });
    }

    const { message } = validationResult.data;

    // Llamar al servicio
    const reply = await askFinancialAssistant(req.userId, message);

    res.json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error: any) {
    console.error('Error in assistant chat:', error);
    next(error);
  }
};

