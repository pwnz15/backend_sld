import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

export const validateRequest = (schema: Joi.ObjectSchema, type: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.validateAsync(req[type], {
        abortEarly: false,
        stripUnknown: true
      });
      req[type] = validated;
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        next(new AppError(400, 'Validation error', 'VALIDATION_ERROR', error.details));
      } else {
        next(error);
      }
    }
  };
};