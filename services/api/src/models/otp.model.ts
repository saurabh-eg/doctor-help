import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
    mobile: string;
    otp: string;
    expiresAt: Date;
    createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
    mobile: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);