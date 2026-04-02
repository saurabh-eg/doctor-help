import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType } from './notification.model';

export interface INotificationPreference extends Document {
  userId: string;
  categories: {
    appointments: boolean;
    labOrders: boolean;
    payments: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
  };
  mutedTypes: NotificationType[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    categories: {
      appointments: { type: Boolean, default: true },
      labOrders: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '07:00' },
      timezone: { type: String, default: 'Asia/Kolkata' },
    },
    mutedTypes: {
      type: [
        {
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
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const NotificationPreference = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  NotificationPreferenceSchema
);
