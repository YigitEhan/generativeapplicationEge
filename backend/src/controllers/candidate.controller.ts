import { Response } from 'express';
import { CandidateService } from '../services/candidate.service';
import { createCandidateSchema, updateCandidateSchema } from '../validators/candidate.validator';
import { AuthRequest } from '../middleware/auth';

const candidateService = new CandidateService();

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Candidate created successfully
 */
export const createCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createCandidateSchema.parse(req.body);
    const resumePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const candidate = await candidateService.createCandidate(validatedData, resumePath);
    res.status(201).json(candidate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const { skills, experience } = req.query;
    const candidates = await candidateService.getAllCandidates({
      skills: skills as string,
      experience: experience ? parseInt(experience as string) : undefined,
    });
    res.json(candidates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCandidateById = async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id);
    res.json(candidate);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateCandidateSchema.parse(req.body);
    const resumePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const candidate = await candidateService.updateCandidate(req.params.id, validatedData, resumePath);
    res.json(candidate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCandidate = async (req: AuthRequest, res: Response) => {
  try {
    await candidateService.deleteCandidate(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

