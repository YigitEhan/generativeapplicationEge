import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { JwtPayload } from '../types/auth.types';

/**
 * Generate JWT token for authenticated user
 */
export const generateToken = (id: string, email: string, role: Role): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const payload: JwtPayload = {
    id,
    email,
    role,
  };

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

