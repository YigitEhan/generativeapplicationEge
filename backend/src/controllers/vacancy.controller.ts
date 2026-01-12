import { Request, Response } from 'express';
import { VacancyService } from '../services/vacancy.service';
import {
  createVacancySchema,
  updateVacancySchema,
  vacancyQuerySchema,
  publicVacancyQuerySchema,
} from '../validators/vacancy.validator';
import { ZodError } from 'zod';

const vacancyService = new VacancyService();

/**
 * @swagger
 * components:
 *   schemas:
 *     Vacancy:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         vacancyRequestId:
 *           type: string
 *           format: uuid
 *         departmentId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *         salaryMin:
 *           type: number
 *         salaryMax:
 *           type: number
 *         location:
 *           type: string
 *         employmentType:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP]
 *         experienceYears:
 *           type: integer
 *         educationLevel:
 *           type: string
 *         numberOfPositions:
 *           type: integer
 *         deadline:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [DRAFT, OPEN, CLOSED]
 *         isPublished:
 *           type: boolean
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         closedAt:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateVacancy:
 *       type: object
 *       required:
 *         - vacancyRequestId
 *       properties:
 *         vacancyRequestId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *         salaryMin:
 *           type: number
 *           minimum: 0
 *         salaryMax:
 *           type: number
 *           minimum: 0
 *         location:
 *           type: string
 *         employmentType:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP]
 *         experienceYears:
 *           type: integer
 *           minimum: 0
 *         educationLevel:
 *           type: string
 *         deadline:
 *           type: string
 *           format: date-time
 *
 *     UpdateVacancy:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 */

export class VacancyController {
  /**
   * @swagger
   * /api/vacancies:
   *   post:
   *     summary: Create vacancy from approved request (Recruiter/Admin only)
   *     tags: [Vacancies]
   *     security:
   *       - bearerAuth: []
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createVacancySchema.parse(req.body);
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancy = await vacancyService.create(
        validatedData,
        userId,
        ipAddress,
        userAgent
      );

      res.status(201).json(vacancy);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * @swagger
   * /api/vacancies/{id}:
   *   put:
   *     summary: Update vacancy (Recruiter/Admin only)
   *     tags: [Vacancies]
   *     security:
   *       - bearerAuth: []
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateVacancySchema.parse(req.body);
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancy = await vacancyService.update(
        id,
        validatedData,
        userId,
        ipAddress,
        userAgent
      );

      res.status(200).json(vacancy);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * @swagger
   * /api/vacancies/{id}/publish:
   *   post:
   *     summary: Publish vacancy (Recruiter/Admin only)
   *     tags: [Vacancies]
   *     security:
   *       - bearerAuth: []
   */
  async publish(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancy = await vacancyService.publish(
        id,
        userId,
        ipAddress,
        userAgent
      );

      res.status(200).json(vacancy);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * @swagger
   * /api/vacancies/{id}/unpublish:
   *   post:
   *     summary: Unpublish vacancy (Recruiter/Admin only)
   *     tags: [Vacancies]
   *     security:
   *       - bearerAuth: []
   */
  async unpublish(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancy = await vacancyService.unpublish(
        id,
        userId,
        ipAddress,
        userAgent
      );

      res.status(200).json(vacancy);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * @swagger
   * /api/vacancies/{id}/close:
   *   post:
   *     summary: Close vacancy (Recruiter/Admin only)
   *     tags: [Vacancies]
   *     security:
   *       - bearerAuth: []
   */
  async close(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancy = await vacancyService.close(
        id,
        userId,
        ipAddress,
        userAgent
      );

      res.status(200).json(vacancy);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * @swagger
   * /api/vacancies:
   *   get:
   *     summary: Get all vacancies (Recruiter/Admin only)
   *     tags: [Vacancies]
   *     security:
   *       - bearerAuth: []
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = vacancyQuerySchema.parse(req.query);
      const result = await vacancyService.getAll(query);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * @swagger
   * /api/vacancies/{id}:
   *   get:
   *     summary: Get vacancy by ID (Recruiter/Admin only)
   *     tags: [Vacancies]
   *     security:
   *       - bearerAuth: []
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const vacancy = await vacancyService.getById(id);
      res.status(200).json(vacancy);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * @swagger
   * /api/public/vacancies:
   *   get:
   *     summary: Get public vacancies (published and open only)
   *     tags: [Public]
   */
  async getPublicVacancies(req: Request, res: Response): Promise<void> {
    try {
      const query = publicVacancyQuerySchema.parse(req.query);
      const result = await vacancyService.getPublicVacancies(query);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * @swagger
   * /api/public/vacancies/{id}:
   *   get:
   *     summary: Get public vacancy by ID (published and open only)
   *     tags: [Public]
   */
  async getPublicVacancyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const vacancy = await vacancyService.getPublicVacancyById(id);
      res.status(200).json(vacancy);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * @swagger
   * /api/vacancies/{id}:
   *   delete:
   *     summary: Delete vacancy (Admin only)
   *     tags: [Vacancies]
   *     security:
   *       - bearerAuth: []
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await vacancyService.delete(
        id,
        userId,
        ipAddress,
        userAgent
      );

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
