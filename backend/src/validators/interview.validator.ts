import { z } from 'zod';

/**
 * Schedule Interview Schema
 */
export const scheduleInterviewSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  round: z.number().int().min(1).default(1),
  scheduledAt: z.string().datetime({ message: 'Invalid datetime format' }),
  duration: z.number().int().min(15).max(480), // 15 minutes to 8 hours
  location: z.string().optional(), // Physical location or meeting link
  notes: z.string().optional(),
  interviewerIds: z.array(z.string().uuid()).min(1, 'At least one interviewer is required'),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;

/**
 * Reschedule Interview Schema
 */
export const rescheduleInterviewSchema = z.object({
  scheduledAt: z.string().datetime({ message: 'Invalid datetime format' }),
  duration: z.number().int().min(15).max(480).optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  reason: z.string().min(1, 'Reason for rescheduling is required'),
});

export type RescheduleInterviewInput = z.infer<typeof rescheduleInterviewSchema>;

/**
 * Cancel Interview Schema
 */
export const cancelInterviewSchema = z.object({
  reason: z.string().min(1, 'Reason for cancellation is required'),
});

export type CancelInterviewInput = z.infer<typeof cancelInterviewSchema>;

/**
 * Assign Interviewers Schema
 */
export const assignInterviewersSchema = z.object({
  interviewerIds: z.array(z.string().uuid()).min(1, 'At least one interviewer is required'),
});

export type AssignInterviewersInput = z.infer<typeof assignInterviewersSchema>;

/**
 * Complete Interview Schema (Interviewer)
 */
export const completeInterviewSchema = z.object({
  feedback: z.string().optional(),
  rating: z.number().int().min(1).max(10).optional(),
  recommendation: z.enum(['REJECT', 'MAYBE', 'PROCEED', 'STRONG_YES']).optional(),
  attended: z.boolean().default(true),
});

export type CompleteInterviewInput = z.infer<typeof completeInterviewSchema>;

/**
 * Get Interviewer Interviews Query
 */
export const getInterviewerInterviewsSchema = z.object({
  status: z.enum(['SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type GetInterviewerInterviewsQuery = z.infer<typeof getInterviewerInterviewsSchema>;

