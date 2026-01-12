import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  getManagerVacancies,
  getApplicationForManager,
  createManagerRecommendation,
} from '../controllers/evaluation.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Manager
 *     description: Manager-specific endpoints for department oversight
 */

/**
 * Get vacancies for manager's department
 */
router.get(
  '/vacancies',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  getManagerVacancies
);

/**
 * Get application detail with all evaluations
 */
router.get(
  '/applications/:id',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  getApplicationForManager
);

/**
 * Create manager recommendation
 */
router.post(
  '/applications/:id/recommendation',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  createManagerRecommendation
);

export default router;

