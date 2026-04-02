import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILabAddress {
    line1: string;
    city: string;
    state: string;
    pincode: string;
}

export interface ILab extends Document {
    name: string;
    phone: string;
    email?: string;
    address: ILabAddress;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
    };
    rating: number;
    ratingCount: number;
    isNablCertified: boolean;
    isActive: boolean;
    createdBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const LabSchema = new Schema<ILab>({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: {
        line1: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (coords: number[]) => Array.isArray(coords) && coords.length === 2,
                message: 'Location coordinates must be [lng, lat]',
            },
        },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    isNablCertified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

LabSchema.index({ location: '2dsphere' });
LabSchema.index({ isActive: 1, rating: -1 });
LabSchema.index({ 'address.city': 1, 'address.state': 1 });
LabSchema.index({ name: 'text', 'address.city': 'text' });

export const Lab = mongoose.model<ILab>('Lab', LabSchema);
