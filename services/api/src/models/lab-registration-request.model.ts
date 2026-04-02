import mongoose, { Document, Schema } from 'mongoose';

export type LabRegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface ILabRegistrationRequest extends Document {
    labName: string;
    contactName: string;
    phone: string;
    email?: string;
    address: {
        line1: string;
        city: string;
        state: string;
        pincode: string;
    };
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    isNablCertified: boolean;
    verificationDocuments: Array<{
        documentType: 'registration_certificate' | 'government_id' | 'nabl_certificate' | 'pan_card' | 'other';
        documentUrl: string;
        originalFileName?: string;
        uploadedAt: Date;
    }>;
    notes?: string;
    status: LabRegistrationStatus;
    rejectionReason?: string;
    decidedBy?: string;
    decidedAt?: Date;
    approvedUserId?: string;
    approvedLabId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LabRegistrationRequestSchema = new Schema<ILabRegistrationRequest>(
    {
        labName: { type: String, required: true, trim: true },
        contactName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true, index: true },
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
        isNablCertified: { type: Boolean, default: false },
        verificationDocuments: [{
            documentType: {
                type: String,
                enum: ['registration_certificate', 'government_id', 'nabl_certificate', 'pan_card', 'other'],
                required: true,
            },
            documentUrl: { type: String, required: true, trim: true },
            originalFileName: { type: String, trim: true },
            uploadedAt: { type: Date, default: Date.now },
        }],
        notes: { type: String, trim: true },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },
        rejectionReason: { type: String, trim: true },
        decidedBy: { type: String, trim: true },
        decidedAt: { type: Date },
        approvedUserId: { type: String, trim: true },
        approvedLabId: { type: String, trim: true },
    },
    { timestamps: true }
);

LabRegistrationRequestSchema.index({ status: 1, createdAt: -1 });
LabRegistrationRequestSchema.index({ labName: 'text', contactName: 'text', phone: 'text', email: 'text' });

export const LabRegistrationRequest = mongoose.model<ILabRegistrationRequest>(
    'LabRegistrationRequest',
    LabRegistrationRequestSchema
);
