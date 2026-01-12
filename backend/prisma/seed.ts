import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // 1. CREATE DEPARTMENTS
  // ============================================
  console.log('📁 Creating departments...');

  const businessDept = await prisma.department.upsert({
    where: { name: 'Business' },
    update: {},
    create: {
      name: 'Business',
      description: 'Business Development and Strategy',
      isActive: true,
    },
  });

  const itDept = await prisma.department.upsert({
    where: { name: 'IT' },
    update: {},
    create: {
      name: 'IT',
      description: 'Information Technology and Engineering',
      isActive: true,
    },
  });

  const hrDept = await prisma.department.upsert({
    where: { name: 'HR' },
    update: {},
    create: {
      name: 'HR',
      description: 'Human Resources',
      isActive: true,
    },
  });

  console.log(`✅ Created departments: ${businessDept.name}, ${itDept.name}, ${hrDept.name}\n`);

  // ============================================
  // 2. CREATE USERS WITH DIFFERENT ROLES
  // ============================================
  console.log('👥 Creating users...');

  // Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@recruitment.com' },
    update: {},
    create: {
      email: 'admin@recruitment.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1234567890',
      isActive: true,
    },
  });
  console.log(`✅ Admin: ${admin.email} / admin123`);

  // Manager User
  const manager = await prisma.user.upsert({
    where: { email: 'manager@recruitment.com' },
    update: {},
    create: {
      email: 'manager@recruitment.com',
      password: await bcrypt.hash('manager123', 10),
      firstName: 'Michael',
      lastName: 'Manager',
      role: 'MANAGER',
      phone: '+1234567891',
      isActive: true,
    },
  });
  console.log(`✅ Manager: ${manager.email} / manager123`);

  // Recruiter User
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@recruitment.com' },
    update: {},
    create: {
      email: 'recruiter@recruitment.com',
      password: await bcrypt.hash('recruiter123', 10),
      firstName: 'Rachel',
      lastName: 'Recruiter',
      role: 'RECRUITER',
      phone: '+1234567892',
      isActive: true,
    },
  });
  console.log(`✅ Recruiter: ${recruiter.email} / recruiter123`);

  // Interviewer User
  const interviewer = await prisma.user.upsert({
    where: { email: 'interviewer@recruitment.com' },
    update: {},
    create: {
      email: 'interviewer@recruitment.com',
      password: await bcrypt.hash('interviewer123', 10),
      firstName: 'Ian',
      lastName: 'Interviewer',
      role: 'INTERVIEWER',
      phone: '+1234567893',
      isActive: true,
    },
  });
  console.log(`✅ Interviewer: ${interviewer.email} / interviewer123`);

  // Applicant User
  const applicant = await prisma.user.upsert({
    where: { email: 'applicant@recruitment.com' },
    update: {},
    create: {
      email: 'applicant@recruitment.com',
      password: await bcrypt.hash('applicant123', 10),
      firstName: 'Alice',
      lastName: 'Applicant',
      role: 'APPLICANT',
      phone: '+1234567894',
      isActive: true,
    },
  });
  console.log(`✅ Applicant: ${applicant.email} / applicant123\n`);

  // ============================================
  // 3. CREATE VACANCY REQUESTS
  // ============================================
  console.log('📝 Creating vacancy requests...');

  const vacancyRequest1 = await prisma.vacancyRequest.create({
    data: {
      title: 'Senior Full Stack Developer',
      description: 'Need an experienced full stack developer for our new project',
      departmentId: itDept.id,
      requestedBy: manager.id,
      status: 'APPROVED',
      justification: 'Critical role for upcoming product launch',
      numberOfPositions: 2,
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      experienceLevel: '5+ years',
      salaryRange: '$120,000 - $150,000',
      approvedAt: new Date(),
    },
  });

  const vacancyRequest2 = await prisma.vacancyRequest.create({
    data: {
      title: 'HR Specialist',
      description: 'HR specialist to support recruitment and employee relations',
      departmentId: hrDept.id,
      requestedBy: manager.id,
      status: 'PENDING',
      justification: 'Growing team needs dedicated HR support',
      numberOfPositions: 1,
      requiredSkills: ['Recruitment', 'Employee Relations', 'HRIS'],
      experienceLevel: '3+ years',
      salaryRange: '$60,000 - $80,000',
    },
  });

  console.log(`✅ Created ${2} vacancy requests\n`);

  // ============================================
  // 4. CREATE VACANCIES
  // ============================================
  console.log('💼 Creating vacancies...');

  const vacancy1 = await prisma.vacancy.create({
    data: {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced full stack developer to join our growing team.',
      departmentId: itDept.id,
      vacancyRequestId: vacancyRequest1.id,
      createdById: recruiter.id,
      status: 'OPEN',
      location: 'Remote',
      employmentType: 'Full-time',
      salaryRange: '$120,000 - $150,000',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs'],
      responsibilities: 'Design and develop full stack applications, mentor junior developers, participate in code reviews',
      qualifications: 'BS in Computer Science or equivalent, 5+ years experience',
      benefits: 'Health insurance, 401k, flexible hours, remote work',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      numberOfPositions: 2,
      publishedAt: new Date(),
    },
  });

  const vacancy2 = await prisma.vacancy.create({
    data: {
      title: 'Business Analyst',
      description: 'Seeking a business analyst to bridge the gap between business and technology.',
      departmentId: businessDept.id,
      createdById: recruiter.id,
      status: 'OPEN',
      location: 'New York, NY',
      employmentType: 'Full-time',
      salaryRange: '$80,000 - $100,000',
      requiredSkills: ['Business Analysis', 'SQL', 'Data Visualization', 'Agile'],
      responsibilities: 'Gather requirements, create documentation, analyze business processes',
      qualifications: 'BA/BS degree, 3+ years experience in business analysis',
      benefits: 'Health insurance, PTO, professional development',
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      numberOfPositions: 1,
      publishedAt: new Date(),
    },
  });

  console.log(`✅ Created ${2} vacancies\n`);

  // ============================================
  // 5. CREATE CVs FOR APPLICANT
  // ============================================
  console.log('📄 Creating CVs...');

  const cv1 = await prisma.cV.create({
    data: {
      userId: applicant.id,
      fileName: 'alice_applicant_cv.pdf',
      filePath: '/uploads/cv-sample-alice.pdf',
      fileSize: 245678,
      mimeType: 'application/pdf',
      isDefault: true,
    },
  });

  console.log(`✅ Created CV for ${applicant.firstName}\n`);

  // ============================================
  // 6. CREATE MOTIVATION LETTERS
  // ============================================
  console.log('✉️ Creating motivation letters...');

  const motivationLetter1 = await prisma.motivationLetter.create({
    data: {
      userId: applicant.id,
      content: 'I am writing to express my strong interest in the Senior Full Stack Developer position. With over 5 years of experience in full stack development, I have developed expertise in React, Node.js, and TypeScript. I am excited about the opportunity to contribute to your team and help build innovative solutions.',
      vacancyId: vacancy1.id,
    },
  });

  console.log(`✅ Created motivation letter\n`);

  // ============================================
  // 7. CREATE APPLICATIONS
  // ============================================
  console.log('📋 Creating applications...');

  const application1 = await prisma.application.create({
    data: {
      vacancyId: vacancy1.id,
      applicantId: applicant.id,
      cvId: cv1.id,
      motivationLetterId: motivationLetter1.id,
      status: 'UNDER_REVIEW',
      notes: 'Strong candidate with relevant experience',
    },
  });

  console.log(`✅ Created ${1} application\n`);

  // ============================================
  // 8. CREATE EVALUATIONS
  // ============================================
  console.log('⭐ Creating evaluations...');

  const evaluation1 = await prisma.evaluation.create({
    data: {
      applicationId: application1.id,
      evaluatorId: recruiter.id,
      rating: 8,
      comments: 'Excellent technical skills and good communication',
      strengths: 'Strong React and Node.js experience, good problem-solving skills',
      weaknesses: 'Limited experience with microservices architecture',
      recommendation: 'Proceed to technical test',
    },
  });

  console.log(`✅ Created ${1} evaluation\n`);

  // ============================================
  // 9. CREATE TESTS
  // ============================================
  console.log('📝 Creating tests...');

  const test1 = await prisma.test.create({
    data: {
      vacancyId: vacancy1.id,
      createdById: recruiter.id,
      title: 'Full Stack Developer Technical Assessment',
      description: 'Assessment covering React, Node.js, and database concepts',
      duration: 90,
      passingScore: 70,
      totalScore: 100,
      instructions: 'Complete all questions within the time limit. You may use online resources but not communicate with others.',
      isActive: true,
    },
  });

  console.log(`✅ Created ${1} test\n`);

  // ============================================
  // 10. CREATE TEST ATTEMPTS
  // ============================================
  console.log('✍️ Creating test attempts...');

  const testAttempt1 = await prisma.testAttempt.create({
    data: {
      testId: test1.id,
      applicationId: application1.id,
      candidateId: applicant.id,
      score: 85,
      isPassed: true,
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      answers: {
        question1: 'Answer to question 1',
        question2: 'Answer to question 2',
      },
      feedback: 'Good performance on technical questions',
    },
  });

  console.log(`✅ Created ${1} test attempt\n`);

  // ============================================
  // 11. CREATE INTERVIEWS
  // ============================================
  console.log('🎤 Creating interviews...');

  const interview1 = await prisma.interview.create({
    data: {
      vacancyId: vacancy1.id,
      title: 'Technical Interview - Round 1',
      description: 'First round technical interview focusing on coding skills',
      round: 1,
      interviewerId: interviewer.id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: 60,
      location: 'https://meet.google.com/abc-defg-hij',
      status: 'SCHEDULED',
      notes: 'Focus on React and Node.js experience',
    },
  });

  console.log(`✅ Created ${1} interview\n`);

  // ============================================
  // 12. CREATE INTERVIEW ASSIGNMENTS
  // ============================================
  console.log('📅 Creating interview assignments...');

  const interviewAssignment1 = await prisma.interviewAssignment.create({
    data: {
      interviewId: interview1.id,
      applicationId: application1.id,
      assignedById: recruiter.id,
      attended: false,
    },
  });

  console.log(`✅ Created ${1} interview assignment\n`);

  // ============================================
  // 13. CREATE AUDIT LOGS
  // ============================================
  console.log('📊 Creating audit logs...');

  await prisma.auditLog.create({
    data: {
      userId: recruiter.id,
      action: 'CREATE',
      entity: 'Vacancy',
      entityId: vacancy1.id,
      changes: {
        title: vacancy1.title,
        status: vacancy1.status,
      },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: applicant.id,
      action: 'CREATE',
      entity: 'Application',
      entityId: application1.id,
      changes: {
        vacancyId: vacancy1.id,
        status: 'APPLIED',
      },
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0',
    },
  });

  console.log(`✅ Created ${2} audit logs\n`);

  // ============================================
  // 14. CREATE NOTIFICATIONS
  // ============================================
  console.log('🔔 Creating notifications...');

  await prisma.notification.create({
    data: {
      senderId: recruiter.id,
      receiverId: applicant.id,
      type: 'APPLICATION_RECEIVED',
      title: 'Application Received',
      message: 'Your application for Senior Full Stack Developer has been received and is under review.',
      isRead: false,
      metadata: {
        vacancyId: vacancy1.id,
        applicationId: application1.id,
      },
    },
  });

  await prisma.notification.create({
    data: {
      senderId: recruiter.id,
      receiverId: applicant.id,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled',
      message: 'Your interview for Senior Full Stack Developer has been scheduled.',
      isRead: false,
      metadata: {
        interviewId: interview1.id,
        scheduledAt: interview1.scheduledAt,
      },
    },
  });

  await prisma.notification.create({
    data: {
      senderId: applicant.id,
      receiverId: recruiter.id,
      type: 'APPLICATION_SUBMITTED',
      title: 'New Application',
      message: `${applicant.firstName} ${applicant.lastName} has applied for ${vacancy1.title}`,
      isRead: true,
      readAt: new Date(),
      metadata: {
        applicationId: application1.id,
      },
    },
  });

  console.log(`✅ Created ${3} notifications\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═══════════════════════════════════════');
  console.log('✅ Database seed completed successfully!');
  console.log('═══════════════════════════════════════\n');

  console.log('📊 Summary:');
  console.log('  • Departments: 3 (Business, IT, HR)');
  console.log('  • Users: 5 (1 admin, 1 manager, 1 recruiter, 1 interviewer, 1 applicant)');
  console.log('  • Vacancy Requests: 2');
  console.log('  • Vacancies: 2');
  console.log('  • Applications: 1');
  console.log('  • Evaluations: 1');
  console.log('  • Tests: 1');
  console.log('  • Test Attempts: 1');
  console.log('  • Interviews: 1');
  console.log('  • Interview Assignments: 1');
  console.log('  • Audit Logs: 2');
  console.log('  • Notifications: 3\n');

  console.log('🔑 Login Credentials:');
  console.log('  Admin:       admin@recruitment.com / admin123');
  console.log('  Manager:     manager@recruitment.com / manager123');
  console.log('  Recruiter:   recruiter@recruitment.com / recruiter123');
  console.log('  Interviewer: interviewer@recruitment.com / interviewer123');
  console.log('  Applicant:   applicant@recruitment.com / applicant123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

