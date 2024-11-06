import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
<<<<<<< HEAD
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
=======

export const validateRequest = (schema: Joi.ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.validateAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(400).json({ error: 'Validation error' });
            }
        }
    };
>>>>>>> 9a8f109c8bdb237a3b13b305ec1faa8024e34624
};