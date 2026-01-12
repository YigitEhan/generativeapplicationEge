import { Request, Response } from 'express';
import { InterviewService } from '../services/interview.service';
import {
  scheduleInterviewSchema,
  rescheduleInterviewSchema,
  cancelInterviewSchema,
  assignInterviewersSchema,
  completeInterviewSchema,
  getInterviewerInterviewsSchema,
} from '../validators/interview.validator';

const interviewService = new InterviewService();

/**
 * @swagger
 * /api/applications/{id}/interviews:
 *   post:
 *     summary: Schedule an interview for an application
 *     tags: [Interviews]
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
 *             required:
 *               - title
 *               - scheduledAt
 *               - duration
 *               - interviewerIds
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Technical Interview - Round 1"
 *               description:
 *                 type: string
 *                 example: "Technical assessment focusing on JavaScript and React"
 *               round:
 *                 type: number
 *                 example: 1
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-02-01T10:00:00Z"
 *               duration:
 *                 type: number
 *                 example: 60
 *                 description: Duration in minutes
 *               location:
 *                 type: string
 *                 example: "https://meet.google.com/abc-defg-hij"
 *               notes:
 *                 type: string
 *                 example: "Please prepare coding examples"
 *               interviewerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["interviewer-uuid-1", "interviewer-uuid-2"]
 *     responses:
 *       201:
 *         description: Interview scheduled successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Recruiter role required
 */
export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    const applicationId = req.params.id;
    const validatedData = scheduleInterviewSchema.parse(req.body);

    const interview = await interviewService.scheduleInterview(
      applicationId,
      validatedData,
      req.user!.id,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json(interview);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/interviews/{id}/reschedule:
 *   put:
 *     summary: Reschedule an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduledAt
 *               - reason
 *             properties:
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-02-02T14:00:00Z"
 *               duration:
 *                 type: number
 *                 example: 90
 *               location:
 *                 type: string
 *                 example: "https://zoom.us/j/123456789"
 *               notes:
 *                 type: string
 *               reason:
 *                 type: string
 *                 example: "Interviewer unavailable at original time"
 *     responses:
 *       200:
 *         description: Interview rescheduled successfully
 *       400:
 *         description: Validation error or cannot reschedule
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Recruiter role required
 */
export const rescheduleInterview = async (req: Request, res: Response) => {
  try {
    const interviewId = req.params.id;
    const validatedData = rescheduleInterviewSchema.parse(req.body);

    const interview = await interviewService.rescheduleInterview(
      interviewId,
      validatedData,
      req.user!.id,
      req.ip,
      req.get('user-agent')
    );

    res.json(interview);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/interviews/{id}/cancel:
 *   post:
 *     summary: Cancel an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Candidate withdrew application"
 *     responses:
 *       200:
 *         description: Interview cancelled successfully
 *       400:
 *         description: Validation error or cannot cancel
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Recruiter role required
 */
export const cancelInterview = async (req: Request, res: Response) => {
  try {
    const interviewId = req.params.id;
    const validatedData = cancelInterviewSchema.parse(req.body);

    const interview = await interviewService.cancelInterview(
      interviewId,
      validatedData,
      req.user!.id,
      req.ip,
      req.get('user-agent')
    );

    res.json(interview);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/interviews/{id}/assign-interviewers:
 *   post:
 *     summary: Assign or update interviewers for an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interviewerIds
 *             properties:
 *               interviewerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["interviewer-uuid-1", "interviewer-uuid-2"]
 *     responses:
 *       200:
 *         description: Interviewers assigned successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Recruiter role required
 */
export const assignInterviewers = async (req: Request, res: Response) => {
  try {
    const interviewId = req.params.id;
    const validatedData = assignInterviewersSchema.parse(req.body);

    const interview = await interviewService.assignInterviewers(
      interviewId,
      validatedData,
      req.user!.id,
      req.ip,
      req.get('user-agent')
    );

    res.json(interview);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/interviewer/interviews:
 *   get:
 *     summary: Get all interviews assigned to the interviewer
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, RESCHEDULED, COMPLETED, CANCELLED]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of interviews
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Interviewer role required
 */
export const getInterviewerInterviews = async (req: Request, res: Response) => {
  try {
    const validatedQuery = getInterviewerInterviewsSchema.parse(req.query);

    const interviews = await interviewService.getInterviewerInterviews(
      req.user!.id,
      validatedQuery
    );

    res.json(interviews);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/interviewer/interviews/{id}:
 *   get:
 *     summary: Get interview details including candidate CV and evaluations
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     responses:
 *       200:
 *         description: Interview details with candidate information
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not assigned to this interview
 */
export const getInterviewDetails = async (req: Request, res: Response) => {
  try {
    const interviewId = req.params.id;

    const interview = await interviewService.getInterviewDetails(
      interviewId,
      req.user!.id
    );

    res.json(interview);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/interviewer/interviews/{id}/complete:
 *   post:
 *     summary: Mark interview as complete and provide feedback
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedback:
 *                 type: string
 *                 example: "Strong technical skills, good communication"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 8
 *               recommendation:
 *                 type: string
 *                 enum: [REJECT, MAYBE, PROCEED, STRONG_YES]
 *                 example: "PROCEED"
 *               attended:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Interview completed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not assigned to this interview
 */
export const completeInterview = async (req: Request, res: Response) => {
  try {
    const interviewId = req.params.id;
    const validatedData = completeInterviewSchema.parse(req.body);

    const result = await interviewService.completeInterview(
      interviewId,
      validatedData,
      req.user!.id,
      req.ip,
      req.get('user-agent')
    );

    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

