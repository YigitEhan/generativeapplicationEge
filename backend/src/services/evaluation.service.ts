import prisma from '../config/database';
import {
  CreateEvaluationInput,
  UpdateApplicationStatusInput,
  ManagerRecommendationInput,
  ManagerVacanciesQuery,
  validateStatusTransition,
  validateBusinessRules,
} from '../validators/evaluation.validator';
import { AuditLogService } from './auditLog.service';
import { ApplicationStatus } from '@prisma/client';

const auditLogService = new AuditLogService();

export class EvaluationService {
  /**
   * Create evaluation (Recruiter or Interviewer)
   * Interviewers can only evaluate applications they're assigned to
   */
  async createEvaluation(
    applicationId: string,
    data: CreateEvaluationInput,
    evaluatorId: string,
    userRole: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vacancy: true,
        interviewAssignments: {
          include: {
            interview: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // If user is INTERVIEWER, verify they're assigned to an interview for this application
    if (userRole === 'INTERVIEWER') {
      const hasInterviewAssignment = application.interviewAssignments.some(
        (assignment) => assignment.interview.interviewerId === evaluatorId
      );

      if (!hasInterviewAssignment) {
        throw new Error(
          'Interviewers can only evaluate applications they are assigned to interview'
        );
      }
    }

    // Create evaluation
    const evaluation = await prisma.evaluation.create({
      data: {
        applicationId,
        evaluatorId,
        rating: data.rating,
        comments: data.comments,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        recommendation: data.recommendation,
      },
      include: {
        evaluator: {
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

    // Log evaluation
    await auditLogService.log({
      userId: evaluatorId,
      action: 'CREATE',
      entity: 'Evaluation',
      entityId: evaluation.id,
      changes: {
        applicationId,
        rating: data.rating,
        recommendation: data.recommendation,
      },
      ipAddress,
      userAgent,
    });

    return evaluation;
  }

  /**
   * Update application status with business rules validation
   */
  async updateApplicationStatus(
    applicationId: string,
    data: UpdateApplicationStatusInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get application with evaluations
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        evaluations: {
          select: {
            rating: true,
          },
        },
        vacancy: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const oldStatus = application.status;
    const newStatus = data.status;

    // Validate status transition
    const transitionValidation = validateStatusTransition(oldStatus, newStatus);
    if (!transitionValidation.valid) {
      throw new Error(transitionValidation.error);
    }

    // Validate business rules
    const businessRulesValidation = validateBusinessRules(
      newStatus,
      application.evaluations,
      oldStatus
    );
    if (!businessRulesValidation.valid) {
      throw new Error(businessRulesValidation.error);
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        notes: data.notes,
      },
      include: {
        vacancy: {
          select: {
            id: true,
            title: true,
          },
        },
        applicant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log status change
    await auditLogService.log({
      userId,
      action: 'UPDATE',
      entity: 'Application',
      entityId: applicationId,
      changes: {
        status: { from: oldStatus, to: newStatus },
        notes: data.notes,
      },
      ipAddress,
      userAgent,
    });

    return updatedApplication;
  }

  /**
   * Get manager's department vacancies
   */
  async getManagerVacancies(managerId: string, query: ManagerVacanciesQuery) {
    const { status, page, limit } = query;

    // Get departments managed by this user
    const departments = await prisma.department.findMany({
      where: { managerId },
      select: { id: true },
    });

    if (departments.length === 0) {
      throw new Error('You are not assigned as a manager to any department');
    }

    const departmentIds = departments.map((d) => d.id);

    const where: any = {
      departmentId: { in: departmentIds },
    };

    if (status) {
      where.status = status;
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
   * Get application detail for manager (includes all evaluations)
   */
  async getApplicationForManager(applicationId: string, managerId: string) {
    // Verify manager has access (application is for a vacancy in their department)
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vacancy: {
          include: {
            department: true,
          },
        },
        applicant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        cv: true,
        motivationLetter: true,
        evaluations: {
          include: {
            evaluator: {
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
        },
        managerRecommendations: {
          include: {
            manager: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        testAttempts: {
          include: {
            test: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
          orderBy: {
            startedAt: 'desc',
          },
        },
        interviewAssignments: {
          include: {
            interview: {
              select: {
                id: true,
                title: true,
                type: true,
                scheduledAt: true,
                location: true,
                status: true,
                interviewer: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            assignedAt: 'desc',
          },
        },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Verify manager has access to this department
    if (application.vacancy.department.managerId !== managerId) {
      throw new Error('You can only view applications for vacancies in your department');
    }

    return application;
  }

  /**
   * Create manager recommendation
   */
  async createManagerRecommendation(
    applicationId: string,
    data: ManagerRecommendationInput,
    managerId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Verify manager has access
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vacancy: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.vacancy.department.managerId !== managerId) {
      throw new Error('You can only recommend for applications in your department');
    }

    // Create recommendation
    const recommendation = await prisma.managerRecommendation.create({
      data: {
        applicationId,
        managerId,
        comment: data.comment,
        suggestedDecision: data.suggestedDecision,
        confidential: data.confidential,
      },
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log recommendation
    await auditLogService.log({
      userId: managerId,
      action: 'CREATE',
      entity: 'ManagerRecommendation',
      entityId: recommendation.id,
      changes: {
        applicationId,
        suggestedDecision: data.suggestedDecision,
        confidential: data.confidential,
      },
      ipAddress,
      userAgent,
    });

    return recommendation;
  }
}

export default new EvaluationService();

