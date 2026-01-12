import prisma from '../config/database';

export interface AuditLogData {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Service for creating audit logs
 * Tracks all important actions in the system
 */
export class AuditLogService {
  /**
   * Create an audit log entry
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          changes: data.changes || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // Log error but don't throw - audit logging should not break the main flow
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log vacancy request creation
   */
  async logVacancyRequestCreated(
    userId: string,
    vacancyRequestId: string,
    data: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'CREATE',
      entity: 'VacancyRequest',
      entityId: vacancyRequestId,
      changes: {
        title: data.title,
        status: data.status,
        departmentId: data.departmentId,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log vacancy request update
   */
  async logVacancyRequestUpdated(
    userId: string,
    vacancyRequestId: string,
    oldData: any,
    newData: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'UPDATE',
      entity: 'VacancyRequest',
      entityId: vacancyRequestId,
      changes: {
        before: oldData,
        after: newData,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log vacancy request status change
   */
  async logVacancyRequestStatusChange(
    userId: string,
    vacancyRequestId: string,
    oldStatus: string,
    newStatus: string,
    additionalData?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'STATUS_CHANGE',
      entity: 'VacancyRequest',
      entityId: vacancyRequestId,
      changes: {
        oldStatus,
        newStatus,
        ...additionalData,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log vacancy request approval
   */
  async logVacancyRequestApproved(
    userId: string,
    vacancyRequestId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logVacancyRequestStatusChange(
      userId,
      vacancyRequestId,
      'PENDING',
      'APPROVED',
      { approvedBy: userId, approvedAt: new Date() },
      ipAddress,
      userAgent
    );
  }

  /**
   * Log vacancy request decline
   */
  async logVacancyRequestDeclined(
    userId: string,
    vacancyRequestId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logVacancyRequestStatusChange(
      userId,
      vacancyRequestId,
      'PENDING',
      'DECLINED',
      { declinedBy: userId, declinedReason: reason, declinedAt: new Date() },
      ipAddress,
      userAgent
    );
  }

  /**
   * Log vacancy request cancellation
   */
  async logVacancyRequestCancelled(
    userId: string,
    vacancyRequestId: string,
    oldStatus: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logVacancyRequestStatusChange(
      userId,
      vacancyRequestId,
      oldStatus,
      'CANCELLED',
      { cancelledBy: userId, cancelledAt: new Date() },
      ipAddress,
      userAgent
    );
  }

  /**
   * Get audit logs for a specific entity
   */
  async getLogsForEntity(entity: string, entityId: string, limit: number = 50) {
    return await prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      include: {
        user: {
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
      take: limit,
    });
  }
}

