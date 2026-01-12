import prisma from '../config/database';
import { CreateJobInput, UpdateJobInput } from '../validators/job.validator';

export class JobService {
  async createJob(data: CreateJobInput, createdById: string) {
    return await prisma.job.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getAllJobs(filters?: { status?: string; type?: string; department?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.department) {
      where.department = { contains: filters.department, mode: 'insensitive' };
    }

    return await prisma.job.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
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

  async getJobById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        applications: {
          include: {
            candidate: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }

  async updateJob(id: string, data: UpdateJobInput) {
    return await prisma.job.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deleteJob(id: string) {
    return await prisma.job.delete({
      where: { id },
    });
  }
}

