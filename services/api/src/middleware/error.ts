import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: err.message
        });
    }

    if (err.status) {
        return res.status(err.status).json({
            success: false,
            error: err.message
        });
    }

    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
};
