import { PrismaClient } from '@prisma/client';
import { emailService } from './email.service';
import { EmailTemplates } from '../templates/email.templates';

const prisma = new PrismaClient();

export interface NotificationData {
  senderId?: string;
  receiverId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
}

export class NotificationService {
  /**
   * Send a notification to a user (DB + Email)
   */
  async sendNotification(data: NotificationData) {
    // Save to database
    const notification = await prisma.notification.create({
      data: {
        senderId: data.senderId || null,
        receiverId: data.receiverId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || null,
      },
      include: {
        receiver: true,
      },
    });

    // Send email notification
    await this.sendEmailNotification(notification.receiver.email, data.type, data.metadata);

    return notification;
  }

  /**
   * Send email notification based on type
   */
  private async sendEmailNotification(email: string, type: string, metadata: any) {
    try {
      let template;

      switch (type) {
        case 'APPLICATION_RECEIVED':
          template = EmailTemplates.applicationReceived(metadata);
          break;
        case 'TEST_INVITED':
          template = EmailTemplates.testInvited(metadata);
          break;
        case 'INTERVIEW_SCHEDULED':
          template = EmailTemplates.interviewScheduled(metadata);
          break;
        case 'INTERVIEW_RESCHEDULED':
          template = EmailTemplates.interviewRescheduled(metadata);
          break;
        case 'INTERVIEW_CANCELLED':
          template = EmailTemplates.interviewCancelled(metadata);
          break;
        case 'APPLICATION_REJECTED':
          template = EmailTemplates.rejected(metadata);
          break;
        case 'APPLICATION_HIRED':
          template = EmailTemplates.hired(metadata);
          break;
        default:
          // For other notification types, don't send email
          return;
      }

      await emailService.sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      console.error('[NotificationService] Failed to send email:', error);
      // Don't throw - notification was saved to DB
    }
  }

  /**
   * Send notifications to multiple users
   */
  async sendBulkNotifications(notifications: NotificationData[]) {
    return await prisma.notification.createMany({
      data: notifications.map((n) => ({
        senderId: n.senderId || null,
        receiverId: n.receiverId,
        type: n.type,
        title: n.title,
        message: n.message,
        metadata: n.metadata || null,
      })),
    });
  }

  /**
   * Send interview scheduled notification
   */
  async notifyInterviewScheduled(
    interviewId: string,
    applicantId: string,
    interviewerIds: string[],
    scheduledById: string,
    interviewDetails: {
      title: string;
      scheduledAt: Date;
      location?: string;
      vacancyTitle: string;
    }
  ) {
    const notifications: NotificationData[] = [];

    // Notify applicant
    notifications.push({
      senderId: scheduledById,
      receiverId: applicantId,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled',
      message: `Your interview "${interviewDetails.title}" for ${interviewDetails.vacancyTitle} has been scheduled for ${interviewDetails.scheduledAt.toLocaleString()}.`,
      metadata: {
        interviewId,
        scheduledAt: interviewDetails.scheduledAt,
        location: interviewDetails.location,
      },
    });

    // Notify interviewers
    for (const interviewerId of interviewerIds) {
      notifications.push({
        senderId: scheduledById,
        receiverId: interviewerId,
        type: 'INTERVIEW_ASSIGNED',
        title: 'Interview Assignment',
        message: `You have been assigned to conduct an interview "${interviewDetails.title}" for ${interviewDetails.vacancyTitle} on ${interviewDetails.scheduledAt.toLocaleString()}.`,
        metadata: {
          interviewId,
          scheduledAt: interviewDetails.scheduledAt,
          location: interviewDetails.location,
        },
      });
    }

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Send interview rescheduled notification
   */
  async notifyInterviewRescheduled(
    interviewId: string,
    applicantId: string,
    interviewerIds: string[],
    rescheduledById: string,
    interviewDetails: {
      title: string;
      oldScheduledAt: Date;
      newScheduledAt: Date;
      reason: string;
      vacancyTitle: string;
    }
  ) {
    const notifications: NotificationData[] = [];

    // Notify applicant
    notifications.push({
      senderId: rescheduledById,
      receiverId: applicantId,
      type: 'INTERVIEW_RESCHEDULED',
      title: 'Interview Rescheduled',
      message: `Your interview "${interviewDetails.title}" for ${interviewDetails.vacancyTitle} has been rescheduled from ${interviewDetails.oldScheduledAt.toLocaleString()} to ${interviewDetails.newScheduledAt.toLocaleString()}. Reason: ${interviewDetails.reason}`,
      metadata: {
        interviewId,
        oldScheduledAt: interviewDetails.oldScheduledAt,
        newScheduledAt: interviewDetails.newScheduledAt,
        reason: interviewDetails.reason,
      },
    });

    // Notify interviewers
    for (const interviewerId of interviewerIds) {
      notifications.push({
        senderId: rescheduledById,
        receiverId: interviewerId,
        type: 'INTERVIEW_RESCHEDULED',
        title: 'Interview Rescheduled',
        message: `Interview "${interviewDetails.title}" for ${interviewDetails.vacancyTitle} has been rescheduled from ${interviewDetails.oldScheduledAt.toLocaleString()} to ${interviewDetails.newScheduledAt.toLocaleString()}. Reason: ${interviewDetails.reason}`,
        metadata: {
          interviewId,
          oldScheduledAt: interviewDetails.oldScheduledAt,
          newScheduledAt: interviewDetails.newScheduledAt,
          reason: interviewDetails.reason,
        },
      });
    }

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Send interview cancelled notification
   */
  async notifyInterviewCancelled(
    interviewId: string,
    applicantId: string,
    interviewerIds: string[],
    cancelledById: string,
    interviewDetails: {
      title: string;
      scheduledAt: Date;
      reason: string;
      vacancyTitle: string;
    }
  ) {
    const notifications: NotificationData[] = [];

    // Notify applicant
    notifications.push({
      senderId: cancelledById,
      receiverId: applicantId,
      type: 'INTERVIEW_CANCELLED',
      title: 'Interview Cancelled',
      message: `Your interview "${interviewDetails.title}" for ${interviewDetails.vacancyTitle} scheduled for ${interviewDetails.scheduledAt.toLocaleString()} has been cancelled. Reason: ${interviewDetails.reason}`,
      metadata: {
        interviewId,
        scheduledAt: interviewDetails.scheduledAt,
        reason: interviewDetails.reason,
      },
    });

    // Notify interviewers
    for (const interviewerId of interviewerIds) {
      notifications.push({
        senderId: cancelledById,
        receiverId: interviewerId,
        type: 'INTERVIEW_CANCELLED',
        title: 'Interview Cancelled',
        message: `Interview "${interviewDetails.title}" for ${interviewDetails.vacancyTitle} scheduled for ${interviewDetails.scheduledAt.toLocaleString()} has been cancelled. Reason: ${interviewDetails.reason}`,
        metadata: {
          interviewId,
          scheduledAt: interviewDetails.scheduledAt,
          reason: interviewDetails.reason,
        },
      });
    }

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Send application received notification
   */
  async notifyApplicationReceived(
    applicationId: string,
    applicantId: string,
    applicantName: string,
    vacancyTitle: string
  ) {
    await this.sendNotification({
      receiverId: applicantId,
      type: 'APPLICATION_RECEIVED',
      title: 'Application Received',
      message: `Your application for ${vacancyTitle} has been received and is under review.`,
      metadata: {
        applicationId,
        applicantName,
        vacancyTitle,
      },
    });
  }

  /**
   * Send test invitation notification
   */
  async notifyTestInvited(
    testId: string,
    applicantId: string,
    applicantName: string,
    vacancyTitle: string,
    testType: string,
    deadline: Date,
    testLink: string
  ) {
    await this.sendNotification({
      receiverId: applicantId,
      type: 'TEST_INVITED',
      title: 'Test Invitation',
      message: `You have been invited to take the ${testType} for ${vacancyTitle}. Deadline: ${deadline.toLocaleString()}`,
      metadata: {
        testId,
        applicantName,
        vacancyTitle,
        testType,
        deadline: deadline.toLocaleString(),
        testLink,
      },
    });
  }

  /**
   * Send application rejected notification
   */
  async notifyApplicationRejected(
    applicationId: string,
    applicantId: string,
    applicantName: string,
    vacancyTitle: string,
    reason?: string
  ) {
    await this.sendNotification({
      receiverId: applicantId,
      type: 'APPLICATION_REJECTED',
      title: 'Application Update',
      message: `Thank you for your interest in ${vacancyTitle}. After careful consideration, we have decided to move forward with other candidates.`,
      metadata: {
        applicationId,
        applicantName,
        vacancyTitle,
        reason,
      },
    });
  }

  /**
   * Send hired notification
   */
  async notifyHired(
    applicationId: string,
    applicantId: string,
    applicantName: string,
    vacancyTitle: string,
    startDate?: Date
  ) {
    await this.sendNotification({
      receiverId: applicantId,
      type: 'APPLICATION_HIRED',
      title: 'Congratulations! Job Offer',
      message: `Congratulations! We are delighted to offer you the position of ${vacancyTitle}.`,
      metadata: {
        applicationId,
        applicantName,
        vacancyTitle,
        startDate: startDate?.toLocaleDateString(),
      },
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    options?: {
      isRead?: boolean;
      type?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { receiverId: userId };

    if (options?.isRead !== undefined) {
      where.isRead = options.isRead;
    }

    if (options?.type) {
      where.type = options.type;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        receiverId: userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }
}

