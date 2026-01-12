import { Request, Response } from 'express';
import { VacancyRequestService } from '../services/vacancyRequest.service';
import {
  createVacancyRequestSchema,
  updateVacancyRequestSchema,
  declineVacancyRequestSchema,
  vacancyRequestQuerySchema,
} from '../validators/vacancyRequest.validator';
import { ZodError } from 'zod';

const vacancyRequestService = new VacancyRequestService();

/**
 * @swagger
 * components:
 *   schemas:
 *     VacancyRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         departmentId:
 *           type: string
 *           format: uuid
 *         requestedBy:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [DRAFT, PENDING, APPROVED, DECLINED, CANCELLED]
 *         justification:
 *           type: string
 *         numberOfPositions:
 *           type: integer
 *         requiredSkills:
 *           type: array
 *           items:
 *             type: string
 *         experienceLevel:
 *           type: string
 *         salaryRange:
 *           type: string
 *         declinedReason:
 *           type: string
 *         approvedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateVacancyRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - departmentId
 *         - requiredSkills
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *         departmentId:
 *           type: string
 *           format: uuid
 *         justification:
 *           type: string
 *         numberOfPositions:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         requiredSkills:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         experienceLevel:
 *           type: string
 *         salaryRange:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, PENDING]
 *           default: DRAFT
 *
 *     UpdateVacancyRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *         departmentId:
 *           type: string
 *           format: uuid
 *         justification:
 *           type: string
 *         numberOfPositions:
 *           type: integer
 *           minimum: 1
 *         requiredSkills:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         experienceLevel:
 *           type: string
 *         salaryRange:
 *           type: string
 *
 *     DeclineVacancyRequest:
 *       type: object
 *       required:
 *         - declinedReason
 *       properties:
 *         declinedReason:
 *           type: string
 *           maxLength: 500
 */

export class VacancyRequestController {
  /**
   * @swagger
   * /api/vacancy-requests:
   *   post:
   *     summary: Create a new vacancy request (Manager only)
   *     tags: [VacancyRequests]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateVacancyRequest'
   *     responses:
   *       201:
   *         description: Vacancy request created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/VacancyRequest'
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Manager role required
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createVacancyRequestSchema.parse(req.body);
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancyRequest = await vacancyRequestService.create(
        validatedData,
        userId,
        ipAddress,
        userAgent
      );

      res.status(201).json(vacancyRequest);
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
   * /api/vacancy-requests/{id}:
   *   put:
   *     summary: Update vacancy request (Manager only, if not approved)
   *     tags: [VacancyRequests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateVacancyRequest'
   *     responses:
   *       200:
   *         description: Vacancy request updated successfully
   *       400:
   *         description: Validation error or cannot edit
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Vacancy request not found
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateVacancyRequestSchema.parse(req.body);
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancyRequest = await vacancyRequestService.update(
        id,
        validatedData,
        userId,
        ipAddress,
        userAgent
      );

      res.status(200).json(vacancyRequest);
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
   * /api/vacancy-requests/{id}/submit:
   *   post:
   *     summary: Submit vacancy request (change status to PENDING)
   *     tags: [VacancyRequests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Vacancy request submitted successfully
   *       400:
   *         description: Cannot submit request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Vacancy request not found
   */
  async submit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancyRequest = await vacancyRequestService.submit(
        id,
        userId,
        ipAddress,
        userAgent
      );

      res.status(200).json(vacancyRequest);
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
   * /api/vacancy-requests/{id}/cancel:
   *   post:
   *     summary: Cancel vacancy request (Manager only)
   *     tags: [VacancyRequests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Vacancy request cancelled successfully
   *       400:
   *         description: Cannot cancel request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Vacancy request not found
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancyRequest = await vacancyRequestService.cancel(
        id,
        userId,
        ipAddress,
        userAgent
      );

      res.status(200).json(vacancyRequest);
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
   * /api/vacancy-requests/{id}/approve:
   *   post:
   *     summary: Approve vacancy request (Recruiter/Admin only)
   *     tags: [VacancyRequests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Vacancy request approved successfully
   *       400:
   *         description: Cannot approve request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Recruiter or Admin role required
   *       404:
   *         description: Vacancy request not found
   */
  async approve(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancyRequest = await vacancyRequestService.approve(
        id,
        userId,
        ipAddress,
        userAgent
      );

      res.status(200).json(vacancyRequest);
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
   * /api/vacancy-requests/{id}/decline:
   *   post:
   *     summary: Decline vacancy request (Recruiter/Admin only)
   *     tags: [VacancyRequests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DeclineVacancyRequest'
   *     responses:
   *       200:
   *         description: Vacancy request declined successfully
   *       400:
   *         description: Validation error or cannot decline
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Recruiter or Admin role required
   *       404:
   *         description: Vacancy request not found
   */
  async decline(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = declineVacancyRequestSchema.parse(req.body);
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const vacancyRequest = await vacancyRequestService.decline(
        id,
        validatedData,
        userId,
        ipAddress,
        userAgent
      );

      res.status(200).json(vacancyRequest);
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
   * /api/vacancy-requests:
   *   get:
   *     summary: Get all vacancy requests with filters
   *     tags: [VacancyRequests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [DRAFT, PENDING, APPROVED, DECLINED, CANCELLED]
   *       - in: query
   *         name: departmentId
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: requestedBy
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *     responses:
   *       200:
   *         description: List of vacancy requests
   *       401:
   *         description: Unauthorized
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = vacancyRequestQuerySchema.parse(req.query);
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const result = await vacancyRequestService.getAll(query, userId, userRole);

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
   * /api/vacancy-requests/{id}:
   *   get:
   *     summary: Get vacancy request by ID
   *     tags: [VacancyRequests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Vacancy request details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Vacancy request not found
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const vacancyRequest = await vacancyRequestService.getById(id, userId, userRole);

      res.status(200).json(vacancyRequest);
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
   * /api/vacancy-requests/{id}:
   *   delete:
   *     summary: Delete vacancy request (Admin only, or Manager if DRAFT)
   *     tags: [VacancyRequests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Vacancy request deleted successfully
   *       400:
   *         description: Cannot delete request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Vacancy request not found
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await vacancyRequestService.delete(
        id,
        userId,
        userRole,
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
