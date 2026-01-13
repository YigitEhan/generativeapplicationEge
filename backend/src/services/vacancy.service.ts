import prisma from '../config/database';
import { VacancyStatus } from '@prisma/client';
import {
  CreateVacancyInput,
  UpdateVacancyInput,
  VacancyQuery,
  PublicVacancyQuery,
} from '../validators/vacancy.validator';
import { AuditLogService } from './auditLog.service';

const auditLogService = new AuditLogService();

export class VacancyService {
  /**
   * Create vacancy from approved vacancy request
   */
  async create(
    data: CreateVacancyInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get the vacancy request
    const vacancyRequest = await prisma.vacancyRequest.findUnique({
      where: { id: data.vacancyRequestId },
      include: {
        department: true,
      },
    });

    if (!vacancyRequest) {
      throw new Error('Vacancy request not found');
    }

    // Verify request is approved
    if (vacancyRequest.status !== 'APPROVED') {
      throw new Error('Can only create vacancy from approved requests');
    }

    // Check if vacancy already exists for this request
    const existingVacancy = await prisma.vacancy.findUnique({
      where: { vacancyRequestId: data.vacancyRequestId },
    });

    if (existingVacancy) {
      throw new Error('Vacancy already exists for this request');
    }

    // Validate salary range
    if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
      throw new Error('Minimum salary cannot be greater than maximum salary');
    }

    // Parse deadline if provided
    let deadline: Date | undefined;
    if (data.deadline) {
      deadline = new Date(data.deadline);
      if (deadline < new Date()) {
        throw new Error('Deadline cannot be in the past');
      }
    }

    // Create vacancy with data from request or override
    const vacancy = await prisma.vacancy.create({
      data: {
        vacancyRequestId: data.vacancyRequestId,
        departmentId: vacancyRequest.departmentId,
        title: data.title || vacancyRequest.title,
        description: data.description || vacancyRequest.description,
        requirements: data.requirements || vacancyRequest.requiredSkills,
        responsibilities: data.responsibilities || [],
        qualifications: data.qualifications || [],
        benefits: data.benefits || [],
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        location: data.location,
        employmentType: data.employmentType || 'FULL_TIME',
        experienceYears: data.experienceYears,
        educationLevel: data.educationLevel,
        numberOfPositions: vacancyRequest.numberOfPositions,
        deadline,
        status: 'DRAFT',
        isPublished: false,
        createdBy: userId,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        vacancyRequest: {
          select: {
            id: true,
            title: true,
            requestedBy: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Log creation
    await auditLogService.log({
      userId,
      action: 'CREATE',
      entity: 'Vacancy',
      entityId: vacancy.id,
      changes: {
        title: vacancy.title,
        status: vacancy.status,
        vacancyRequestId: data.vacancyRequestId,
      },
      ipAddress,
      userAgent,
    });

    return vacancy;
  }

  /**
   * Update vacancy
   */
  async update(
    id: string,
    data: UpdateVacancyInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existingVacancy = await prisma.vacancy.findUnique({
      where: { id },
    });

    if (!existingVacancy) {
      throw new Error('Vacancy not found');
    }

    // Cannot update closed vacancies
    if (existingVacancy.status === 'CLOSED') {
      throw new Error('Cannot update closed vacancy');
    }

    // Validate salary range
    const salaryMin = data.salaryMin ?? existingVacancy.salaryMin;
    const salaryMax = data.salaryMax ?? existingVacancy.salaryMax;
    if (salaryMin && salaryMax && salaryMin > salaryMax) {
      throw new Error('Minimum salary cannot be greater than maximum salary');
    }

    // Parse deadline if provided
    let deadline: Date | undefined | null = undefined;
    if (data.deadline !== undefined) {
      if (data.deadline) {
        deadline = new Date(data.deadline);
        if (deadline < new Date()) {
          throw new Error('Deadline cannot be in the past');
        }
      } else {
        deadline = null;
      }
    }

    const updateData: any = {
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      responsibilities: data.responsibilities,
      qualifications: data.qualifications,
      benefits: data.benefits,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      location: data.location,
      employmentType: data.employmentType,
      experienceYears: data.experienceYears,
      educationLevel: data.educationLevel,
    };

    if (deadline !== undefined) {
      updateData.deadline = deadline;
    }

    const updatedVacancy = await prisma.vacancy.update({
      where: { id },
      data: updateData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        vacancyRequest: {
          select: {
            id: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Log update
    await auditLogService.log({
      userId,
      action: 'UPDATE',
      entity: 'Vacancy',
      entityId: id,
      changes: {
        before: existingVacancy,
        after: updatedVacancy,
      },
      ipAddress,
      userAgent,
    });

    return updatedVacancy;
  }

  /**
   * Publish vacancy (make it visible to public)
   */
  async publish(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
    });

    if (!vacancy) {
      throw new Error('Vacancy not found');
    }

    if (vacancy.status === 'CLOSED') {
      throw new Error('Cannot publish closed vacancy');
    }

    if (vacancy.isPublished) {
      throw new Error('Vacancy is already published');
    }

    const updatedVacancy = await prisma.vacancy.update({
      where: { id },
      data: {
        isPublished: true,
        status: 'OPEN',
        publishedAt: new Date(),
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Log publish
    await auditLogService.log({
      userId,
      action: 'PUBLISH',
      entity: 'Vacancy',
      entityId: id,
      changes: {
        isPublished: true,
        status: 'OPEN',
        publishedAt: new Date(),
      },
      ipAddress,
      userAgent,
    });

    return updatedVacancy;
  }

  /**
   * Unpublish vacancy (hide from public)
   */
  async unpublish(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
    });

    if (!vacancy) {
      throw new Error('Vacancy not found');
    }

    if (!vacancy.isPublished) {
      throw new Error('Vacancy is not published');
    }

    if (vacancy.status === 'CLOSED') {
      throw new Error('Cannot unpublish closed vacancy');
    }

    const updatedVacancy = await prisma.vacancy.update({
      where: { id },
      data: {
        isPublished: false,
        status: 'DRAFT',
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Log unpublish
    await auditLogService.log({
      userId,
      action: 'UNPUBLISH',
      entity: 'Vacancy',
      entityId: id,
      changes: {
        isPublished: false,
        status: 'DRAFT',
      },
      ipAddress,
      userAgent,
    });

    return updatedVacancy;
  }

  /**
   * Close vacancy (no longer accepting applications)
   */
  async close(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
    });

    if (!vacancy) {
      throw new Error('Vacancy not found');
    }

    if (vacancy.status === 'CLOSED') {
      throw new Error('Vacancy is already closed');
    }

    const updatedVacancy = await prisma.vacancy.update({
      where: { id },
      data: {
        status: 'CLOSED',
        isPublished: false,
        closedAt: new Date(),
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Log close
    await auditLogService.log({
      userId,
      action: 'CLOSE',
      entity: 'Vacancy',
      entityId: id,
      changes: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
      ipAddress,
      userAgent,
    });

    return updatedVacancy;
  }

  /**
   * Get all vacancies with filters (for recruiters/admins)
   */
  async getAll(query: VacancyQuery) {
    const { status, departmentId, keyword, employmentType, page, limit } = query;

    const where: any = {};

    // Apply filters
    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    // Keyword search in title and description
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [vacancies, total] = await Promise.all([
      prisma.vacancy.findMany({
        where,
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          vacancyRequest: {
            select: {
              id: true,
              title: true,
              requestedBy: true,
            },
          },
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
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
        skip,
        take: limit,
      }),
      prisma.vacancy.count({ where }),
    ]);

    return {
      data: vacancies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get public vacancies (only published and open)
   */
  async getPublicVacancies(query: PublicVacancyQuery) {
    const { departmentId, keyword, employmentType, location, experienceYears, page, limit } = query;

    const where: any = {
      publishedAt: { not: null },
      status: 'OPEN',
    };

    // Apply filters
    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Keyword search in title and description
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [vacancies, total] = await Promise.all([
      prisma.vacancy.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          responsibilities: true,
          qualifications: true,
          benefits: true,
          salaryRange: true,
          location: true,
          employmentType: true,
          requiredSkills: true,
          numberOfPositions: true,
          applicationDeadline: true,
          publishedAt: true,
          department: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.vacancy.count({ where }),
    ]);

    return {
      data: vacancies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get vacancy by ID (for recruiters/admins)
   */
  async getById(id: string) {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        vacancyRequest: {
          select: {
            id: true,
            title: true,
            requestedBy: true,
            requester: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!vacancy) {
      throw new Error('Vacancy not found');
    }

    return vacancy;
  }

  /**
   * Get public vacancy by ID (only if published and open)
   */
  async getPublicVacancyById(id: string) {
    const vacancy = await prisma.vacancy.findFirst({
      where: {
        id,
        isPublished: true,
        status: 'OPEN',
      },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        responsibilities: true,
        qualifications: true,
        benefits: true,
        salaryMin: true,
        salaryMax: true,
        location: true,
        employmentType: true,
        experienceYears: true,
        educationLevel: true,
        numberOfPositions: true,
        deadline: true,
        publishedAt: true,
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!vacancy) {
      throw new Error('Vacancy not found or not available');
    }

    return vacancy;
  }

  /**
   * Delete vacancy (Admin only)
   */
  async delete(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!vacancy) {
      throw new Error('Vacancy not found');
    }

    // Cannot delete if has applications
    if (vacancy._count.applications > 0) {
      throw new Error('Cannot delete vacancy with existing applications');
    }

    await prisma.vacancy.delete({
      where: { id },
    });

    // Log deletion
    await auditLogService.log({
      userId,
      action: 'DELETE',
      entity: 'Vacancy',
      entityId: id,
      changes: {
        title: vacancy.title,
        status: vacancy.status,
      },
      ipAddress,
      userAgent,
    });

    return { message: 'Vacancy deleted successfully' };
  }
}
