import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
    userId: mongoose.Types.ObjectId;
    specialization: string;
    qualification: string;
    experience: number;
    consultationFee: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    bio?: string;
    availableSlots: {
        day: number; // 0-6 (Sunday-Saturday)
        startTime: string; // HH:mm
        endTime: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true },
    consultationFee: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    bio: { type: String },
    availableSlots: [{
        day: { type: Number, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
    }],
}, { timestamps: true });

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
