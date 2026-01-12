/**
 * Email Templates
 * 
 * Each template has both HTML and plain text versions.
 * Templates use simple string interpolation for variables.
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface ApplicationReceivedData {
  applicantName: string;
  vacancyTitle: string;
  applicationId: string;
}

export interface TestInvitedData {
  applicantName: string;
  vacancyTitle: string;
  testType: string;
  deadline: string;
  testLink: string;
}

export interface InterviewScheduledData {
  applicantName: string;
  vacancyTitle: string;
  interviewTitle: string;
  scheduledAt: string;
  duration: number;
  location: string;
}

export interface InterviewRescheduledData {
  applicantName: string;
  vacancyTitle: string;
  interviewTitle: string;
  oldScheduledAt: string;
  newScheduledAt: string;
  reason: string;
}

export interface InterviewCancelledData {
  applicantName: string;
  vacancyTitle: string;
  interviewTitle: string;
  scheduledAt: string;
  reason: string;
}

export interface RejectedData {
  applicantName: string;
  vacancyTitle: string;
  reason?: string;
}

export interface HiredData {
  applicantName: string;
  vacancyTitle: string;
  startDate?: string;
}

export class EmailTemplates {
  /**
   * Application Received Template
   */
  static applicationReceived(data: ApplicationReceivedData): EmailTemplate {
    return {
      subject: `Application Received - ${data.vacancyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Received</h2>
          <p>Dear ${data.applicantName},</p>
          <p>Thank you for applying for the position of <strong>${data.vacancyTitle}</strong>.</p>
          <p>We have received your application and our recruitment team will review it shortly. You will be notified about the next steps in the process.</p>
          <p>Application ID: <code>${data.applicationId}</code></p>
          <br>
          <p>Best regards,<br>Recruitment Team</p>
        </div>
      `,
      text: `
Application Received

Dear ${data.applicantName},

Thank you for applying for the position of ${data.vacancyTitle}.

We have received your application and our recruitment team will review it shortly. You will be notified about the next steps in the process.

Application ID: ${data.applicationId}

Best regards,
Recruitment Team
      `.trim(),
    };
  }

  /**
   * Test Invited Template
   */
  static testInvited(data: TestInvitedData): EmailTemplate {
    return {
      subject: `Test Invitation - ${data.vacancyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Invitation</h2>
          <p>Dear ${data.applicantName},</p>
          <p>Congratulations! You have been invited to take the <strong>${data.testType}</strong> for the position of <strong>${data.vacancyTitle}</strong>.</p>
          <p><strong>Deadline:</strong> ${data.deadline}</p>
          <p>Please click the link below to access the test:</p>
          <p><a href="${data.testLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px;">Start Test</a></p>
          <p>Make sure you have a stable internet connection and allocate sufficient time to complete the test.</p>
          <br>
          <p>Good luck!<br>Recruitment Team</p>
        </div>
      `,
      text: `
Test Invitation

Dear ${data.applicantName},

Congratulations! You have been invited to take the ${data.testType} for the position of ${data.vacancyTitle}.

Deadline: ${data.deadline}

Please access the test using the following link:
${data.testLink}

Make sure you have a stable internet connection and allocate sufficient time to complete the test.

Good luck!
Recruitment Team
      `.trim(),
    };
  }

  /**
   * Interview Scheduled Template
   */
  static interviewScheduled(data: InterviewScheduledData): EmailTemplate {
    return {
      subject: `Interview Scheduled - ${data.vacancyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Interview Scheduled</h2>
          <p>Dear ${data.applicantName},</p>
          <p>Your interview for the position of <strong>${data.vacancyTitle}</strong> has been scheduled.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 8px 0;"><strong>Interview:</strong> ${data.interviewTitle}</p>
            <p style="margin: 8px 0;"><strong>Date & Time:</strong> ${data.scheduledAt}</p>
            <p style="margin: 8px 0;"><strong>Duration:</strong> ${data.duration} minutes</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${data.location}</p>
          </div>
          <p>Please make sure you are available at the scheduled time. If you need to reschedule, please contact us as soon as possible.</p>
          <br>
          <p>Best regards,<br>Recruitment Team</p>
        </div>
      `,
      text: `
Interview Scheduled

Dear ${data.applicantName},

Your interview for the position of ${data.vacancyTitle} has been scheduled.

Interview: ${data.interviewTitle}
Date & Time: ${data.scheduledAt}
Duration: ${data.duration} minutes
Location: ${data.location}

Please make sure you are available at the scheduled time. If you need to reschedule, please contact us as soon as possible.

Best regards,
Recruitment Team
      `.trim(),
    };
  }

  /**
   * Interview Rescheduled Template
   */
  static interviewRescheduled(data: InterviewRescheduledData): EmailTemplate {
    return {
      subject: `Interview Rescheduled - ${data.vacancyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Interview Rescheduled</h2>
          <p>Dear ${data.applicantName},</p>
          <p>Your interview for the position of <strong>${data.vacancyTitle}</strong> has been rescheduled.</p>
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 8px 0;"><strong>Interview:</strong> ${data.interviewTitle}</p>
            <p style="margin: 8px 0; text-decoration: line-through; color: #6b7280;"><strong>Previous Time:</strong> ${data.oldScheduledAt}</p>
            <p style="margin: 8px 0; color: #059669;"><strong>New Time:</strong> ${data.newScheduledAt}</p>
            <p style="margin: 8px 0;"><strong>Reason:</strong> ${data.reason}</p>
          </div>
          <p>We apologize for any inconvenience. Please confirm your availability for the new time.</p>
          <br>
          <p>Best regards,<br>Recruitment Team</p>
        </div>
      `,
      text: `
Interview Rescheduled

Dear ${data.applicantName},

Your interview for the position of ${data.vacancyTitle} has been rescheduled.

Interview: ${data.interviewTitle}
Previous Time: ${data.oldScheduledAt}
New Time: ${data.newScheduledAt}
Reason: ${data.reason}

We apologize for any inconvenience. Please confirm your availability for the new time.

Best regards,
Recruitment Team
      `.trim(),
    };
  }

  /**
   * Interview Cancelled Template
   */
  static interviewCancelled(data: InterviewCancelledData): EmailTemplate {
    return {
      subject: `Interview Cancelled - ${data.vacancyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Interview Cancelled</h2>
          <p>Dear ${data.applicantName},</p>
          <p>We regret to inform you that your interview for the position of <strong>${data.vacancyTitle}</strong> has been cancelled.</p>
          <div style="background-color: #fee2e2; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 8px 0;"><strong>Interview:</strong> ${data.interviewTitle}</p>
            <p style="margin: 8px 0;"><strong>Scheduled Time:</strong> ${data.scheduledAt}</p>
            <p style="margin: 8px 0;"><strong>Reason:</strong> ${data.reason}</p>
          </div>
          <p>We will contact you if there are any further opportunities.</p>
          <br>
          <p>Best regards,<br>Recruitment Team</p>
        </div>
      `,
      text: `
Interview Cancelled

Dear ${data.applicantName},

We regret to inform you that your interview for the position of ${data.vacancyTitle} has been cancelled.

Interview: ${data.interviewTitle}
Scheduled Time: ${data.scheduledAt}
Reason: ${data.reason}

We will contact you if there are any further opportunities.

Best regards,
Recruitment Team
      `.trim(),
    };
  }

  /**
   * Application Rejected Template
   */
  static rejected(data: RejectedData): EmailTemplate {
    return {
      subject: `Application Update - ${data.vacancyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b7280;">Application Update</h2>
          <p>Dear ${data.applicantName},</p>
          <p>Thank you for your interest in the position of <strong>${data.vacancyTitle}</strong> and for taking the time to apply.</p>
          <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
          ${data.reason ? `<p><strong>Feedback:</strong> ${data.reason}</p>` : ''}
          <p>We appreciate your interest in our organization and encourage you to apply for future positions that match your skills and experience.</p>
          <br>
          <p>Best regards,<br>Recruitment Team</p>
        </div>
      `,
      text: `
Application Update

Dear ${data.applicantName},

Thank you for your interest in the position of ${data.vacancyTitle} and for taking the time to apply.

After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.

${data.reason ? `Feedback: ${data.reason}` : ''}

We appreciate your interest in our organization and encourage you to apply for future positions that match your skills and experience.

Best regards,
Recruitment Team
      `.trim(),
    };
  }

  /**
   * Hired Template
   */
  static hired(data: HiredData): EmailTemplate {
    return {
      subject: `Congratulations! Job Offer - ${data.vacancyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Congratulations!</h2>
          <p>Dear ${data.applicantName},</p>
          <p>We are delighted to offer you the position of <strong>${data.vacancyTitle}</strong>!</p>
          <p>After reviewing your application and interview performance, we believe you will be a great addition to our team.</p>
          ${data.startDate ? `<p><strong>Proposed Start Date:</strong> ${data.startDate}</p>` : ''}
          <p>Our HR team will contact you shortly with the formal offer letter and next steps.</p>
          <p>We look forward to welcoming you to our organization!</p>
          <br>
          <p>Best regards,<br>Recruitment Team</p>
        </div>
      `,
      text: `
Congratulations!

Dear ${data.applicantName},

We are delighted to offer you the position of ${data.vacancyTitle}!

After reviewing your application and interview performance, we believe you will be a great addition to our team.

${data.startDate ? `Proposed Start Date: ${data.startDate}` : ''}

Our HR team will contact you shortly with the formal offer letter and next steps.

We look forward to welcoming you to our organization!

Best regards,
Recruitment Team
      `.trim(),
    };
  }
}


