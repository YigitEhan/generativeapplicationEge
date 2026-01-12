import { Response } from 'express';
import applicationService from '../services/application.service';
import {
  applyToVacancySchema,
  withdrawApplicationSchema,
  myApplicationsQuerySchema,
  vacancyApplicationsQuerySchema,
  updateApplicationStatusSchema,
} from '../validators/application.validator';
import { AuthRequest } from '../middleware/auth';

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Apply to a vacancy
 *     description: Submit application with CV file upload OR structured CV data
 *     tags: [Applications - Applicant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - vacancyId
 *             properties:
 *               vacancyId:
 *                 type: string
 *                 format: uuid
 *               motivationLetter:
 *                 type: string
 *               cvFile:
 *                 type: string
 *                 format: binary
 *               structuredCV:
 *                 type: string
 *                 description: JSON string of structured CV data
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Validation error or business rule violation
 */
export const applyToVacancy = async (req: AuthRequest, res: Response) => {
  try {
    // Parse structured CV if provided
    let structuredCV;
    if (req.body.structuredCV) {
      try {
        structuredCV = JSON.parse(req.body.structuredCV);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid structured CV JSON' });
      }
    }

    const validatedData = applyToVacancySchema.parse({
      ...req.body,
      structuredCV,
    });

    const application = await applicationService.apply(
      validatedData,
      req.user!.id,
      req.file,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json(application);
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
 * /api/applications/mine:
 *   get:
 *     summary: Get my applications
 *     description: List all applications submitted by the authenticated user
 *     tags: [Applications - Applicant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 10
 *           maximum: 50
 *     responses:
 *       200:
 *         description: List of applications
 */
export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const query = myApplicationsQuerySchema.parse(req.query);
    const result = await applicationService.getMyApplications(req.user!.id, query);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/applications/mine/{id}:
 *   get:
 *     summary: Get my application detail
 *     description: Get detailed information about a specific application with timeline
 *     tags: [Applications - Applicant]
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
 *         description: Application details
 *       404:
 *         description: Application not found
 */
export const getMyApplicationById = async (req: AuthRequest, res: Response) => {
  try {
    const application = await applicationService.getMyApplicationById(
      req.user!.id,
      req.params.id
    );
    res.json(application);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/applications/{id}/withdraw:
 *   post:
 *     summary: Withdraw application
 *     description: Withdraw your application from a vacancy
 *     tags: [Applications - Applicant]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       200:
 *         description: Application withdrawn successfully
 *       400:
 *         description: Cannot withdraw application
 */
export const withdrawApplication = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = withdrawApplicationSchema.parse(req.body);
    const application = await applicationService.withdraw(
      req.user!.id,
      req.params.id,
      validatedData,
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
 * /api/vacancies/{vacancyId}/applications:
 *   get:
 *     summary: Get all applications for a vacancy
 *     description: List all applications for a specific vacancy (Recruiter/Admin only)
 *     tags: [Applications - Recruiter]
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
 *         description: List of applications
 */
export const getVacancyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const query = vacancyApplicationsQuerySchema.parse(req.query);
    const result = await applicationService.getVacancyApplications(
      req.params.vacancyId,
      query
    );
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get application detail
 *     description: Get detailed information about a specific application (Recruiter/Admin only)
 *     tags: [Applications - Recruiter]
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
 *         description: Application details
 *       404:
 *         description: Application not found
 */
export const getApplicationById = async (req: AuthRequest, res: Response) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id);
    res.json(application);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/applications/{id}/status:
 *   put:
 *     summary: Update application status
 *     description: Update the status of an application (Recruiter/Admin only)
 *     tags: [Applications - Recruiter]
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
 *         description: Application status updated
 *       400:
 *         description: Validation error
 */
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateApplicationStatusSchema.parse(req.body);
    const application = await applicationService.updateStatus(
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
 * /api/applications/cv/{cvId}/download:
 *   get:
 *     summary: Download CV file
 *     description: Download CV file (Owner or Recruiter/Admin only)
 *     tags: [Applications - Recruiter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CV file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: CV not found
 */
export const downloadCV = async (req: AuthRequest, res: Response) => {
  try {
    const cvData = await applicationService.downloadCV(
      req.params.cvId,
      req.user!.id,
      req.user!.role
    );

    res.download(cvData.filePath, cvData.fileName);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
