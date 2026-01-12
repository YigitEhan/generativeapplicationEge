import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

/**
 * Create evaluation schema (Recruiter or Interviewer)
 */
export const createEvaluationSchema = z.object({
  rating: z.number().int().min(1).max(10),
  comments: z.string().optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  recommendation: z.enum(['REJECT', 'MAYBE', 'PROCEED', 'STRONG_YES']).optional(),
});

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;

/**
 * Update application status with business rules
 */
export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
});

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;

/**
 * Manager recommendation schema
 */
export const managerRecommendationSchema = z.object({
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  suggestedDecision: z.enum(['REJECT', 'PROCEED_WITH_CAUTION', 'RECOMMEND_HIRE', 'STRONG_RECOMMEND_HIRE']),
  confidential: z.boolean().default(false),
});

export type ManagerRecommendationInput = z.infer<typeof managerRecommendationSchema>;

/**
 * Query parameters for manager's department vacancies
 */
export const managerVacanciesQuerySchema = z.object({
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ManagerVacanciesQuery = z.infer<typeof managerVacanciesQuerySchema>;

/**
 * Status transition rules
 */
export const STATUS_TRANSITION_RULES = {
  APPLIED: ['SCREENING', 'REJECTED', 'WITHDRAWN'],
  SCREENING: ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
  OFFERED: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  ACCEPTED: [], // Terminal state
  REJECTED: [], // Terminal state
  WITHDRAWN: [], // Terminal state
} as const;

/**
 * Validate status transition
 */
export function validateStatusTransition(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): { valid: boolean; error?: string } {
  // Same status is always valid (no-op)
  if (currentStatus === newStatus) {
    return { valid: true };
  }

  // Check if transition is allowed
  const allowedTransitions = STATUS_TRANSITION_RULES[currentStatus];
  
  if (!allowedTransitions.includes(newStatus as any)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(', ') || 'none (terminal state)'}`,
    };
  }

  return { valid: true };
}

/**
 * Business rules for status changes
 */
export const STATUS_BUSINESS_RULES = {
  INTERVIEW: {
    requiresEvaluation: false, // Can schedule interview without evaluation
    requiresMinRating: false,
    description: 'Can schedule interview after screening',
  },
  OFFERED: {
    requiresEvaluation: true, // Must have at least one evaluation
    requiresMinRating: 6, // Minimum average rating of 6/10
    description: 'Requires positive evaluation with min rating 6/10',
  },
  ACCEPTED: {
    requiresEvaluation: true,
    requiresMinRating: 6,
    description: 'Requires offer to be extended first',
  },
} as const;

/**
 * Validate business rules for status change
 */
export function validateBusinessRules(
  newStatus: ApplicationStatus,
  evaluations: Array<{ rating: number }>,
  currentStatus: ApplicationStatus
): { valid: boolean; error?: string } {
  const rules = STATUS_BUSINESS_RULES[newStatus as keyof typeof STATUS_BUSINESS_RULES];
  
  if (!rules) {
    return { valid: true }; // No special rules for this status
  }

  // Check if evaluation is required
  if (rules.requiresEvaluation && evaluations.length === 0) {
    return {
      valid: false,
      error: `Cannot move to ${newStatus}: ${rules.description}`,
    };
  }

  // Check minimum rating
  if (rules.requiresMinRating && evaluations.length > 0) {
    const avgRating = evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length;
    if (avgRating < rules.requiresMinRating) {
      return {
        valid: false,
        error: `Cannot move to ${newStatus}: Average rating (${avgRating.toFixed(1)}) is below minimum required (${rules.requiresMinRating})`,
      };
    }
  }

  // Special rule for ACCEPTED: must be OFFERED first
  if (newStatus === 'ACCEPTED' && currentStatus !== 'OFFERED') {
    return {
      valid: false,
      error: 'Cannot accept application: Must be in OFFERED status first',
    };
  }

  return { valid: true };
}

