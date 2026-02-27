import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
    userId: mongoose.Types.ObjectId;
    doctorId?: number;
    specialization: string;
    qualification: string;
    experience: number;
    consultationFee: number;
    licenseNumber?: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    verifiedAt?: Date;
    rejectionReason?: string;
    bio?: string;
    photoUrl?: string;
    documents?: string[];
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
    doctorId: { type: Number, unique: true, sparse: true },
    specialization: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true },
    consultationFee: { type: Number, required: true },
    licenseNumber: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    bio: { type: String },
    photoUrl: { type: String },
    documents: [{ type: String }],
    availableSlots: [{
        day: { type: Number, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
    }],
}, { timestamps: true });

// Indexes for search and filtering performance
DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ isVerified: 1, rating: -1 });
DoctorSchema.index({ userId: 1 });
DoctorSchema.index({ isVerified: 1, createdAt: -1 }); // Admin panel pending verifications
DoctorSchema.index({ specialization: 'text' }); // Text search

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
