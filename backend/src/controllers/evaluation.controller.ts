import { Response } from 'express';
import evaluationService from '../services/evaluation.service';
import {
  createEvaluationSchema,
  updateApplicationStatusSchema,
  managerRecommendationSchema,
  managerVacanciesQuerySchema,
} from '../validators/evaluation.validator';
import { AuthRequest } from '../middleware/auth';

/**
 * @swagger
 * /api/applications/{id}/evaluations:
 *   post:
 *     summary: Create evaluation for application (Recruiter or Interviewer)
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               comments:
 *                 type: string
 *               strengths:
 *                 type: string
 *               weaknesses:
 *                 type: string
 *               recommendation:
 *                 type: string
 *                 enum: [REJECT, MAYBE, PROCEED, STRONG_YES]
 *     responses:
 *       201:
 *         description: Evaluation created successfully
 *       403:
 *         description: Interviewer not assigned to this application
 */
export const createEvaluation = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createEvaluationSchema.parse(req.body);
    const evaluation = await evaluationService.createEvaluation(
      req.params.id,
      validatedData,
      req.user!.id,
      req.user!.role,
      req.ip,
      req.get('user-agent')
    );
    res.status(201).json(evaluation);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/applications/{id}/status:
 *   post:
 *     summary: Update application status with business rules validation
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPLIED, SCREENING, INTERVIEW, OFFERED, ACCEPTED, REJECTED, WITHDRAWN]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status transition or business rule violation
 */
export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateApplicationStatusSchema.parse(req.body);
    const application = await evaluationService.updateApplicationStatus(
      req.params.id,
      validatedData,
      req.user!.id,
      req.ip,
      req.get('user-agent')
    );
    res.json(application);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/manager/vacancies:
 *   get:
 *     summary: Get vacancies for manager's department
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, OPEN, CLOSED, CANCELLED]
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
 *     responses:
 *       200:
 *         description: List of vacancies
 */
export const getManagerVacancies = async (req: AuthRequest, res: Response) => {
  try {
    const query = managerVacanciesQuerySchema.parse(req.query);
    const result = await evaluationService.getManagerVacancies(req.user!.id, query);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/manager/applications/{id}:
 *   get:
 *     summary: Get application detail with all evaluations (Manager)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application detail with evaluations
 *       403:
 *         description: Not authorized for this department
 */
export const getApplicationForManager = async (req: AuthRequest, res: Response) => {
  try {
    const application = await evaluationService.getApplicationForManager(
      req.params.id,
      req.user!.id
    );
    res.json(application);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/manager/applications/{id}/recommendation:
 *   post:
 *     summary: Create manager recommendation for application
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *               - suggestedDecision
 *             properties:
 *               comment:
 *                 type: string
 *                 minLength: 10
 *               suggestedDecision:
 *                 type: string
 *                 enum: [REJECT, PROCEED_WITH_CAUTION, RECOMMEND_HIRE, STRONG_RECOMMEND_HIRE]
 *               confidential:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Recommendation created successfully
 *       403:
 *         description: Not authorized for this department
 */
export const createManagerRecommendation = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = managerRecommendationSchema.parse(req.body);
    const recommendation = await evaluationService.createManagerRecommendation(
      req.params.id,
      validatedData,
      req.user!.id,
      req.ip,
      req.get('user-agent')
    );
    res.status(201).json(recommendation);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    res.status(400).json({ error: error.message });
  }
};

