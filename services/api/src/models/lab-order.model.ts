import mongoose, { Schema, Document, Types } from 'mongoose';

export type LabOrderStatus =
    | 'created'
    | 'payment_pending'
    | 'confirmed'
    | 'collector_assigned'
    | 'collector_on_the_way'
    | 'sample_collected'
    | 'processing'
    | 'report_ready'
    | 'completed'
    | 'cancelled';

export interface ILabOrderPatientProfile {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    relationship?: string;
}

export interface ILabOrderItem {
    itemType: 'test' | 'package';
    itemId: Types.ObjectId;
    name: string;
    price: number;
}

export interface ILabOrder extends Document {
    userId: string;
    labId: Types.ObjectId;
    patientProfile: ILabOrderPatientProfile;
    items: ILabOrderItem[];
    prescriptionUrl?: string;
    preparationInstructions: string[];
    slotDate: Date;
    slotTime: string;
    homeCollection: boolean;
    address: string;
    amount: number;
    collector?: {
        name: string;
        phone: string;
        eta?: Date;
        assignedAt?: Date;
    };
    sampleCollectedAt?: Date;
    reportUrl?: string;
    reportUploadedAt?: Date;
    adminOverride?: {
        isEscalated: boolean;
        escalationReason?: string;
        escalatedByRole?: 'lab' | 'patient' | 'system' | 'admin';
        escalatedByUserId?: string;
        escalatedAt?: Date;
        lastAdminOverrideReason?: string;
        lastAdminOverrideAt?: Date;
        lastAdminOverrideBy?: string;
    };
    status: LabOrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

const LabOrderSchema = new Schema<ILabOrder>({
    userId: { type: String, required: true, index: true },
    labId: { type: Schema.Types.ObjectId, ref: 'Lab', required: true },
    patientProfile: {
        name: { type: String, required: true, trim: true },
        age: { type: Number, required: true, min: 0, max: 120 },
        gender: { type: String, enum: ['male', 'female', 'other'], required: true },
        relationship: { type: String, trim: true },
    },
    items: [{
        itemType: { type: String, enum: ['test', 'package'], required: true },
        itemId: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
    }],
    prescriptionUrl: { type: String, trim: true },
    preparationInstructions: [{ type: String, trim: true }],
    slotDate: { type: Date, required: true },
    slotTime: { type: String, required: true, trim: true },
    homeCollection: { type: Boolean, default: true },
    address: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    collector: {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        eta: { type: Date },
        assignedAt: { type: Date },
    },
    sampleCollectedAt: { type: Date },
    reportUrl: { type: String, trim: true },
    reportUploadedAt: { type: Date },
    adminOverride: {
        isEscalated: { type: Boolean, default: false },
        escalationReason: { type: String, trim: true },
        escalatedByRole: {
            type: String,
            enum: ['lab', 'patient', 'system', 'admin'],
        },
        escalatedByUserId: { type: String, trim: true },
        escalatedAt: { type: Date },
        lastAdminOverrideReason: { type: String, trim: true },
        lastAdminOverrideAt: { type: Date },
        lastAdminOverrideBy: { type: String, trim: true },
    },
    status: {
        type: String,
        enum: [
            'created',
            'payment_pending',
            'confirmed',
            'collector_assigned',
            'collector_on_the_way',
            'sample_collected',
            'processing',
            'report_ready',
            'completed',
            'cancelled',
        ],
        default: 'created',
    },
}, { timestamps: true });

LabOrderSchema.index({ userId: 1, createdAt: -1 });
LabOrderSchema.index({ labId: 1, status: 1, slotDate: 1 });
LabOrderSchema.index({ status: 1, createdAt: -1 });
LabOrderSchema.index({ 'adminOverride.isEscalated': 1, status: 1, createdAt: -1 });

export const LabOrder = mongoose.model<ILabOrder>('LabOrder', LabOrderSchema);
