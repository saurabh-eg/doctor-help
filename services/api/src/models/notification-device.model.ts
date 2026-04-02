import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationDevice extends Document {
  userId: string;
  token: string;
  platform: 'android' | 'ios' | 'web' | 'unknown';
  appVersion?: string;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationDeviceSchema = new Schema<INotificationDevice>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['android', 'ios', 'web', 'unknown'],
      default: 'unknown',
      index: true,
    },
    appVersion: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

NotificationDeviceSchema.index({ userId: 1, isActive: 1, platform: 1 });

export const NotificationDevice = mongoose.model<INotificationDevice>(
  'NotificationDevice',
  NotificationDeviceSchema
);
