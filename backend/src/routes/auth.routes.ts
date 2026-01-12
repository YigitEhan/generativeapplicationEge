import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  createUser,
  getAllUsers,
  getUserById,
  deactivateUser,
  activateUser,
} from '../controllers/auth.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * POST /api/auth/register
 * Register a new applicant account (public)
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', login);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, getCurrentUser);

// ============================================
// ADMIN ROUTES (Admin role required)
// ============================================

/**
 * POST /api/auth/users
 * Create a new user with any role (Admin only)
 */
router.post('/users', authenticate, requireRole('ADMIN'), createUser);

/**
 * GET /api/auth/users
 * Get all users (Admin only)
 */
router.get('/users', authenticate, requireRole('ADMIN'), getAllUsers);

/**
 * GET /api/auth/users/:id
 * Get user by ID (Admin only)
 */
router.get('/users/:id', authenticate, requireRole('ADMIN'), getUserById);

/**
 * PATCH /api/auth/users/:id/deactivate
 * Deactivate a user (Admin only)
 */
router.patch('/users/:id/deactivate', authenticate, requireRole('ADMIN'), deactivateUser);

/**
 * PATCH /api/auth/users/:id/activate
 * Activate a user (Admin only)
 */
router.patch('/users/:id/activate', authenticate, requireRole('ADMIN'), activateUser);

export default router;

