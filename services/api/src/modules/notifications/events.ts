import { NotificationType } from '../../models/notification.model';
import { createNotificationInternal } from './controller';

type RelatedModel = 'Appointment' | 'LabOrder' | 'Payment';

type NotificationPayload = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
  relatedModel?: RelatedModel;
};

const safeCreate = async (payload: NotificationPayload) => {
  try {
    await createNotificationInternal(
      payload.userId,
      payload.title,
      payload.message,
      payload.type,
      payload.relatedId,
      payload.relatedModel
    );
  } catch (error) {
    console.error('Notification dispatch failed:', error);
  }
};

export const notifyAppointmentBooked = async (params: {
  patientUserId: string;
  doctorUserId?: string;
  appointmentId: string;
}) => {
  const { patientUserId, doctorUserId, appointmentId } = params;

  const tasks: Promise<void>[] = [
    safeCreate({
      userId: patientUserId,
      title: 'Appointment Booked',
      message: 'Your appointment request has been created successfully.',
      type: 'appointment_booked',
      relatedId: appointmentId,
      relatedModel: 'Appointment',
    }),
  ];

  if (doctorUserId) {
    tasks.push(
      safeCreate({
        userId: doctorUserId,
        title: 'New Appointment Request',
        message: 'A patient has booked a new appointment with you.',
        type: 'appointment_booked',
        relatedId: appointmentId,
        relatedModel: 'Appointment',
      })
    );
  }

  await Promise.all(tasks);
};

export const notifyAppointmentStatusChanged = async (params: {
  patientUserId: string;
  doctorUserId?: string;
  appointmentId: string;
  status: string;
}) => {
  const { patientUserId, doctorUserId, appointmentId, status } = params;

  const statusMap: Record<string, { type: NotificationType; title: string; message: string }> = {
    confirmed: {
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message: 'Your appointment has been confirmed.',
    },
    cancelled: {
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: 'Your appointment has been cancelled.',
    },
    completed: {
      type: 'appointment_completed',
      title: 'Appointment Completed',
      message: 'Your appointment is marked as completed.',
    },
  };

  const cfg = statusMap[status];
  if (!cfg) return;

  const tasks: Promise<void>[] = [
    safeCreate({
      userId: patientUserId,
      title: cfg.title,
      message: cfg.message,
      type: cfg.type,
      relatedId: appointmentId,
      relatedModel: 'Appointment',
    }),
  ];

  if (doctorUserId) {
    tasks.push(
      safeCreate({
        userId: doctorUserId,
        title: cfg.title,
        message: `Appointment status changed to ${status}.`,
        type: cfg.type,
        relatedId: appointmentId,
        relatedModel: 'Appointment',
      })
    );
  }

  await Promise.all(tasks);
};

export const notifyLabOrderCreated = async (params: {
  patientUserId: string;
  labOwnerUserId?: string;
  orderId: string;
}) => {
  const { patientUserId, labOwnerUserId, orderId } = params;

  const tasks: Promise<void>[] = [
    safeCreate({
      userId: patientUserId,
      title: 'Lab Order Created',
      message: 'Your lab order has been created successfully.',
      type: 'lab_order_created',
      relatedId: orderId,
      relatedModel: 'LabOrder',
    }),
  ];

  if (labOwnerUserId) {
    tasks.push(
      safeCreate({
        userId: labOwnerUserId,
        title: 'New Lab Order',
        message: 'A new lab order has been placed.',
        type: 'lab_order_created',
        relatedId: orderId,
        relatedModel: 'LabOrder',
      })
    );
  }

  await Promise.all(tasks);
};

export const notifyLabOrderStatusChanged = async (params: {
  patientUserId: string;
  orderId: string;
  status: string;
}) => {
  const { patientUserId, orderId, status } = params;

  const statusMap: Record<string, { type: NotificationType; title: string; message: string }> = {
    confirmed: {
      type: 'lab_order_confirmed',
      title: 'Lab Order Confirmed',
      message: 'Your lab order has been confirmed by the lab.',
    },
    sample_collected: {
      type: 'lab_order_sample_collected',
      title: 'Sample Collected',
      message: 'Your sample has been collected successfully.',
    },
    processing: {
      type: 'lab_order_processing',
      title: 'Sample Processing',
      message: 'Your lab sample is now being processed.',
    },
    report_ready: {
      type: 'lab_order_report_ready',
      title: 'Lab Report Ready',
      message: 'Your lab report is ready to view.',
    },
    completed: {
      type: 'lab_order_completed',
      title: 'Lab Order Completed',
      message: 'Your lab order has been completed.',
    },
    cancelled: {
      type: 'lab_order_cancelled',
      title: 'Lab Order Cancelled',
      message: 'Your lab order has been cancelled.',
    },
  };

  const cfg = statusMap[status];
  if (!cfg) return;

  await safeCreate({
    userId: patientUserId,
    title: cfg.title,
    message: cfg.message,
    type: cfg.type,
    relatedId: orderId,
    relatedModel: 'LabOrder',
  });
};

export const notifyPaymentStatus = async (params: {
  userId: string;
  paymentId: string;
  status: 'success' | 'failed';
}) => {
  const { userId, paymentId, status } = params;

  if (status === 'success') {
    await safeCreate({
      userId,
      title: 'Payment Processed',
      message: 'Your payment has been processed successfully.',
      type: 'payment_processed',
      relatedId: paymentId,
      relatedModel: 'Payment',
    });
    return;
  }

  await safeCreate({
    userId,
    title: 'Payment Failed',
    message: 'Your payment failed. Please try again.',
    type: 'payment_failed',
    relatedId: paymentId,
    relatedModel: 'Payment',
  });
};
