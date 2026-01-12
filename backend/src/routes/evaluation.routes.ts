import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  createEvaluation,
  updateStatus,
} from '../controllers/evaluation.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Evaluations
 *     description: Evaluation and status management endpoints
 */

/**
 * Create evaluation for application
 * Recruiters: Can evaluate any application
 * Interviewers: Can only evaluate applications they're assigned to
 */
router.post(
  '/:id/evaluations',
  authenticate,
  requireRole('RECRUITER', 'INTERVIEWER'),
  createEvaluation
);

/**
 * Update application status with business rules
 * Only recruiters can change status
 */
router.post(
  '/:id/status',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  updateStatus
);

export default router;

