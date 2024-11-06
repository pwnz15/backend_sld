import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export const auth = (requiredPermissions: string[] = []) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {
                throw new Error('Authentication required');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            req.user = decoded.user;

            // Check permissions if specified
            if (requiredPermissions.length > 0) {
                const hasPermission = requiredPermissions.every(permission =>
                    req.user?.permissions.includes(permission)
                );

                if (!hasPermission) {
                    throw new Error('Insufficient permissions');
                }
            }

            next();
        } catch (error) {
            res.status(401).json({ error: 'Please authenticate' });
        }
    };
};