import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, type ApiResponse } from '../types/index.js';
import { config } from '../config/environment.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error in development
  if (config.isDevelopment) {
    console.error('Error:', err);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    };
    res.status(400).json(response);
    return;
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: config.isDevelopment ? err.details : undefined,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unknown errors
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.isDevelopment
        ? err.message
        : 'An unexpected error occurred',
      details: config.isDevelopment ? err.stack : undefined,
    },
  };
  res.status(500).json(response);
};
