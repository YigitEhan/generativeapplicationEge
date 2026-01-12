import { Role } from '@prisma/client';

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    phone?: string | null;
    isActive: boolean;
    createdAt: Date;
  };
  token: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

