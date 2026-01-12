import { z } from 'zod';
import { VacancyStatus } from '@prisma/client';

/**
 * Create vacancy schema
 * Used by recruiters to create vacancy from approved request
 */
export const createVacancySchema = z.object({
  vacancyRequestId: z.string().uuid('Invalid vacancy request ID'),
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().min(1, 'Description is required').optional(),
  requirements: z.array(z.string()).min(1, 'At least one requirement must be specified').optional(),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  location: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  experienceYears: z.number().int().min(0).optional(),
  educationLevel: z.string().optional(),
  deadline: z.string().datetime().optional(),
});

/**
 * Update vacancy schema
 * Used by recruiters to update vacancy details
 */
export const updateVacancySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  requirements: z.array(z.string()).min(1).optional(),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  location: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  experienceYears: z.number().int().min(0).optional(),
  educationLevel: z.string().optional(),
  deadline: z.string().datetime().optional(),
});

/**
 * Query parameters for listing vacancies (recruiter/admin)
 */
export const vacancyQuerySchema = z.object({
  status: z.nativeEnum(VacancyStatus).optional(),
  departmentId: z.string().uuid().optional(),
  keyword: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * Query parameters for public vacancy listing
 * Only shows published and open vacancies
 */
export const publicVacancyQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  keyword: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  location: z.string().optional(),
  experienceYears: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateVacancyInput = z.infer<typeof createVacancySchema>;
export type UpdateVacancyInput = z.infer<typeof updateVacancySchema>;
export type VacancyQuery = z.infer<typeof vacancyQuerySchema>;
export type PublicVacancyQuery = z.infer<typeof publicVacancyQuerySchema>;

