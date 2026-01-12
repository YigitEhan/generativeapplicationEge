import prisma from '../config/database';
import { VacancyRequestStatus } from '@prisma/client';
import {
  CreateVacancyRequestInput,
  UpdateVacancyRequestInput,
  DeclineVacancyRequestInput,
  VacancyRequestQuery,
} from '../validators/vacancyRequest.validator';
import { AuditLogService } from './auditLog.service';

const auditLogService = new AuditLogService();

export class VacancyRequestService {
  /**
   * Create a new vacancy request (Manager only)
   */
  async create(
    data: CreateVacancyRequestInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: data.departmentId },
    });

    if (!department) {
      throw new Error('Department not found');
    }

    if (!department.isActive) {
      throw new Error('Department is not active');
    }

    // Create vacancy request
    const vacancyRequest = await prisma.vacancyRequest.create({
      data: {
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
        requestedBy: userId,
        status: data.status || 'DRAFT',
        justification: data.justification,
        numberOfPositions: data.numberOfPositions,
        requiredSkills: data.requiredSkills,
        experienceLevel: data.experienceLevel,
        salaryRange: data.salaryRange,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        requester: {
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
    await auditLogService.logVacancyRequestCreated(
      userId,
      vacancyRequest.id,
      vacancyRequest,
      ipAddress,
      userAgent
    );

    return vacancyRequest;
  }

  /**
   * Update vacancy request (Manager only, if not approved)
   */
  async update(
    id: string,
    data: UpdateVacancyRequestInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get existing request
    const existingRequest = await prisma.vacancyRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      throw new Error('Vacancy request not found');
    }

    // Check if user is the requester
    if (existingRequest.requestedBy !== userId) {
      throw new Error('You can only update your own vacancy requests');
    }

    // Check if request can be edited
    if (existingRequest.status === 'APPROVED') {
      throw new Error('Cannot edit an approved vacancy request');
    }

    if (existingRequest.status === 'DECLINED') {
      throw new Error('Cannot edit a declined vacancy request');
    }

    // Verify department if being changed
    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });

      if (!department || !department.isActive) {
        throw new Error('Invalid or inactive department');
      }
    }

    // Update request
    const updatedRequest = await prisma.vacancyRequest.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
        justification: data.justification,
        numberOfPositions: data.numberOfPositions,
        requiredSkills: data.requiredSkills,
        experienceLevel: data.experienceLevel,
        salaryRange: data.salaryRange,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        requester: {
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
    await auditLogService.logVacancyRequestUpdated(
      userId,
      id,
      existingRequest,
      updatedRequest,
      ipAddress,
      userAgent
    );

    return updatedRequest;
  }

  /**
   * Submit vacancy request (change status to PENDING)
   */
  async submit(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const request = await prisma.vacancyRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Vacancy request not found');
    }

    if (request.requestedBy !== userId) {
      throw new Error('You can only submit your own vacancy requests');
    }

    if (request.status !== 'DRAFT') {
      throw new Error('Only draft requests can be submitted');
    }

    const updatedRequest = await prisma.vacancyRequest.update({
      where: { id },
      data: { status: 'PENDING' },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        requester: {
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

    // Log status change
    await auditLogService.logVacancyRequestStatusChange(
      userId,
      id,
      'DRAFT',
      'PENDING',
      { submittedAt: new Date() },
      ipAddress,
      userAgent
    );

    return updatedRequest;
  }

  /**
   * Cancel vacancy request (Manager only)
   */
  async cancel(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const request = await prisma.vacancyRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Vacancy request not found');
    }

    if (request.requestedBy !== userId) {
      throw new Error('You can only cancel your own vacancy requests');
    }

    if (request.status === 'APPROVED') {
      throw new Error('Cannot cancel an approved vacancy request');
    }

    if (request.status === 'CANCELLED') {
      throw new Error('Vacancy request is already cancelled');
    }

    const oldStatus = request.status;

    const updatedRequest = await prisma.vacancyRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        requester: {
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

    // Log cancellation
    await auditLogService.logVacancyRequestCancelled(
      userId,
      id,
      oldStatus,
      ipAddress,
      userAgent
    );

    return updatedRequest;
  }

  /**
   * Approve vacancy request (Recruiter/Admin only)
   */
  async approve(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const request = await prisma.vacancyRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Vacancy request not found');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Only pending requests can be approved');
    }

    const updatedRequest = await prisma.vacancyRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        requester: {
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

    // Log approval
    await auditLogService.logVacancyRequestApproved(
      userId,
      id,
      ipAddress,
      userAgent
    );

    return updatedRequest;
  }

  /**
   * Decline vacancy request (Recruiter/Admin only)
   */
  async decline(
    id: string,
    data: DeclineVacancyRequestInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const request = await prisma.vacancyRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Vacancy request not found');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Only pending requests can be declined');
    }

    const updatedRequest = await prisma.vacancyRequest.update({
      where: { id },
      data: {
        status: 'DECLINED',
        declinedReason: data.declinedReason,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        requester: {
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

    // Log decline
    await auditLogService.logVacancyRequestDeclined(
      userId,
      id,
      data.declinedReason,
      ipAddress,
      userAgent
    );

    return updatedRequest;
  }

  /**
   * Get all vacancy requests with filters
   */
  async getAll(query: VacancyRequestQuery, userId?: string, userRole?: string) {
    const { status, departmentId, requestedBy, page, limit } = query;

    const where: any = {};

    // Apply filters
    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (requestedBy) {
      where.requestedBy = requestedBy;
    }

    // Managers can only see their own requests
    if (userRole === 'MANAGER' && userId) {
      where.requestedBy = userId;
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.vacancyRequest.findMany({
        where,
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          requester: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.vacancyRequest.count({ where }),
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get vacancy request by ID
   */
  async getById(id: string, userId?: string, userRole?: string) {
    const request = await prisma.vacancyRequest.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        requester: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        vacancy: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error('Vacancy request not found');
    }

    // Managers can only view their own requests
    if (userRole === 'MANAGER' && request.requestedBy !== userId) {
      throw new Error('You can only view your own vacancy requests');
    }

    return request;
  }

  /**
   * Delete vacancy request (Admin only, or Manager if DRAFT)
   */
  async delete(id: string, userId: string, userRole: string, ipAddress?: string, userAgent?: string) {
    const request = await prisma.vacancyRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Vacancy request not found');
    }

    // Managers can only delete their own DRAFT requests
    if (userRole === 'MANAGER') {
      if (request.requestedBy !== userId) {
        throw new Error('You can only delete your own vacancy requests');
      }
      if (request.status !== 'DRAFT') {
        throw new Error('You can only delete draft requests');
      }
    }

    // Cannot delete if already has a vacancy
    if (request.vacancy) {
      throw new Error('Cannot delete a request that has an associated vacancy');
    }

    await prisma.vacancyRequest.delete({
      where: { id },
    });

    // Log deletion
    await auditLogService.log({
      userId,
      action: 'DELETE',
      entity: 'VacancyRequest',
      entityId: id,
      changes: {
        title: request.title,
        status: request.status,
      },
      ipAddress,
      userAgent,
    });

    return { message: 'Vacancy request deleted successfully' };
  }
}
