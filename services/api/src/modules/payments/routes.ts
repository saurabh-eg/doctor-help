import { Router } from 'express';
import { z } from 'zod';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as paymentsController from './controller';

const router = Router();

const initiatePaymentSchema = z.object({
    body: z.object({
        appointmentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
        amount: z.number().positive(),
        currency: z.string().optional().default('INR'),
        purpose: z.string().optional().default('doctor_consultation'),
    }),
});

const getPaymentStatusSchema = z.object({
    params: z.object({
        paymentId: z.string().min(5),
    }),
});

router.use(auth);
router.post('/initiate', validate(initiatePaymentSchema), paymentsController.initiatePayment);
router.get('/:paymentId', validate(getPaymentStatusSchema), paymentsController.getPaymentStatus);

export { router as paymentsRouter };
