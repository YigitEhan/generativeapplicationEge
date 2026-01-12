import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getAllUsers, getUserById, deleteUser } from '../controllers/user.controller';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.get('/:id', authenticate, getUserById);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;

