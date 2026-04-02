import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminAuditLog extends Document {
    adminUserId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    meta?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
    {
        adminUserId: { type: String, required: true, index: true },
        action: { type: String, required: true, trim: true },
        resourceType: { type: String, required: true, default: 'lab_order', trim: true },
        resourceId: { type: String, required: true, index: true, trim: true },
        meta: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

AdminAuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

export const AdminAuditLog = mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);