import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'joi';
import { MongoError } from 'mongodb';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string,
        public data?: any
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            code: err.code,
            message: err.message,
            data: err.data
        });
        return;
    }

    if (err instanceof ValidationError) {
        res.status(400).json({
            status: 'error',
            code: 'VALIDATION_ERROR',
            message: err.details[0].message,
            data: err.details
        });
        return;
    }

    if (err instanceof MongoError) {
        if (err.code === 11000) {
            res.status(409).json({
                status: 'error',
                code: 'DUPLICATE_KEY',
                message: 'A record with this key already exists'
            });
            return;
        }
    }

    res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
    });
};