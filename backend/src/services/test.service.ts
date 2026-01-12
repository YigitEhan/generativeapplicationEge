import { PrismaClient, TestType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateTestInput,
  InviteToTestInput,
  SubmitQuizInput,
  MarkExternalCompleteInput,
  TestAttemptsQuery,
  Question,
  calculateQuizScore,
} from '../validators/test.validator';
import { AuditLogService } from './auditLog.service';
import { NotificationService } from './notification.service';

const prisma = new PrismaClient();
const auditLogService = new AuditLogService();
const notificationService = new NotificationService();

export class TestService {
  /**
   * Create a test for a vacancy (RECRUITER only)
   */
  async createTest(
    vacancyId: string,
    data: CreateTestInput,
    createdById: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Verify vacancy exists
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new Error('Vacancy not found');
    }

    // Prepare questions with IDs for internal quiz
    let questions = null;
    let totalScore = null;

    if (data.type === 'INTERNAL_QUIZ') {
      questions = data.questions.map((q) => ({
        ...q,
        id: q.id || uuidv4(),
      }));
      totalScore = questions.reduce((sum, q) => sum + q.points, 0);
    }

    const test = await prisma.test.create({
      data: {
        vacancyId,
        createdById,
        type: data.type,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        duration: data.duration || null,
        passingScore: data.passingScore || null,
        totalScore,
        externalUrl: data.type === 'EXTERNAL_LINK' ? data.externalUrl : null,
        questions: questions as any,
      },
      include: {
        vacancy: {
          select: {
            id: true,
            title: true,
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
      },
    });

    // Audit log
    await auditLogService.log({
      userId: createdById,
      action: 'CREATE',
      entity: 'Test',
      entityId: test.id,
      changes: {
        vacancyId,
        type: data.type,
        title: data.title,
      },
      ipAddress,
      userAgent,
    });

    return test;
  }

  /**
   * Invite applicant to take test (RECRUITER only)
   */
  async inviteToTest(
    applicationId: string,
    data: InviteToTestInput,
    recruiterId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get application with vacancy
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vacancy: true,
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

    if (!application) {
      throw new Error('Application not found');
    }

    // Verify test exists and belongs to the vacancy
    const test = await prisma.test.findFirst({
      where: {
        id: data.testId,
        vacancyId: application.vacancyId,
        isActive: true,
      },
    });

    if (!test) {
      throw new Error('Test not found or not active for this vacancy');
    }

    // Check if already invited/attempted
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId: data.testId,
        applicationId,
      },
    });

    if (existingAttempt) {
      throw new Error('Applicant has already been invited to this test');
    }

    // Create test attempt
    const testAttempt = await prisma.testAttempt.create({
      data: {
        testId: data.testId,
        applicationId,
        candidateId: application.applicantId,
      },
      include: {
        test: true,
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
        candidate: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update application status to TEST_INVITED
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'TEST_INVITED' },
    });

    // Audit log
    await auditLogService.log({
      userId: recruiterId,
      action: 'CREATE',
      entity: 'TestAttempt',
      entityId: testAttempt.id,
      changes: {
        applicationId,
        testId: data.testId,
        status: 'TEST_INVITED',
      },
      ipAddress,
      userAgent,
    });

    // Send notification to applicant
    const applicantName = `${application.applicant.firstName} ${application.applicant.lastName}`;
    const testLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/applications/${applicationId}/test`;
    const deadline = test.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default

    await notificationService.notifyTestInvited(
      test.id,
      application.applicant.id,
      applicantName,
      application.vacancy.title,
      test.type,
      deadline,
      testLink
    );

    return testAttempt;
  }

  /**
   * Get test for applicant (APPLICANT only)
   */
  async getTestForApplicant(applicationId: string, applicantId: string) {
    // Get application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.applicantId !== applicantId) {
      throw new Error('You can only view tests for your own applications');
    }

    // Get test attempt
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        applicationId,
        candidateId: applicantId,
      },
      include: {
        test: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!testAttempt) {
      throw new Error('No test invitation found for this application');
    }

    // Return test details (hide correct answers for internal quiz)
    const test = testAttempt.test;
    let sanitizedQuestions = null;

    if (test.type === 'INTERNAL_QUIZ' && test.questions) {
      const questions = test.questions as Question[];
      sanitizedQuestions = questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        points: q.points,
        options: q.options,
        // Hide correct answers
      }));
    }

    return {
      ...testAttempt,
      test: {
        ...test,
        questions: sanitizedQuestions,
      },
    };
  }

  /**
   * Submit internal quiz (APPLICANT only)
   */
  async submitQuiz(
    applicationId: string,
    data: SubmitQuizInput,
    applicantId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get test attempt
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        applicationId,
        candidateId: applicantId,
      },
      include: {
        test: true,
      },
    });

    if (!testAttempt) {
      throw new Error('Test attempt not found');
    }

    if (testAttempt.completedAt) {
      throw new Error('Test has already been submitted');
    }

    if (testAttempt.test.type !== 'INTERNAL_QUIZ') {
      throw new Error('This endpoint is only for internal quizzes');
    }

    // Calculate score
    const questions = testAttempt.test.questions as Question[];
    const result = calculateQuizScore(questions, data.answers);

    const passingScore = testAttempt.test.passingScore || 0;
    const percentage = result.totalScore > 0 ? (result.score / result.totalScore) * 100 : 0;
    const isPassed = percentage >= passingScore;

    // Update test attempt
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: testAttempt.id },
      data: {
        answers: data.answers as any,
        score: result.score,
        isPassed,
        completedAt: new Date(),
      },
      include: {
        test: true,
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

    // Update application status to TEST_COMPLETED
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'TEST_COMPLETED' },
    });

    // Audit log
    await auditLogService.log({
      userId: applicantId,
      action: 'UPDATE',
      entity: 'TestAttempt',
      entityId: testAttempt.id,
      changes: {
        score: result.score,
        totalScore: result.totalScore,
        isPassed,
        status: 'TEST_COMPLETED',
      },
      ipAddress,
      userAgent,
    });

    return {
      ...updatedAttempt,
      score: result.score,
      totalScore: result.totalScore,
      percentage: Math.round(percentage),
      isPassed,
    };
  }

  /**
   * Mark external test as complete (APPLICANT only)
   */
  async markExternalComplete(
    applicationId: string,
    data: MarkExternalCompleteInput,
    applicantId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Get test attempt
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        applicationId,
        candidateId: applicantId,
      },
      include: {
        test: true,
      },
    });

    if (!testAttempt) {
      throw new Error('Test attempt not found');
    }

    if (testAttempt.completedAt) {
      throw new Error('Test has already been marked as complete');
    }

    if (testAttempt.test.type !== 'EXTERNAL_LINK') {
      throw new Error('This endpoint is only for external link tests');
    }

    // Update test attempt
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: testAttempt.id },
      data: {
        externalCompleted: true,
        externalNotes: data.notes,
        completedAt: new Date(),
      },
      include: {
        test: true,
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

    // Update application status to TEST_COMPLETED
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'TEST_COMPLETED' },
    });

    // Audit log
    await auditLogService.log({
      userId: applicantId,
      action: 'UPDATE',
      entity: 'TestAttempt',
      entityId: testAttempt.id,
      changes: {
        externalCompleted: true,
        status: 'TEST_COMPLETED',
      },
      ipAddress,
      userAgent,
    });

    return updatedAttempt;
  }

  /**
   * Get test attempt for recruiter (RECRUITER only)
   */
  async getTestAttempt(applicationId: string) {
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        applicationId,
      },
      include: {
        test: true,
        application: {
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
        },
        candidate: {
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
    });

    if (!testAttempt) {
      throw new Error('No test attempt found for this application');
    }

    // Calculate percentage for internal quiz
    let percentage = null;
    if (testAttempt.test.type === 'INTERNAL_QUIZ' && testAttempt.score !== null) {
      const totalScore = testAttempt.test.totalScore || 0;
      percentage = totalScore > 0 ? Math.round((testAttempt.score / totalScore) * 100) : 0;
    }

    return {
      ...testAttempt,
      percentage,
    };
  }

  /**
   * Get all tests for a vacancy (RECRUITER only)
   */
  async getTestsForVacancy(vacancyId: string) {
    const tests = await prisma.test.findMany({
      where: {
        vacancyId,
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
        _count: {
          select: {
            testAttempts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tests;
  }
}


