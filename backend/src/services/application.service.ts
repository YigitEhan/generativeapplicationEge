import prisma from '../config/database';
import {
  ApplyToVacancyInput,
  WithdrawApplicationInput,
  MyApplicationsQuery,
  VacancyApplicationsQuery,
  UpdateApplicationStatusInput,
  StructuredCV,
} from '../validators/application.validator';
import { AuditLogService } from './auditLog.service';
import { NotificationService } from './notification.service';
import path from 'path';
import fs from 'fs';

const auditLogService = new AuditLogService();
const notificationService = new NotificationService();

export class ApplicationService {
  /**
   * Apply to vacancy
   * Supports either CV file upload OR structured CV data
   */
  async apply(
    data: ApplyToVacancyInput,
    applicantId: string,
    cvFile?: Express.Multer.File,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get vacancy
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: data.vacancyId },
      include: {
        department: true,
      },
    });

    if (!vacancy) {
      throw new Error('Vacancy not found');
    }

    // Verify vacancy is open and published
    if (vacancy.status !== 'OPEN' || !vacancy.isPublished) {
      throw new Error('This vacancy is not accepting applications');
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        vacancyId_applicantId: {
          vacancyId: data.vacancyId,
          applicantId,
        },
      },
    });

    if (existingApplication) {
      throw new Error('You have already applied to this vacancy');
    }

    // Must provide either CV file OR structured CV data
    if (!cvFile && !data.structuredCV) {
      throw new Error('Please provide either a CV file or structured CV data');
    }

    // Create CV record
    let cvId: string | undefined;
    if (cvFile || data.structuredCV) {
      const cvData: any = {
        userId: applicantId,
      };

      if (cvFile) {
        cvData.fileName = cvFile.filename;
        cvData.filePath = cvFile.path;
        cvData.fileSize = cvFile.size;
        cvData.mimeType = cvFile.mimetype;
      }

      if (data.structuredCV) {
        cvData.structuredData = data.structuredCV;
      }

      const cv = await prisma.cV.create({
        data: cvData,
      });
      cvId = cv.id;
    }

    // Create motivation letter if provided
    let motivationLetterId: string | undefined;
    if (data.motivationLetter) {
      const motivationLetter = await prisma.motivationLetter.create({
        data: {
          userId: applicantId,
          content: data.motivationLetter,
          vacancyId: data.vacancyId,
        },
      });
      motivationLetterId = motivationLetter.id;
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        vacancyId: data.vacancyId,
        applicantId,
        cvId,
        motivationLetterId,
        status: 'APPLIED',
      },
      include: {
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
        cv: true,
        motivationLetter: true,
      },
    });

    // Log application
    await auditLogService.log({
      userId: applicantId,
      action: 'CREATE',
      entity: 'Application',
      entityId: application.id,
      changes: {
        vacancyId: data.vacancyId,
        status: 'APPLIED',
      },
      ipAddress,
      userAgent,
    });

    // Send notification to applicant
    const applicant = await prisma.user.findUnique({
      where: { id: applicantId },
      select: { firstName: true, lastName: true },
    });

    if (applicant) {
      await notificationService.notifyApplicationReceived(
        application.id,
        applicantId,
        `${applicant.firstName} ${applicant.lastName}`,
        vacancy.title
      );
    }

    return application;
  }

  /**
   * Get applicant's own applications
   */
  async getMyApplications(applicantId: string, query: MyApplicationsQuery) {
    const { status, page, limit } = query;

    const where: any = {
      applicantId,
    };

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          vacancy: {
            select: {
              id: true,
              title: true,
              location: true,
              employmentType: true,
              status: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          cv: {
            select: {
              id: true,
              fileName: true,
              uploadedAt: true,
            },
          },
          motivationLetter: {
            select: {
              id: true,
              content: true,
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
                },
              },
            },
          },
        },
        orderBy: {
          appliedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get applicant's application detail with timeline
   */
  async getMyApplicationById(applicantId: string, applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vacancy: {
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
            deadline: true,
            status: true,
            department: {
              select: {
                id: true,
                name: true,
                description: true,
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
          orderBy: {
            appliedAt: 'desc',
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

    // Verify ownership
    if (application.applicantId !== applicantId) {
      throw new Error('You can only view your own applications');
    }

    return application;
  }

  /**
   * Withdraw application
   */
  async withdraw(
    applicantId: string,
    applicationId: string,
    data: WithdrawApplicationInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Verify ownership
    if (application.applicantId !== applicantId) {
      throw new Error('You can only withdraw your own applications');
    }

    // Can only withdraw if not already withdrawn or rejected
    if (application.status === 'WITHDRAWN' || application.status === 'REJECTED') {
      throw new Error('This application has already been withdrawn or rejected');
    }

    const oldStatus = application.status;

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'WITHDRAWN',
        notes: data.reason
          ? `Withdrawn by applicant. Reason: ${data.reason}`
          : 'Withdrawn by applicant',
      },
      include: {
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
    });

    // Log withdrawal
    await auditLogService.log({
      userId: applicantId,
      action: 'UPDATE',
      entity: 'Application',
      entityId: applicationId,
      changes: {
        before: { status: oldStatus },
        after: { status: 'WITHDRAWN', reason: data.reason },
      },
      ipAddress,
      userAgent,
    });

    return updatedApplication;
  }

  /**
   * Get all applications (Recruiter/Admin)
   */
  async getAllApplications(query: VacancyApplicationsQuery) {
    const { status, page, limit, vacancyId } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (vacancyId) {
      where.vacancyId = vacancyId;
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
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
          cv: {
            select: {
              id: true,
              fileName: true,
              structuredData: true,
              uploadedAt: true,
            },
          },
          _count: {
            select: {
              evaluations: true,
            },
          },
        },
        orderBy: {
          appliedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all applications for a vacancy (Recruiter)
   */
  async getVacancyApplications(vacancyId: string, query: VacancyApplicationsQuery) {
    const { status, page, limit } = query;

    // Verify vacancy exists
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new Error('Vacancy not found');
    }

    const where: any = {
      vacancyId,
    };

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          applicant: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          cv: {
            select: {
              id: true,
              fileName: true,
              structuredData: true,
              uploadedAt: true,
            },
          },
          motivationLetter: {
            select: {
              id: true,
              content: true,
            },
          },
          _count: {
            select: {
              evaluations: true,
              testAttempts: true,
              interviewAssignments: true,
            },
          },
        },
        orderBy: {
          appliedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get application detail (Recruiter)
   */
  async getApplicationById(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vacancy: {
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            salaryMin: true,
            salaryMax: true,
            location: true,
            employmentType: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
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
            appliedAt: 'desc',
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

    return application;
  }

  /**
   * Update application status (Recruiter)
   */
  async updateStatus(
    applicationId: string,
    data: UpdateApplicationStatusInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const oldStatus = application.status;
    const oldNotes = application.notes;

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: data.status,
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

    // Log status update
    await auditLogService.log({
      userId,
      action: 'UPDATE',
      entity: 'Application',
      entityId: applicationId,
      changes: {
        before: { status: oldStatus, notes: oldNotes },
        after: { status: data.status, notes: data.notes },
      },
      ipAddress,
      userAgent,
    });

    // Send notifications for status changes
    const applicantName = `${updatedApplication.applicant.firstName} ${updatedApplication.applicant.lastName}`;

    if (data.status === 'REJECTED') {
      await notificationService.notifyApplicationRejected(
        applicationId,
        updatedApplication.applicant.id,
        applicantName,
        updatedApplication.vacancy.title,
        data.notes
      );
    } else if (data.status === 'HIRED') {
      await notificationService.notifyHired(
        applicationId,
        updatedApplication.applicant.id,
        applicantName,
        updatedApplication.vacancy.title
      );
    }

    return updatedApplication;
  }

  /**
   * Download CV file
   */
  async downloadCV(cvId: string, userId: string, userRole: string) {
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        applications: {
          select: {
            applicantId: true,
          },
        },
      },
    });

    if (!cv) {
      throw new Error('CV not found');
    }

    // Check permissions
    const isOwner = cv.userId === userId;
    const isRecruiterOrAdmin = ['RECRUITER', 'ADMIN'].includes(userRole);

    if (!isOwner && !isRecruiterOrAdmin) {
      throw new Error('You do not have permission to download this CV');
    }

    if (!cv.filePath) {
      throw new Error('CV file not found');
    }

    // Check if file exists
    if (!fs.existsSync(cv.filePath)) {
      throw new Error('CV file not found on server');
    }

    return {
      filePath: cv.filePath,
      fileName: cv.fileName || 'cv.pdf',
      mimeType: cv.mimeType || 'application/pdf',
    };
  }
}

export default new ApplicationService();

