import fs from 'fs';
import * as admin from 'firebase-admin';
import type { ServiceAccount, messaging } from 'firebase-admin';
import { NotificationDevice } from '../../models';

type PushDispatchPayload = {
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  relatedModel?: string;
  notificationId?: string;
};

let isFirebaseInitAttempted = false;
let isFirebaseReady = false;

const initFirebaseAdmin = () => {
  if (isFirebaseInitAttempted) return isFirebaseReady;
  isFirebaseInitAttempted = true;

  try {
    if (admin.apps.length > 0) {
      isFirebaseReady = true;
      return true;
    }

    const serviceAccountJson = process.env.FCM_SERVICE_ACCOUNT_JSON;
    const serviceAccountPath = process.env.FCM_SERVICE_ACCOUNT_PATH;

    if (serviceAccountJson) {
      const credentials = JSON.parse(serviceAccountJson) as ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
      isFirebaseReady = true;
      return true;
    }

    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const raw = fs.readFileSync(serviceAccountPath, 'utf8');
      const credentials = JSON.parse(raw) as ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
      isFirebaseReady = true;
      return true;
    }

    // Fallback to ADC if available (GOOGLE_APPLICATION_CREDENTIALS, etc.)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    isFirebaseReady = true;
    return true;
  } catch (error) {
    console.warn('FCM is not configured or failed to initialize:', error);
    isFirebaseReady = false;
    return false;
  }
};

const isInvalidTokenError = (code?: string) => {
  if (!code) return false;
  return [
    'messaging/invalid-registration-token',
    'messaging/registration-token-not-registered',
    'messaging/invalid-argument',
  ].includes(code);
};

export const dispatchPushNotification = async (payload: PushDispatchPayload) => {
  try {
    const devices = await NotificationDevice.find({
      userId: payload.userId,
      isActive: true,
    }).lean();

    if (!devices.length) return;
    if (!initFirebaseAdmin()) return;

    const tokens = devices.map((device) => device.token).filter(Boolean);
    if (!tokens.length) return;

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.message,
      },
      data: {
        type: payload.type,
        relatedId: payload.relatedId || '',
        relatedModel: payload.relatedModel || '',
        notificationId: payload.notificationId || '',
      },
      android: {
        priority: 'high',
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
    });

    const invalidTokens: string[] = [];
    (response.responses as messaging.SendResponse[]).forEach((result, index) => {
      if (result.success) return;
      const token = tokens[index];
      const code = result.error?.code;
      if (isInvalidTokenError(code) && token) {
        invalidTokens.push(token);
      }
    });

    if (invalidTokens.length) {
      await NotificationDevice.updateMany(
        { token: { $in: invalidTokens } },
        { $set: { isActive: false } }
      );
    }
  } catch (error) {
    console.error('dispatchPushNotification error:', error);
  }
};
