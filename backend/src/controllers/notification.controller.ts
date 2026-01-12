import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import {
  getNotificationsSchema,
  markAsReadSchema,
  markAllAsReadSchema,
} from '../validators/notification.validator';

const notificationService = new NotificationService();

/**
 * @swagger
 * /api/notifications/mine:
 *   get:
 *     summary: Get current user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of notifications to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of notifications to skip
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 unreadCount:
 *                   type: integer
 */
export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const validated = getNotificationsSchema.parse({ query: req.query });
    const userId = (req as any).user.id;

    const { notifications, total } = await notificationService.getUserNotifications(
      userId,
      validated.query
    );

    const unreadCount = await notificationService.getUnreadCount(userId);

    res.json({
      notifications,
      total,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error getting notifications:', error);
    res.status(400).json({ error: error.message || 'Failed to get notifications' });
  }
};

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   post:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const validated = markAsReadSchema.parse({ params: req.params });
    const userId = (req as any).user.id;

    const notification = await notificationService.markAsRead(validated.params.id, userId);

    res.json(notification);
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    if (error.message === 'Notification not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message || 'Failed to mark notification as read' });
    }
  }
};

/**
 * @swagger
 * /api/notifications/read-all:
 *   post:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of notifications marked as read
 */
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    markAllAsReadSchema.parse({ body: req.body });
    const userId = (req as any).user.id;

    const result = await notificationService.markAllAsRead(userId);

    res.json({ count: result.count });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(400).json({ error: error.message || 'Failed to mark all notifications as read' });
  }
};

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.json({ count });
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    res.status(400).json({ error: error.message || 'Failed to get unread count' });
  }
};

