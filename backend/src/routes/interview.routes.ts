import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  scheduleInterview,
  rescheduleInterview,
  cancelInterview,
  assignInterviewers,
  getInterviewerInterviews,
  getInterviewDetails,
  completeInterview,
  getAllInterviews,
} from '../controllers/interview.controller';

const router = Router();

// ============================================
// RECRUITER ROUTES
// ============================================

/**
 * Get all interviews (Recruiter only)
 * GET /api/interviews
 */
router.get(
  '/interviews',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  getAllInterviews
);

/**
 * Schedule an interview for an application
 * POST /api/applications/:id/interviews
 */
router.post(
  '/applications/:id/interviews',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  scheduleInterview
);

/**
 * Reschedule an interview
 * PUT /api/interviews/:id/reschedule
 */
router.put(
  '/interviews/:id/reschedule',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  rescheduleInterview
);

/**
 * Cancel an interview
 * POST /api/interviews/:id/cancel
 */
router.post(
  '/interviews/:id/cancel',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  cancelInterview
);

/**
 * Assign interviewers to an interview
 * POST /api/interviews/:id/assign-interviewers
 */
router.post(
  '/interviews/:id/assign-interviewers',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  assignInterviewers
);

// ============================================
// INTERVIEWER ROUTES
// ============================================

/**
 * Get all interviews assigned to the interviewer
 * GET /api/interviewer/interviews
 */
router.get(
  '/interviewer/interviews',
  authenticate,
  requireRole('INTERVIEWER', 'MANAGER', 'ADMIN'),
  getInterviewerInterviews
);

/**
 * Get interview details (including candidate CV and evaluations)
 * GET /api/interviewer/interviews/:id
 */
router.get(
  '/interviewer/interviews/:id',
  authenticate,
  requireRole('INTERVIEWER', 'MANAGER', 'ADMIN'),
  getInterviewDetails
);

/**
 * Mark interview as complete
 * POST /api/interviewer/interviews/:id/complete
 */
router.post(
  '/interviewer/interviews/:id/complete',
  authenticate,
  requireRole('INTERVIEWER', 'MANAGER', 'ADMIN'),
  completeInterview
);

export default router;

