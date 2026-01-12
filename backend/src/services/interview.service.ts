import { PrismaClient, InterviewStatus, Role } from '@prisma/client';
import {
  ScheduleInterviewInput,
  RescheduleInterviewInput,
  CancelInterviewInput,
  AssignInterviewersInput,
  CompleteInterviewInput,
  GetInterviewerInterviewsQuery,
} from '../validators/interview.validator';
import { AuditLogService } from './auditLog.service';
import { NotificationService } from './notification.service';

const prisma = new PrismaClient();
const auditLogService = new AuditLogService();
const notificationService = new NotificationService();

export class InterviewService {
  /**
   * Schedule an interview (RECRUITER only)
   */
  async scheduleInterview(
    applicationId: string,
    data: ScheduleInterviewInput,
    scheduledById: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get application with applicant and vacancy
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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

    // Verify all interviewers exist and have INTERVIEWER role
    const interviewers = await prisma.user.findMany({
      where: {
        id: { in: data.interviewerIds },
        role: { in: [Role.INTERVIEWER, Role.MANAGER, Role.ADMIN] },
        isActive: true,
      },
    });

    if (interviewers.length !== data.interviewerIds.length) {
      throw new Error('One or more interviewers not found or not authorized');
    }

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        applicationId,
        vacancyId: application.vacancyId,
        title: data.title,
        description: data.description,
        round: data.round,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration,
        location: data.location,
        notes: data.notes,
        scheduledById,
        status: InterviewStatus.SCHEDULED,
        interviewers: {
          create: data.interviewerIds.map((interviewerId) => ({
            interviewerId,
          })),
        },
      },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            vacancy: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        interviewers: {
          include: {
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
        scheduledBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update application status to INTERVIEW_R1 or INTERVIEW_R2
    const newStatus = data.round === 1 ? 'INTERVIEW_R1' : 'INTERVIEW_R2';
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    });

    // Send notifications
    await notificationService.notifyInterviewScheduled(
      interview.id,
      application.applicantId,
      data.interviewerIds,
      scheduledById,
      {
        title: data.title,
        scheduledAt: new Date(data.scheduledAt),
        location: data.location,
        vacancyTitle: application.vacancy.title,
      }
    );

    // Audit log
    await auditLogService.log({
      userId: scheduledById,
      action: 'CREATE',
      entity: 'Interview',
      entityId: interview.id,
      changes: {
        applicationId,
        title: data.title,
        scheduledAt: data.scheduledAt,
        interviewerIds: data.interviewerIds,
      },
      ipAddress,
      userAgent,
    });

    return interview;
  }

  /**
   * Reschedule an interview (RECRUITER only)
   */
  async rescheduleInterview(
    interviewId: string,
    data: RescheduleInterviewInput,
    rescheduledById: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get interview with all relations
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            vacancy: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        interviewers: {
          include: {
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
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    if (interview.status === InterviewStatus.CANCELLED) {
      throw new Error('Cannot reschedule a cancelled interview');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new Error('Cannot reschedule a completed interview');
    }

    const oldScheduledAt = interview.scheduledAt;

    // Update interview
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration !== undefined ? data.duration : interview.duration,
        location: data.location !== undefined ? data.location : interview.location,
        notes: data.notes !== undefined ? data.notes : interview.notes,
        rescheduleReason: data.reason,
        status: InterviewStatus.RESCHEDULED,
      },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            vacancy: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        interviewers: {
          include: {
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
    });

    // Send notifications
    const interviewerIds = interview.interviewers.map((i) => i.interviewerId);
    await notificationService.notifyInterviewRescheduled(
      interview.id,
      interview.application.applicantId,
      interviewerIds,
      rescheduledById,
      {
        title: interview.title,
        oldScheduledAt,
        newScheduledAt: new Date(data.scheduledAt),
        reason: data.reason,
        vacancyTitle: interview.application.vacancy.title,
      }
    );

    // Audit log
    await auditLogService.log({
      userId: rescheduledById,
      action: 'UPDATE',
      entity: 'Interview',
      entityId: interview.id,
      changes: {
        oldScheduledAt: oldScheduledAt.toISOString(),
        newScheduledAt: data.scheduledAt,
        reason: data.reason,
        status: 'RESCHEDULED',
      },
      ipAddress,
      userAgent,
    });

    return updatedInterview;
  }

  /**
   * Cancel an interview (RECRUITER only)
   */
  async cancelInterview(
    interviewId: string,
    data: CancelInterviewInput,
    cancelledById: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get interview with all relations
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            vacancy: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        interviewers: {
          include: {
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
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    if (interview.status === InterviewStatus.CANCELLED) {
      throw new Error('Interview is already cancelled');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed interview');
    }

    // Update interview
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: InterviewStatus.CANCELLED,
        cancelReason: data.reason,
      },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            vacancy: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        interviewers: {
          include: {
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
    });

    // Send notifications
    const interviewerIds = interview.interviewers.map((i) => i.interviewerId);
    await notificationService.notifyInterviewCancelled(
      interview.id,
      interview.application.applicantId,
      interviewerIds,
      cancelledById,
      {
        title: interview.title,
        scheduledAt: interview.scheduledAt,
        reason: data.reason,
        vacancyTitle: interview.application.vacancy.title,
      }
    );

    // Audit log
    await auditLogService.log({
      userId: cancelledById,
      action: 'UPDATE',
      entity: 'Interview',
      entityId: interview.id,
      changes: {
        status: 'CANCELLED',
        reason: data.reason,
      },
      ipAddress,
      userAgent,
    });

    return updatedInterview;
  }

  /**
   * Assign interviewers to an interview (RECRUITER only)
   */
  async assignInterviewers(
    interviewId: string,
    data: AssignInterviewersInput,
    assignedById: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get interview
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        interviewers: true,
        application: {
          include: {
            vacancy: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    if (interview.status === InterviewStatus.CANCELLED) {
      throw new Error('Cannot assign interviewers to a cancelled interview');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new Error('Cannot assign interviewers to a completed interview');
    }

    // Verify all interviewers exist and have appropriate role
    const interviewers = await prisma.user.findMany({
      where: {
        id: { in: data.interviewerIds },
        role: { in: [Role.INTERVIEWER, Role.MANAGER, Role.ADMIN] },
        isActive: true,
      },
    });

    if (interviewers.length !== data.interviewerIds.length) {
      throw new Error('One or more interviewers not found or not authorized');
    }

    // Get current interviewer IDs
    const currentInterviewerIds = interview.interviewers.map((i) => i.interviewerId);

    // Find new interviewers (to add)
    const newInterviewerIds = data.interviewerIds.filter(
      (id) => !currentInterviewerIds.includes(id)
    );

    // Find removed interviewers (to delete)
    const removedInterviewerIds = currentInterviewerIds.filter(
      (id) => !data.interviewerIds.includes(id)
    );

    // Update interviewer assignments
    await prisma.$transaction([
      // Remove old assignments
      prisma.interviewerAssignment.deleteMany({
        where: {
          interviewId,
          interviewerId: { in: removedInterviewerIds },
        },
      }),
      // Add new assignments
      prisma.interviewerAssignment.createMany({
        data: newInterviewerIds.map((interviewerId) => ({
          interviewId,
          interviewerId,
        })),
      }),
    ]);

    // Send notifications to new interviewers
    if (newInterviewerIds.length > 0) {
      await notificationService.notifyInterviewScheduled(
        interview.id,
        interview.application.applicantId,
        newInterviewerIds,
        assignedById,
        {
          title: interview.title,
          scheduledAt: interview.scheduledAt,
          location: interview.location,
          vacancyTitle: interview.application.vacancy.title,
        }
      );
    }

    // Audit log
    await auditLogService.log({
      userId: assignedById,
      action: 'UPDATE',
      entity: 'Interview',
      entityId: interview.id,
      changes: {
        addedInterviewers: newInterviewerIds,
        removedInterviewers: removedInterviewerIds,
      },
      ipAddress,
      userAgent,
    });

    // Return updated interview
    return await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            vacancy: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        interviewers: {
          include: {
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
    });
  }

  /**
   * Complete an interview (INTERVIEWER only)
   */
  async completeInterview(
    interviewId: string,
    data: CompleteInterviewInput,
    interviewerId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get interview and verify interviewer is assigned
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        interviewers: true,
      },
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    const interviewerAssignment = interview.interviewers.find(
      (i) => i.interviewerId === interviewerId
    );

    if (!interviewerAssignment) {
      throw new Error('You are not assigned to this interview');
    }

    if (interview.status === InterviewStatus.CANCELLED) {
      throw new Error('Cannot complete a cancelled interview');
    }

    // Update interviewer assignment
    const updatedAssignment = await prisma.interviewerAssignment.update({
      where: { id: interviewerAssignment.id },
      data: {
        feedback: data.feedback,
        rating: data.rating,
        recommendation: data.recommendation,
        attended: data.attended,
        completedAt: new Date(),
      },
    });

    // Check if all interviewers have completed
    const allInterviewers = await prisma.interviewerAssignment.findMany({
      where: { interviewId },
    });

    const allCompleted = allInterviewers.every((i) => i.completedAt !== null);

    // If all interviewers completed, mark interview as completed
    if (allCompleted) {
      await prisma.interview.update({
        where: { id: interviewId },
        data: {
          status: InterviewStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }

    // Audit log
    await auditLogService.log({
      userId: interviewerId,
      action: 'UPDATE',
      entity: 'InterviewerAssignment',
      entityId: updatedAssignment.id,
      changes: {
        feedback: data.feedback,
        rating: data.rating,
        recommendation: data.recommendation,
        attended: data.attended,
        interviewCompleted: allCompleted,
      },
      ipAddress,
      userAgent,
    });

    return updatedAssignment;
  }

  /**
   * Get interviews for an interviewer (INTERVIEWER only)
   */
  async getInterviewerInterviews(
    interviewerId: string,
    query: GetInterviewerInterviewsQuery
  ) {
    const where: any = {
      interviewers: {
        some: {
          interviewerId,
        },
      },
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.scheduledAt = {};
      if (query.from) {
        where.scheduledAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.scheduledAt.lte = new Date(query.to);
      }
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            vacancy: {
              select: {
                id: true,
                title: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        interviewers: {
          where: {
            interviewerId,
          },
          include: {
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
        scheduledBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    return interviews;
  }

  /**
   * Get interview details for an interviewer (INTERVIEWER only)
   * Includes candidate CV and recruiter evaluation
   */
  async getInterviewDetails(interviewId: string, interviewerId: string) {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            vacancy: {
              select: {
                id: true,
                title: true,
                description: true,
                requirements: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
            },
          },
        },
        interviewers: {
          include: {
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
        scheduledBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    // Verify interviewer is assigned to this interview
    const isAssigned = interview.interviewers.some(
      (i) => i.interviewerId === interviewerId
    );

    if (!isAssigned) {
      throw new Error('You are not assigned to this interview');
    }

    return interview;
  }
}

