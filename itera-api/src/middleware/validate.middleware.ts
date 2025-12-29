import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';

// Validation targets
type ValidationTarget = 'body' | 'query' | 'params';

// Middleware factory for validation
export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate the specified part of the request
      const validated = schema.parse(req[target]);

      // Replace with validated data (this ensures type safety and applies defaults)
      req[target] = validated;

      next();
    } catch (error) {
      // Zod errors will be caught by errorHandler middleware
      next(error);
    }
  };
};

// Helper to validate multiple targets
export const validateMultiple = (validations: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (validations.body) {
        req.body = validations.body.parse(req.body);
      }
      if (validations.query) {
        req.query = validations.query.parse(req.query);
      }
      if (validations.params) {
        req.params = validations.params.parse(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
