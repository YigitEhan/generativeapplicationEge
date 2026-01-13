import { Router } from 'express';
import { TestController } from '../controllers/test.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const testController = new TestController();

// ============================================
// RECRUITER ROUTES
// ============================================

/**
 * Create a test for a vacancy
 */
router.post(
  '/vacancies/:id/test',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  testController.createTest.bind(testController)
);

/**
 * Get all tests for a vacancy
 */
router.get(
  '/vacancies/:id/tests',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  testController.getTestsForVacancy.bind(testController)
);

/**
 * Invite applicant to take a test
 */
router.post(
  '/applications/:id/test-invite',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  testController.inviteToTest.bind(testController)
);

/**
 * Get test attempt for an application (recruiter view)
 */
router.get(
  '/applications/:id/test-attempt',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  testController.getTestAttempt.bind(testController)
);

// ============================================
// APPLICANT ROUTES
// ============================================

/**
 * Get test for applicant (without correct answers)
 */
router.get(
  '/applications/:id/test',
  authenticate,
  requireRole('APPLICANT'),
  testController.getTestForApplicant.bind(testController)
);

/**
 * Submit internal quiz answers
 */
router.post(
  '/applications/:id/test/submit',
  authenticate,
  requireRole('APPLICANT'),
  testController.submitQuiz.bind(testController)
);

/**
 * Mark external test as complete
 */
router.post(
  '/applications/:id/test/mark-complete',
  authenticate,
  requireRole('APPLICANT'),
  testController.markExternalComplete.bind(testController)
);

export default router;

