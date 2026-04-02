import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILabPackageItem {
    testId: Types.ObjectId;
    nameSnapshot: string;
}

export interface ILabPackage extends Document {
    labId: Types.ObjectId;
    code: string;
    name: string;
    description?: string;
    items: ILabPackageItem[];
    price: number;
    discountedPrice?: number;
    preparationInstructions: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LabPackageSchema = new Schema<ILabPackage>({
    labId: { type: Schema.Types.ObjectId, ref: 'Lab', required: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    items: [{
        testId: { type: Schema.Types.ObjectId, ref: 'LabTest', required: true },
        nameSnapshot: { type: String, required: true, trim: true },
    }],
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    preparationInstructions: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

LabPackageSchema.index({ labId: 1, code: 1 }, { unique: true });
LabPackageSchema.index({ name: 'text', description: 'text' });
LabPackageSchema.index({ labId: 1, isActive: 1 });

export const LabPackage = mongoose.model<ILabPackage>('LabPackage', LabPackageSchema);
