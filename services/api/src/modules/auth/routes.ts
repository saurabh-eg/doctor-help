import { Router } from 'express';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import * as authController from './controller';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';

const router = Router();

// Stricter rate limiting for OTP endpoints (8 requests per 15 minutes)
const otpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 8,
    message: { success: false, error: 'Too many OTP requests. Please try again later.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

const sendOTPSchema = z.object({
    body: z.object({
        phone: z.string().min(10).max(15)
    })
});

const verifyOTPSchema = z.object({
    body: z.object({
        phone: z.string().min(10).max(15),
        otp: z.string().length(6)
    })
});

router.post('/send-otp', otpRateLimiter, validate(sendOTPSchema), authController.sendOTP);
router.post('/verify-otp', otpRateLimiter, validate(verifyOTPSchema), authController.verifyOTP);
router.post('/refresh', auth, authController.refresh);
router.get('/me', auth, authController.getMe);

export { router as authRouter };
