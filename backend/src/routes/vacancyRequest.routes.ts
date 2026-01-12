import { Router } from 'express';
import { VacancyRequestController } from '../controllers/vacancyRequest.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const controller = new VacancyRequestController();

/**
 * @swagger
 * tags:
 *   name: VacancyRequests
 *   description: Vacancy request management endpoints
 */

// Manager endpoints - Create and manage their own requests
router.post(
  '/',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  controller.create.bind(controller)
);

router.put(
  '/:id',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  controller.update.bind(controller)
);

router.post(
  '/:id/submit',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  controller.submit.bind(controller)
);

router.post(
  '/:id/cancel',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  controller.cancel.bind(controller)
);

// Recruiter/Admin endpoints - Approve/decline requests
router.post(
  '/:id/approve',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  controller.approve.bind(controller)
);

router.post(
  '/:id/decline',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  controller.decline.bind(controller)
);

// Read endpoints - All authenticated users can view (with role-based filtering)
router.get(
  '/',
  authenticate,
  controller.getAll.bind(controller)
);

router.get(
  '/:id',
  authenticate,
  controller.getById.bind(controller)
);

// Delete endpoint - Admin or Manager (if DRAFT)
router.delete(
  '/:id',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  controller.delete.bind(controller)
);

export default router;

