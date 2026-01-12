import { Router } from 'express';
import { VacancyController } from '../controllers/vacancy.controller';

const router = Router();
const vacancyController = new VacancyController();

/**
 * @swagger
 * tags:
 *   name: Public
 *   description: Public endpoints (no authentication required)
 */

/**
 * @swagger
 * /api/public/vacancies:
 *   get:
 *     summary: Get public vacancies
 *     description: Get all published and open vacancies (no authentication required)
 *     tags: [Public]
 *     parameters:
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
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: experienceYears
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Filter by maximum required experience years
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
 *           maximum: 50
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of public vacancies with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       requirements:
 *                         type: array
 *                         items:
 *                           type: string
 *                       responsibilities:
 *                         type: array
 *                         items:
 *                           type: string
 *                       qualifications:
 *                         type: array
 *                         items:
 *                           type: string
 *                       benefits:
 *                         type: array
 *                         items:
 *                           type: string
 *                       salaryMin:
 *                         type: number
 *                       salaryMax:
 *                         type: number
 *                       location:
 *                         type: string
 *                       employmentType:
 *                         type: string
 *                       experienceYears:
 *                         type: integer
 *                       educationLevel:
 *                         type: string
 *                       numberOfPositions:
 *                         type: integer
 *                       deadline:
 *                         type: string
 *                         format: date-time
 *                       publishedAt:
 *                         type: string
 *                         format: date-time
 *                       department:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                       _count:
 *                         type: object
 *                         properties:
 *                           applications:
 *                             type: integer
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
 *       400:
 *         description: Validation error
 */
router.get('/vacancies', vacancyController.getPublicVacancies.bind(vacancyController));

/**
 * @swagger
 * /api/public/vacancies/{id}:
 *   get:
 *     summary: Get public vacancy by ID
 *     description: Get details of a published and open vacancy (no authentication required)
 *     tags: [Public]
 */
router.get('/vacancies/:id', vacancyController.getPublicVacancyById.bind(vacancyController));

export default router;

