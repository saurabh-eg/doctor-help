import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Appointment, Doctor, Payment } from '../../models';
import { AuthenticatedRequest } from '../../middleware/auth';
import {
    notifyAppointmentStatusChanged,
    notifyPaymentStatus,
} from '../notifications';

const PAYMENT_MODE = (process.env.PAYMENT_MODE || 'demo').toLowerCase();

// TODO(phonepe-hardening): Implement before switching PAYMENT_MODE=phonepe in production.
// 1) Verify webhook signatures against PAYMENT_WEBHOOK_SECRET.
// 2) Enforce idempotency keys for initiate and webhook processing.
// 3) Persist raw gateway events and deduplicate by provider event id.
// 4) Add reconciliation job using PAYMENT_RECON_CRON for pending/failed drift.
// 5) Alert on repeated failures and webhook verification errors.

/** POST /api/payments/initiate — Initiate payment. Demo mode simulates success for approval/testing. */
export const initiatePayment = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { appointmentId, amount, currency = 'INR', purpose = 'doctor_consultation' } = req.body as {
            appointmentId?: string;
            amount: number;
            currency?: string;
            purpose?: string;
        };

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
        }

        let appointment = null as any;
        if (appointmentId) {
            appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({ success: false, error: 'Appointment not found' });
            }

            const isAdmin = authReq.user?.role === 'admin';
            if (!isAdmin && appointment.patientId.toString() !== userId) {
                return res.status(403).json({ success: false, error: 'Not authorized for this appointment' });
            }

            if (appointment.paymentStatus === 'paid') {
                return res.json({
                    success: true,
                    message: 'Appointment already paid',
                    data: {
                        status: 'success',
                        transactionId: `PAID-${appointment._id}`,
                        mode: PAYMENT_MODE,
                        appointmentId: String(appointment._id),
                    },
                });
            }
        }

        const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const providerTxnId = `DEMO-${randomUUID()}`;

        const payment = await Payment.create({
            paymentId,
            userId,
            appointmentId,
            provider: PAYMENT_MODE === 'phonepe' ? 'phonepe' : 'demo',
            providerTxnId,
            amount,
            currency,
            purpose,
            status: PAYMENT_MODE === 'demo' ? 'success' : 'pending',
            meta: {
                mode: PAYMENT_MODE,
                simulated: PAYMENT_MODE === 'demo',
            },
        });

        if (payment.status === 'success') {
            await notifyPaymentStatus({
                userId,
                paymentId: payment.paymentId,
                status: 'success',
            });
        } else if (payment.status === 'failed') {
            await notifyPaymentStatus({
                userId,
                paymentId: payment.paymentId,
                status: 'failed',
            });
        }

        // Demo mode auto-confirms business outcome for reviewer verification.
        if (PAYMENT_MODE === 'demo' && appointment) {
            appointment.paymentStatus = 'paid';
            appointment.status = 'confirmed';
            await appointment.save();

            const doctor = await Doctor.findById(appointment.doctorId).lean();
            await notifyAppointmentStatusChanged({
                patientUserId: appointment.patientId.toString(),
                doctorUserId: doctor?.userId?.toString(),
                appointmentId: appointment._id.toString(),
                status: 'confirmed',
            });
        }

        return res.status(201).json({
            success: true,
            message: PAYMENT_MODE === 'demo'
                ? 'Demo payment successful'
                : 'Payment initiated. Awaiting provider confirmation.',
            data: {
                paymentId: payment.paymentId,
                status: payment.status,
                transactionId: payment.providerTxnId,
                mode: PAYMENT_MODE,
                appointmentId: appointmentId || null,
            },
        });
    } catch (error) {
        console.error('initiatePayment error:', error);
        return res.status(500).json({ success: false, error: 'Failed to initiate payment' });
    }
};

/** GET /api/payments/:paymentId — Fetch payment status. */
export const getPaymentStatus = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { paymentId } = req.params;
        const payment = await Payment.findOne({ paymentId }).lean();

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        const isAdmin = authReq.user?.role === 'admin';
        if (!isAdmin && payment.userId !== userId) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this payment' });
        }

        return res.json({
            success: true,
            data: {
                paymentId: payment.paymentId,
                appointmentId: payment.appointmentId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                provider: payment.provider,
                transactionId: payment.providerTxnId,
                createdAt: payment.createdAt,
            },
        });
    } catch (error) {
        console.error('getPaymentStatus error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch payment status' });
    }
};
