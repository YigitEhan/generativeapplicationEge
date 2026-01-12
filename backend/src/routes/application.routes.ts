import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  applyToVacancy,
  getMyApplications,
  getMyApplicationById,
  withdrawApplication,
  getVacancyApplications,
  getApplicationById,
  updateApplicationStatus,
  downloadCV,
} from '../controllers/application.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Applications - Applicant
 *     description: Endpoints for job applicants to manage their applications
 *   - name: Applications - Recruiter
 *     description: Endpoints for recruiters to manage applications
 */

// ============================================
// APPLICANT ENDPOINTS
// ============================================

/**
 * Apply to vacancy
 * Supports CV file upload OR structured CV JSON
 */
router.post(
  '/',
  authenticate,
  upload.single('cvFile'),
  applyToVacancy
);

/**
 * Get my applications (list)
 */
router.get(
  '/mine',
  authenticate,
  getMyApplications
);

/**
 * Get my application detail with timeline
 */
router.get(
  '/mine/:id',
  authenticate,
  getMyApplicationById
);

/**
 * Withdraw application
 */
router.post(
  '/:id/withdraw',
  authenticate,
  withdrawApplication
);

// ============================================
// RECRUITER/ADMIN ENDPOINTS
// ============================================

/**
 * Get application detail (Recruiter/Admin)
 * Must be placed BEFORE /:id to avoid route conflicts
 */
router.get(
  '/:id',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  getApplicationById
);

/**
 * Update application status (Recruiter/Admin)
 */
router.put(
  '/:id/status',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  updateApplicationStatus
);

/**
 * Download CV file
 */
router.get(
  '/cv/:cvId/download',
  authenticate,
  downloadCV
);

export default router;

