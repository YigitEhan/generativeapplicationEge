import prisma from '../config/database';
import { CreateCandidateInput, UpdateCandidateInput } from '../validators/candidate.validator';

export class CandidateService {
  async createCandidate(data: CreateCandidateInput, resumePath?: string) {
    return await prisma.candidate.create({
      data: {
        ...data,
        resumePath,
      },
    });
  }

  async getAllCandidates(filters?: { skills?: string; experience?: number }) {
    const where: any = {};

    if (filters?.skills) {
      where.skills = { has: filters.skills };
    }
    if (filters?.experience !== undefined) {
      where.experience = { gte: filters.experience };
    }

    return await prisma.candidate.findMany({
      where,
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCandidateById(id: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            job: true,
          },
        },
      },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    return candidate;
  }

  async updateCandidate(id: string, data: UpdateCandidateInput, resumePath?: string) {
    const updateData: any = { ...data };
    if (resumePath) {
      updateData.resumePath = resumePath;
    }

    return await prisma.candidate.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCandidate(id: string) {
    return await prisma.candidate.delete({
      where: { id },
    });
  }
}

