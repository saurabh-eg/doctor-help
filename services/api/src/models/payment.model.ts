import mongoose, { Document, Schema } from 'mongoose';

export type PaymentProvider = 'demo' | 'phonepe';
export type PaymentStatus = 'created' | 'pending' | 'success' | 'failed' | 'refunded';

export interface IPayment extends Document {
    paymentId: string;
    userId: string;
    appointmentId?: string;
    provider: PaymentProvider;
    providerTxnId?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    purpose?: string;
    meta?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        paymentId: { type: String, required: true, unique: true, index: true },
        userId: { type: String, required: true, index: true },
        appointmentId: { type: String, index: true },
        provider: { type: String, enum: ['demo', 'phonepe'], default: 'demo', required: true },
        providerTxnId: { type: String, trim: true, index: true },
        amount: { type: Number, required: true, min: 1 },
        currency: { type: String, default: 'INR', required: true },
        status: {
            type: String,
            enum: ['created', 'pending', 'success', 'failed', 'refunded'],
            default: 'created',
            index: true,
        },
        purpose: { type: String, trim: true },
        meta: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ appointmentId: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
