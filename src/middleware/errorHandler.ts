import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
};