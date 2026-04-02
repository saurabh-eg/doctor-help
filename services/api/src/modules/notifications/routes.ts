import { NextFunction, Response, Router } from 'express';
import { jwtVerify } from 'jose';
import { auth, AuthenticatedRequest } from '../../middleware/auth';
import { getJwtSecret } from '../../utils/jwt';
import {
  streamNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  registerPushDevice,
  unregisterPushDevice,
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from './controller';

const router = Router();

// EventSource clients cannot always send Authorization headers;
// allow ?token=<jwt> only for the SSE stream endpoint.
const sseAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return auth(req, res, next);
  }

  try {
    const token = typeof req.query.token === 'string' ? req.query.token : undefined;
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const { payload } = await jwtVerify(token, getJwtSecret());
    req.user = payload as any;
    return next();
  } catch (error) {
    console.error('❌ SSE Auth Error:', error);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

router.get('/stream', sseAuth, streamNotifications);

/**
 * All notification routes require authentication
 */
router.use(auth);

router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updateNotificationPreferences);
router.patch('/preferences', updateNotificationPreferences);
router.post('/devices/register', registerPushDevice);
router.post('/devices/unregister', unregisterPushDevice);

/**
 * GET /api/notifications
 * Fetch user's notifications (paginated)
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 10, max: 50)
 *   - isRead: boolean (optional filter)
 */
router.get('/', getNotifications);

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', getUnreadCount);

/**
 * GET /api/notifications/:id
 * Get single notification by ID
 */
router.get('/:id', getNotificationById);

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', markAsRead);
router.patch('/:id/read', markAsRead);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', markAllAsRead);
router.patch('/read-all', markAllAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete('/:id', deleteNotification);

/**
 * DELETE /api/notifications
 * Delete all notifications
 */
router.delete('/', deleteAllNotifications);

export { router as notificationsRouter };
