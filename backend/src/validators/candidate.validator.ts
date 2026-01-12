import { z } from 'zod';

export const createCandidateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.number().int().min(0).optional(),
  education: z.string().optional(),
  linkedIn: z.string().url().optional().or(z.literal('')),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;

