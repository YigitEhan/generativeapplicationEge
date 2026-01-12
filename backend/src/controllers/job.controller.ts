import { Response } from 'express';
import { JobService } from '../services/job.service';
import { createJobSchema, updateJobSchema } from '../validators/job.validator';
import { AuthRequest } from '../middleware/auth';

const jobService = new JobService();

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Job created successfully
 */
export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createJobSchema.parse(req.body);
    const job = await jobService.createJob(validatedData, req.user!.id);
    res.status(201).json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of jobs
 */
export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, department } = req.query;
    const jobs = await jobService.getAllJobs({
      status: status as string,
      type: type as string,
      department: department as string,
    });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.json(job);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateJobSchema.parse(req.body);
    const job = await jobService.updateJob(req.params.id, validatedData);
    res.json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    await jobService.deleteJob(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

