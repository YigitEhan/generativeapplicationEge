import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { JwtPayload } from '../types/auth.types';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.utils';
import prisma from '../config/database';

/**
 * Extended Request interface with authenticated user information
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Authentication middleware - verifies JWT token
 * Attaches user payload to request object
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided. Please include a valid Bearer token in the Authorization header.',
      });
      return;
    }

    // Verify and decode token
    const decoded = verifyToken(token);

    // Optional: Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, isActive: true },
    });

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'User account is inactive',
      });
      return;
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message || 'Invalid or expired token',
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if authenticated user has one of the required roles
 *
 * @param roles - Array of allowed roles
 * @returns Middleware function
 *
 * @example
 * router.get('/admin', authenticate, requireRole('ADMIN'), handler);
 * router.post('/vacancy', authenticate, requireRole('ADMIN', 'RECRUITER', 'MANAGER'), handler);
 */
export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Silently fail - user remains unauthenticated
    next();
  }
};

/**
 * Alias for requireRole for backward compatibility
 */
export const authorize = requireRole;

