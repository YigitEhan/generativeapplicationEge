import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from '../controllers/notification.controller';

const router = Router();

/**
 * Get current user's notifications
 * GET /api/notifications/mine
 */
router.get('/mine', authenticate, getMyNotifications);

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', authenticate, getUnreadCount);

/**
 * Mark notification as read
 * POST /api/notifications/:id/read
 */
router.post('/:id/read', authenticate, markNotificationAsRead);

/**
 * Mark all notifications as read
 * POST /api/notifications/read-all
 */
router.post('/read-all', authenticate, markAllNotificationsAsRead);

export default router;

