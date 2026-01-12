import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} from '../controllers/candidate.controller';

const router = Router();

router.post('/', authenticate, upload.single('resume'), createCandidate);
router.get('/', authenticate, getAllCandidates);
router.get('/:id', authenticate, getCandidateById);
router.put('/:id', authenticate, upload.single('resume'), updateCandidate);
router.delete('/:id', authenticate, deleteCandidate);

export default router;

