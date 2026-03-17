import { Request, Response, NextFunction } from 'express';

// Simple shared-secret authentication middleware
// For a private 2-person app, this is sufficient
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // For development, skip auth
    if (process.env.NODE_ENV === 'development' || !process.env.AUTH_SECRET) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
}
