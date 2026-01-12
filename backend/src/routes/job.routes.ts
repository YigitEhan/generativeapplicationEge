import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from '../controllers/job.controller';

const router = Router();

router.post('/', authenticate, authorize('ADMIN', 'RECRUITER', 'HIRING_MANAGER'), createJob);
router.get('/', authenticate, getAllJobs);
router.get('/:id', authenticate, getJobById);
router.put('/:id', authenticate, authorize('ADMIN', 'RECRUITER', 'HIRING_MANAGER'), updateJob);
router.delete('/:id', authenticate, authorize('ADMIN', 'RECRUITER'), deleteJob);

export default router;

