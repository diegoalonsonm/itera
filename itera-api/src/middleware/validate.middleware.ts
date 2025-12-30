import type { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

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
      // Use type assertion for query and params as they are read-only in Express
      if (target === 'body') {
        req.body = validated;
      } else if (target === 'query') {
        for (const key in req.query) {
          delete (req.query as any)[key]
        }

        Object.assign(req.query, validated)
      } else if (target === 'params') {
        for (const key in req.params) {
          delete (req.params as any)[key]
        }

        Object.assign(req.params, validated)
      }

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
        (req as any).query = validations.query.parse(req.query);
      }
      if (validations.params) {
        (req as any).params = validations.params.parse(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
