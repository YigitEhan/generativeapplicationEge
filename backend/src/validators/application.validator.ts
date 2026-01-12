import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

/**
 * Structured CV schema
 * Used when applicant provides CV data instead of file upload
 */
export const structuredCVSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedIn: z.string().url().optional(),
    portfolio: z.string().url().optional(),
  }),
  summary: z.string().optional(),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      gpa: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  experience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      location: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
      achievements: z.array(z.string()).optional(),
    })
  ).optional(),
  skills: z.object({
    technical: z.array(z.string()).optional(),
    languages: z.array(
      z.object({
        language: z.string(),
        proficiency: z.enum(['NATIVE', 'FLUENT', 'INTERMEDIATE', 'BASIC']),
      })
    ).optional(),
    soft: z.array(z.string()).optional(),
  }).optional(),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string(),
      expiryDate: z.string().optional(),
      credentialId: z.string().optional(),
    })
  ).optional(),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()).optional(),
      url: z.string().url().optional(),
    })
  ).optional(),
});

/**
 * Apply to vacancy schema
 * Supports either file upload OR structured CV data
 */
export const applyToVacancySchema = z.object({
  vacancyId: z.string().uuid('Invalid vacancy ID'),
  motivationLetter: z.string().optional(),
  structuredCV: structuredCVSchema.optional(),
  // Note: cvFile is handled by multer middleware, not Zod
});

/**
 * Withdraw application schema
 */
export const withdrawApplicationSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason (minimum 10 characters)').optional(),
});

/**
 * Query parameters for applicant's applications
 */
export const myApplicationsQuerySchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

/**
 * Query parameters for vacancy applications (recruiter)
 */
export const vacancyApplicationsQuerySchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Update application status (recruiter)
 */
export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
});

export type StructuredCV = z.infer<typeof structuredCVSchema>;
export type ApplyToVacancyInput = z.infer<typeof applyToVacancySchema>;
export type WithdrawApplicationInput = z.infer<typeof withdrawApplicationSchema>;
export type MyApplicationsQuery = z.infer<typeof myApplicationsQuerySchema>;
export type VacancyApplicationsQuery = z.infer<typeof vacancyApplicationsQuerySchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
