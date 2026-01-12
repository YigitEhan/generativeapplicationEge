import { z } from 'zod';
import { VacancyRequestStatus } from '@prisma/client';

/**
 * Create vacancy request schema
 * Used by managers to create new vacancy requests
 */
export const createVacancyRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  departmentId: z.string().uuid('Invalid department ID'),
  justification: z.string().optional(),
  numberOfPositions: z.number().int().min(1, 'Must request at least 1 position').default(1),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill must be specified'),
  experienceLevel: z.string().optional(),
  salaryRange: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING']).optional().default('DRAFT'),
});

/**
 * Update vacancy request schema
 * Used by managers to update their own requests (if not approved)
 */
export const updateVacancyRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  departmentId: z.string().uuid().optional(),
  justification: z.string().optional(),
  numberOfPositions: z.number().int().min(1).optional(),
  requiredSkills: z.array(z.string()).min(1).optional(),
  experienceLevel: z.string().optional(),
  salaryRange: z.string().optional(),
});

/**
 * Decline vacancy request schema
 * Used by recruiters/admins to decline a request with a reason
 */
export const declineVacancyRequestSchema = z.object({
  declinedReason: z.string().min(1, 'Reason for declining is required').max(500),
});

/**
 * Query parameters for listing vacancy requests
 */
export const vacancyRequestQuerySchema = z.object({
  status: z.nativeEnum(VacancyRequestStatus).optional(),
  departmentId: z.string().uuid().optional(),
  requestedBy: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateVacancyRequestInput = z.infer<typeof createVacancyRequestSchema>;
export type UpdateVacancyRequestInput = z.infer<typeof updateVacancyRequestSchema>;
export type DeclineVacancyRequestInput = z.infer<typeof declineVacancyRequestSchema>;
export type VacancyRequestQuery = z.infer<typeof vacancyRequestQuerySchema>;

