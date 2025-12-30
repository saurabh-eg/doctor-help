import mongoose, { Schema, Document } from 'mongoose';


export interface IUser extends Document {
    phone: string;
    name?: string;
    email?: string;
    avatar?: string;
    role: 'patient' | 'doctor' | 'admin';
    isVerified: boolean;
    userId?: number; // Numeric user ID
    isSuspended?: boolean;
    suspendedReason?: string;
    suspendedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}


const UserSchema = new Schema<IUser>({
    phone: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    isVerified: { type: Boolean, default: false },
    userId: { type: Number, unique: true, sparse: true },
    isSuspended: { type: Boolean, default: false },
    suspendedReason: { type: String },
    suspendedAt: { type: Date },
}, { timestamps: true });

// Indexes for admin panel queries
UserSchema.index({ role: 1, createdAt: -1 }); // Users list filtered by role
UserSchema.index({ name: 'text', phone: 'text', email: 'text' }); // Text search
UserSchema.index({ isSuspended: 1 }); // Filter suspended users

export const User = mongoose.model<IUser>('User', UserSchema);
