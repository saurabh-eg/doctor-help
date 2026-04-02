import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 
  | 'appointment_booked'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_completed'
  | 'lab_order_created'
  | 'lab_order_confirmed'
  | 'lab_order_sample_collected'
  | 'lab_order_processing'
  | 'lab_order_report_ready'
  | 'lab_order_completed'
  | 'lab_order_cancelled'
  | 'payment_processed'
  | 'payment_failed'
  | 'system_message';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string; // appointmentId, labOrderId, etc.
  relatedModel?: 'Appointment' | 'LabOrder' | 'Payment';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'appointment_booked',
        'appointment_confirmed',
        'appointment_cancelled',
        'appointment_completed',
        'lab_order_created',
        'lab_order_confirmed',
        'lab_order_sample_collected',
        'lab_order_processing',
        'lab_order_report_ready',
        'lab_order_completed',
        'lab_order_cancelled',
        'payment_processed',
        'payment_failed',
        'system_message',
      ],
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedId: {
      type: String,
      index: true,
    },
    relatedModel: {
      type: String,
      enum: ['Appointment', 'LabOrder', 'Payment'],
    },
  },
  { timestamps: true }
);

// Composite index for efficient queries (userId + isRead + createdAt)
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);
