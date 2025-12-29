import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { AppError } from '../types/index.js';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

// Middleware to verify JWT token and attach user to request
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email!,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication - doesn't throw error if no token
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (user) {
      req.user = {
        id: user.id,
        email: user.email!,
      };
    }

    next();
  } catch (error) {
    // Don't throw error, just continue without user
    next();
  }
};
