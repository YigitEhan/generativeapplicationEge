import { Request, Response } from 'express';
import { TestService } from '../services/test.service';
import {
  createTestSchema,
  inviteToTestSchema,
  submitQuizSchema,
  markExternalCompleteSchema,
} from '../validators/test.validator';

const testService = new TestService();

export class TestController {
  /**
   * @swagger
   * /api/vacancies/{id}/test:
   *   post:
   *     summary: Create a test for a vacancy (RECRUITER)
   *     tags: [Tests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Vacancy ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             oneOf:
   *               - type: object
   *                 properties:
   *                   type:
   *                     type: string
   *                     enum: [EXTERNAL_LINK]
   *                   title:
   *                     type: string
   *                   description:
   *                     type: string
   *                   instructions:
   *                     type: string
   *                   externalUrl:
   *                     type: string
   *                     format: uri
   *                   duration:
   *                     type: integer
   *                   passingScore:
   *                     type: integer
   *               - type: object
   *                 properties:
   *                   type:
   *                     type: string
   *                     enum: [INTERNAL_QUIZ]
   *                   title:
   *                     type: string
   *                   description:
   *                     type: string
   *                   instructions:
   *                     type: string
   *                   duration:
   *                     type: integer
   *                   passingScore:
   *                     type: integer
   *                   questions:
   *                     type: array
   *                     items:
   *                       type: object
   *     responses:
   *       201:
   *         description: Test created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  async createTest(req: Request, res: Response) {
    try {
      const vacancyId = req.params.id;
      const validatedData = createTestSchema.parse(req.body);

      const test = await testService.createTest(
        vacancyId,
        validatedData,
        req.user!.id,
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json(test);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/applications/{id}/test-invite:
   *   post:
   *     summary: Invite applicant to take a test (RECRUITER)
   *     tags: [Tests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Application ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               testId:
   *                 type: string
   *               message:
   *                 type: string
   *     responses:
   *       201:
   *         description: Test invitation sent
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  async inviteToTest(req: Request, res: Response) {
    try {
      const applicationId = req.params.id;
      const validatedData = inviteToTestSchema.parse(req.body);

      const testAttempt = await testService.inviteToTest(
        applicationId,
        validatedData,
        req.user!.id,
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json(testAttempt);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/applications/{id}/test-attempt:
   *   get:
   *     summary: Get test attempt for an application (RECRUITER)
   *     tags: [Tests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Application ID
   *     responses:
   *       200:
   *         description: Test attempt details
   *       404:
   *         description: Test attempt not found
   *       401:
   *         description: Unauthorized
   */
  async getTestAttempt(req: Request, res: Response) {
    try {
      const applicationId = req.params.id;

      const testAttempt = await testService.getTestAttempt(applicationId);

      res.json(testAttempt);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/applications/{id}/test:
   *   get:
   *     summary: Get test for applicant (APPLICANT)
   *     tags: [Tests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Application ID
   *     responses:
   *       200:
   *         description: Test details (without correct answers)
   *       404:
   *         description: Test not found
   *       401:
   *         description: Unauthorized
   */
  async getTestForApplicant(req: Request, res: Response) {
    try {
      const applicationId = req.params.id;

      const testAttempt = await testService.getTestForApplicant(
        applicationId,
        req.user!.id
      );

      res.json(testAttempt);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/applications/{id}/test/submit:
   *   post:
   *     summary: Submit internal quiz answers (APPLICANT)
   *     tags: [Tests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Application ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               answers:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     questionId:
   *                       type: string
   *                     answer:
   *                       oneOf:
   *                         - type: string
   *                         - type: number
   *                         - type: boolean
   *     responses:
   *       200:
   *         description: Quiz submitted and graded
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  async submitQuiz(req: Request, res: Response) {
    try {
      const applicationId = req.params.id;
      const validatedData = submitQuizSchema.parse(req.body);

      const result = await testService.submitQuiz(
        applicationId,
        validatedData,
        req.user!.id,
        req.ip,
        req.get('user-agent')
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/applications/{id}/test/mark-complete:
   *   post:
   *     summary: Mark external test as complete (APPLICANT)
   *     tags: [Tests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Application ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               notes:
   *                 type: string
   *     responses:
   *       200:
   *         description: Test marked as complete
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  async markExternalComplete(req: Request, res: Response) {
    try {
      const applicationId = req.params.id;
      const validatedData = markExternalCompleteSchema.parse(req.body);

      const result = await testService.markExternalComplete(
        applicationId,
        validatedData,
        req.user!.id,
        req.ip,
        req.get('user-agent')
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/vacancies/{id}/tests:
   *   get:
   *     summary: Get all tests for a vacancy (RECRUITER)
   *     tags: [Tests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Vacancy ID
   *     responses:
   *       200:
   *         description: List of tests
   *       401:
   *         description: Unauthorized
   */
  async getTestsForVacancy(req: Request, res: Response) {
    try {
      const vacancyId = req.params.id;

      const tests = await testService.getTestsForVacancy(vacancyId);

      res.json(tests);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
