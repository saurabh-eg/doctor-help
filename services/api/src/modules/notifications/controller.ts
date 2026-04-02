import { Request, Response } from 'express';
import { Notification } from '../../models/notification.model';
import { NotificationDevice, NotificationPreference } from '../../models';
import { AuthenticatedRequest } from '../../middleware/auth';
import { notificationSseHub } from './realtime';
import { dispatchPushNotification } from './push';
import {
  getOrCreateNotificationPreferences,
  sanitizePreferencesPayload,
  shouldSendNotification,
} from './preferences';

const toClientNotification = (notification: any) => ({
  id: String(notification._id || notification.id),
  title: notification.title,
  message: notification.message,
  type: notification.type,
  isRead: notification.isRead,
  relatedId: notification.relatedId,
  relatedModel: notification.relatedModel,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const emitUnreadCount = async (userId: string) => {
  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  notificationSseHub.emitToUser(userId, 'notification.unread_count', {
    unreadCount,
  });
};

/**
 * SSE stream for live notification events.
 */
export const streamNotifications = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  notificationSseHub.addClient(userId, res);
  await emitUnreadCount(userId);
};

/**
 * Get notification preferences for authenticated user.
 */
export const getNotificationPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const preferences = await getOrCreateNotificationPreferences(userId);
    return res.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
  }
};

/**
 * Update notification preferences for authenticated user.
 */
export const updateNotificationPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const patch = sanitizePreferencesPayload(req.body || {});
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid preference fields provided' });
    }

    const updated = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: patch },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
};

/**
 * Register/update a push notification device token.
 */
export const registerPushDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = String(req.body?.token || '').trim();
    const platformRaw = String(req.body?.platform || 'unknown').toLowerCase();
    const platform = ['android', 'ios', 'web'].includes(platformRaw)
      ? platformRaw
      : 'unknown';
    const appVersion = req.body?.appVersion
      ? String(req.body.appVersion).trim()
      : undefined;

    if (!token || token.length < 20) {
      return res.status(400).json({ success: false, error: 'Invalid device token' });
    }

    const device = await NotificationDevice.findOneAndUpdate(
      { token },
      {
        $set: {
          userId,
          platform,
          appVersion,
          isActive: true,
          lastSeenAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.json({
      success: true,
      message: 'Push device registered successfully',
      data: {
        id: String(device?._id || ''),
        platform,
      },
    });
  } catch (error) {
    console.error('registerPushDevice error:', error);
    return res.status(500).json({ success: false, error: 'Failed to register push device' });
  }
};

/**
 * Unregister/deactivate a push notification device token.
 */
export const unregisterPushDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = String(req.body?.token || '').trim();
    if (!token || token.length < 20) {
      return res.status(400).json({ success: false, error: 'Invalid device token' });
    }

    const result = await NotificationDevice.findOneAndUpdate(
      { userId, token },
      {
        $set: {
          isActive: false,
          lastSeenAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!result) {
      return res.status(404).json({ success: false, error: 'Device token not found' });
    }

    return res.json({
      success: true,
      message: 'Push device unregistered successfully',
    });
  } catch (error) {
    console.error('unregisterPushDevice error:', error);
    return res.status(500).json({ success: false, error: 'Failed to unregister push device' });
  }
};

/**
 * Get user's notifications (paginated, sorted by newest first)
 */
export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    // Optional filter by read status
    const isRead = req.query.isRead ? req.query.isRead === 'true' : undefined;

    const filter: any = { userId };
    if (isRead !== undefined) {
      filter.isRead = isRead;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
  }
};

/**
 * Get single notification by ID
 */
export const getNotificationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const notification = await Notification.findOne({
      _id: id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notification' });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    notificationSseHub.emitToUser(userId, 'notification.read', {
      notificationId: String(notification._id),
    });
    await emitUnreadCount(userId);

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    notificationSseHub.emitToUser(userId, 'notification.read_all', {
      modifiedCount: result.modifiedCount,
    });
    await emitUnreadCount(userId);

    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    notificationSseHub.emitToUser(userId, 'notification.deleted', {
      notificationId: String(notification._id),
    });
    await emitUnreadCount(userId);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await Notification.deleteMany({ userId });

    notificationSseHub.emitToUser(userId, 'notification.deleted_all', {
      deletedCount: result.deletedCount,
    });
    await emitUnreadCount(userId);

    res.json({
      success: true,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notifications' });
  }
};

/**
 * Internal function: Create notification (called by other modules)
 * NOT exposed as HTTP endpoint
 */
export const createNotificationInternal = async (
  userId: string,
  title: string,
  message: string,
  type: any,
  relatedId?: string,
  relatedModel?: string
) => {
  try {
    const canSend = await shouldSendNotification(userId, type);
    if (!canSend) {
      return null;
    }

    const notification = new Notification({
      userId,
      title,
      message,
      type,
      relatedId,
      relatedModel,
    });
    await notification.save();

    notificationSseHub.emitToUser(userId, 'notification.created', {
      notification: toClientNotification(notification),
    });
    await emitUnreadCount(userId);

    await dispatchPushNotification({
      userId,
      title,
      message,
      type,
      relatedId,
      relatedModel,
      notificationId: String(notification._id),
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
