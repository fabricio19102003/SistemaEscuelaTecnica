import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.utils.js';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        roles: string[];
    };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        if (!token) {
            res.sendStatus(401);
            return;
        }

        const decoded = verifyToken(token);

        if (decoded) {
            req.user = decoded;
            next();
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(401);
    }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.sendStatus(401);
            return;
        }

        const hasRole = req.user.roles.some((role: any) => allowedRoles.includes(role));

        if (hasRole) {
            next();
        } else {
            res.sendStatus(403);
        }
    };
};
