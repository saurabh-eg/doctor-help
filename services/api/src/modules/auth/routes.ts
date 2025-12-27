import { Router } from 'express';
import { z } from 'zod';
import * as authController from './controller';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';

const router = Router();

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

router.post('/send-otp', validate(sendOTPSchema), authController.sendOTP);
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP);
router.post('/refresh', auth, authController.refresh);
router.get('/me', auth, authController.getMe);

export { router as authRouter };
