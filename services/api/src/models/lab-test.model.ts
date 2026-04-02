import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILabTest extends Document {
    labId: Types.ObjectId;
    code: string;
    name: string;
    category?: string;
    price: number;
    discountedPrice?: number;
    preparationInstructions: string[];
    fastingHours?: number;
    sampleType?: string;
    turnaroundHours?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LabTestSchema = new Schema<ILabTest>({
    labId: { type: Schema.Types.ObjectId, ref: 'Lab', required: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    preparationInstructions: [{ type: String, trim: true }],
    fastingHours: { type: Number, min: 0 },
    sampleType: { type: String, trim: true },
    turnaroundHours: { type: Number, min: 1 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

LabTestSchema.index({ labId: 1, code: 1 }, { unique: true });
LabTestSchema.index({ name: 'text', category: 'text' });
LabTestSchema.index({ labId: 1, isActive: 1, price: 1 });

export const LabTest = mongoose.model<ILabTest>('LabTest', LabTestSchema);
