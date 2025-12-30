import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'super-secret-key-change-in-production'
);

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        phone: string;
        role: 'patient' | 'doctor' | 'admin';
        numericUserId?: number;
    };
}

export const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const { payload } = await jwtVerify(token, JWT_SECRET);

        req.user = payload as any;
        next();
    } catch (error) {
        console.error('❌ Auth Error:', error);
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

export const authorize = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        next();
    };
};
