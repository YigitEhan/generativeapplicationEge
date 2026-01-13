import { Router } from 'express';
import { VacancyController } from '../controllers/vacancy.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { getVacancyApplications, applyToVacancy } from '../controllers/application.controller';
import { upload } from '../middleware/upload';

const router = Router();
const vacancyController = new VacancyController();

/**
 * @swagger
 * tags:
 *   name: Vacancies
 *   description: Vacancy management endpoints (Recruiter/Admin only)
 */

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * Get public vacancies (no auth required)
 * GET /api/vacancies/public
 */
router.get('/public', vacancyController.getPublicVacancies.bind(vacancyController));

/**
 * Get public vacancy by ID (no auth required)
 * GET /api/vacancies/public/:id
 */
router.get('/public/:id', vacancyController.getPublicVacancyById.bind(vacancyController));

// ============================================
// APPLICANT ROUTES
// ============================================

/**
 * Apply to vacancy
 * POST /api/vacancies/:id/apply
 */
router.post(
  '/:id/apply',
  authenticate,
  upload.single('cvFile'),
  applyToVacancy
);

// ============================================
// RECRUITER/ADMIN ROUTES
// ============================================

/**
 * @swagger
 * /api/vacancies:
 *   post:
 *     summary: Create vacancy from approved request
 *     description: Recruiters and admins can create vacancies from approved vacancy requests
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVacancy'
 *           example:
 *             vacancyRequestId: "550e8400-e29b-41d4-a716-446655440000"
 *             title: "Senior Software Engineer"
 *             description: "We are looking for an experienced software engineer..."
 *             requirements: ["5+ years experience", "TypeScript", "React"]
 *             responsibilities: ["Lead development", "Code reviews"]
 *             qualifications: ["Bachelor's degree in CS"]
 *             benefits: ["Health insurance", "Remote work"]
 *             salaryMin: 80000
 *             salaryMax: 120000
 *             location: "Remote"
 *             employmentType: "FULL_TIME"
 *             experienceYears: 5
 *             educationLevel: "Bachelor's"
 *             deadline: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Vacancy created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vacancy'
 *       400:
 *         description: Validation error or business rule violation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires RECRUITER or ADMIN role
 */
router.post(
  '/',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  vacancyController.create.bind(vacancyController)
);

/**
 * @swagger
 * /api/vacancies/{id}:
 *   put:
 *     summary: Update vacancy
 *     description: Recruiters and admins can update vacancy details (cannot update closed vacancies)
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vacancy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVacancy'
 *           example:
 *             title: "Senior Software Engineer - Updated"
 *             salaryMax: 130000
 *     responses:
 *       200:
 *         description: Vacancy updated successfully
 *       400:
 *         description: Validation error or cannot update closed vacancy
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  '/:id',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  vacancyController.update.bind(vacancyController)
);

/**
 * @swagger
 * /api/vacancies/{id}/publish:
 *   post:
 *     summary: Publish vacancy
 *     description: Make vacancy visible to public (changes status to OPEN)
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vacancy ID
 *     responses:
 *       200:
 *         description: Vacancy published successfully
 *       400:
 *         description: Vacancy already published or closed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/:id/publish',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  vacancyController.publish.bind(vacancyController)
);

/**
 * @swagger
 * /api/vacancies/{id}/unpublish:
 *   post:
 *     summary: Unpublish vacancy
 *     description: Hide vacancy from public (changes status to DRAFT)
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vacancy ID
 */
router.post(
  '/:id/unpublish',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  vacancyController.unpublish.bind(vacancyController)
);

/**
 * @swagger
 * /api/vacancies/{id}/close:
 *   post:
 *     summary: Close vacancy
 *     description: Close vacancy and stop accepting applications
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vacancy ID
 *     responses:
 *       200:
 *         description: Vacancy closed successfully
 *       400:
 *         description: Vacancy already closed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/:id/close',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  vacancyController.close.bind(vacancyController)
);

/**
 * @swagger
 * /api/vacancies:
 *   get:
 *     summary: Get all vacancies
 *     description: Recruiters and admins can view all vacancies with filters
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, OPEN, CLOSED]
 *         description: Filter by status
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by department
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP]
 *         description: Filter by employment type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of vacancies with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vacancy'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  vacancyController.getAll.bind(vacancyController)
);

/**
 * @swagger
 * /api/vacancies/{id}:
 *   get:
 *     summary: Get vacancy by ID
 *     description: Recruiters and admins can view any vacancy details
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vacancy ID
 *     responses:
 *       200:
 *         description: Vacancy details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vacancy'
 *       400:
 *         description: Vacancy not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/:id',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  vacancyController.getById.bind(vacancyController)
);

/**
 * @swagger
 * /api/vacancies/{id}:
 *   delete:
 *     summary: Delete vacancy
 *     description: Admins can delete vacancies (only if no applications exist)
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vacancy ID
 *     responses:
 *       200:
 *         description: Vacancy deleted successfully
 *       400:
 *         description: Cannot delete vacancy with applications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires ADMIN role
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  vacancyController.delete.bind(vacancyController)
);

/**
 * @swagger
 * /api/vacancies/{vacancyId}/applications:
 *   get:
 *     summary: Get all applications for a vacancy
 *     description: List all applications for a specific vacancy (Recruiter/Admin only)
 *     tags: [Vacancies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vacancyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [APPLIED, SCREENING, INTERVIEW, OFFERED, ACCEPTED, REJECTED, WITHDRAWN]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of applications for the vacancy
 */
router.get(
  '/:vacancyId/applications',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  getVacancyApplications
);

export default router;

