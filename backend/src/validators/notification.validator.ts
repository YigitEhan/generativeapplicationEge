import { z } from 'zod';

/**
 * Get notifications query schema
 */
export const getNotificationsSchema = z.object({
  query: z.object({
    isRead: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    type: z.string().optional(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    offset: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
  }),
});

/**
 * Mark as read schema
 */
export const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Mark all as read schema (no params needed, just validates the request)
 */
export const markAllAsReadSchema = z.object({
  body: z.object({}).optional(),
});

