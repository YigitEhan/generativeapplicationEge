import { Response } from 'express';
import { ZodError } from 'zod';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, createUserSchema } from '../validators/auth.validator';
import { AuthRequest } from '../middleware/auth';

const authService = new AuthService();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         role:
 *           type: string
 *           enum: [APPLICANT, RECRUITER, INTERVIEWER, MANAGER, ADMIN]
 *         phone:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         message:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             type: object
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new applicant account
 *     description: Public endpoint for applicants to create an account. Only creates APPLICANT role users.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: applicant@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123
 *                 description: Must contain at least 8 characters, one uppercase, one lowercase, and one number
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Invalid input data',
        details: error.errors,
      });
      return;
    }
    res.status(400).json({
      error: 'Registration failed',
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the system
 *     description: Authenticate with email and password to receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@recruitment.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials or inactive account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);
    res.json(result);
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Invalid input data',
        details: error.errors,
      });
      return;
    }
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the profile of the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
      return;
    }

    const user = await authService.getCurrentUser(req.user.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({
      error: 'User not found',
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     description: Admin endpoint to create users with any role (MANAGER, RECRUITER, INTERVIEWER, etc.)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: recruiter@company.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               role:
 *                 type: string
 *                 enum: [APPLICANT, RECRUITER, INTERVIEWER, MANAGER, ADMIN]
 *                 example: RECRUITER
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await authService.createUser(validatedData);
    res.status(201).json(user);
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Invalid input data',
        details: error.errors,
      });
      return;
    }
    res.status(400).json({
      error: 'User creation failed',
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve a list of all users, optionally filtered by role
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [APPLICANT, RECRUITER, INTERVIEWER, MANAGER, ADMIN]
 *         description: Filter users by role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.query.role as any;
    const users = await authService.getAllUsers(role);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     description: Retrieve a specific user by their ID
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await authService.getUserById(req.params.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({
      error: 'User not found',
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate user (Admin only)
 *     description: Deactivate a user account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const deactivateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await authService.deactivateUser(req.params.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({
      error: 'User not found',
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/auth/users/{id}/activate:
 *   patch:
 *     summary: Activate user (Admin only)
 *     description: Activate a user account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const activateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await authService.activateUser(req.params.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({
      error: 'User not found',
      message: error.message,
    });
  }
};

