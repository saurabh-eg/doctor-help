import { NotificationPreference } from '../../models';
import { NotificationType } from '../../models/notification.model';

const HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  categories: {
    appointments: true,
    labOrders: true,
    payments: true,
    system: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
    timezone: 'Asia/Kolkata',
  },
  mutedTypes: [] as NotificationType[],
};

const typeToCategory = (type: NotificationType): keyof typeof DEFAULT_NOTIFICATION_PREFERENCES.categories => {
  if (type.startsWith('appointment_')) return 'appointments';
  if (type.startsWith('lab_order_')) return 'labOrders';
  if (type.startsWith('payment_')) return 'payments';
  return 'system';
};

const parseMinutes = (hhmm: string): number | null => {
  const match = hhmm.match(HH_MM_REGEX);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h * 60 + m;
};

const getLocalMinutes = (date: Date, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return hour * 60 + minute;
};

const isWithinQuietHours = (nowMinutes: number, startMinutes: number, endMinutes: number): boolean => {
  if (startMinutes === endMinutes) {
    return true;
  }

  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }

  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
};

export const getOrCreateNotificationPreferences = async (userId: string) => {
  const existing = await NotificationPreference.findOne({ userId }).lean();
  if (existing) return existing;

  const created = await NotificationPreference.create({
    userId,
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  });

  return created.toObject();
};

export const shouldSendNotification = async (userId: string, type: NotificationType, now = new Date()) => {
  const prefs = await getOrCreateNotificationPreferences(userId);

  if ((prefs.mutedTypes || []).includes(type)) {
    return false;
  }

  const category = typeToCategory(type);
  if (prefs.categories?.[category] === false) {
    return false;
  }

  const quiet = prefs.quietHours;
  if (!quiet?.enabled) {
    return true;
  }

  const start = parseMinutes(quiet.start);
  const end = parseMinutes(quiet.end);
  if (start === null || end === null) {
    return true;
  }

  let nowMinutes = 0;
  try {
    nowMinutes = getLocalMinutes(now, quiet.timezone || 'UTC');
  } catch {
    nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  }

  return !isWithinQuietHours(nowMinutes, start, end);
};

export const sanitizePreferencesPayload = (body: any) => {
  const next: any = {};

  if (body?.categories && typeof body.categories === 'object') {
    next.categories = {};
    for (const key of ['appointments', 'labOrders', 'payments', 'system']) {
      if (typeof body.categories[key] === 'boolean') {
        next.categories[key] = body.categories[key];
      }
    }
  }

  if (body?.quietHours && typeof body.quietHours === 'object') {
    next.quietHours = {};
    if (typeof body.quietHours.enabled === 'boolean') {
      next.quietHours.enabled = body.quietHours.enabled;
    }
    if (typeof body.quietHours.start === 'string' && HH_MM_REGEX.test(body.quietHours.start)) {
      next.quietHours.start = body.quietHours.start;
    }
    if (typeof body.quietHours.end === 'string' && HH_MM_REGEX.test(body.quietHours.end)) {
      next.quietHours.end = body.quietHours.end;
    }
    if (typeof body.quietHours.timezone === 'string' && body.quietHours.timezone.trim().length > 0) {
      next.quietHours.timezone = body.quietHours.timezone.trim();
    }
  }

  if (Array.isArray(body?.mutedTypes)) {
    const allowed = new Set<NotificationType>([
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
    ]);

    next.mutedTypes = body.mutedTypes
      .map((t: unknown) => String(t))
      .filter((t: NotificationType) => allowed.has(t));
  }

  return next;
};
