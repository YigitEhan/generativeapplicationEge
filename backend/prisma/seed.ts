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

  // Applicant Users
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
  console.log(`✅ Applicant: ${applicant.email} / applicant123`);

  const applicant2 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'John',
      lastName: 'Doe',
      role: 'APPLICANT',
      phone: '+1234567895',
      isActive: true,
    },
  });
  console.log(`✅ Applicant: ${applicant2.email} / password123`);

  const applicant3 = await prisma.user.upsert({
    where: { email: 'sarah.smith@example.com' },
    update: {},
    create: {
      email: 'sarah.smith@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Sarah',
      lastName: 'Smith',
      role: 'APPLICANT',
      phone: '+1234567896',
      isActive: true,
    },
  });
  console.log(`✅ Applicant: ${applicant3.email} / password123`);

  const applicant4 = await prisma.user.upsert({
    where: { email: 'mike.johnson@example.com' },
    update: {},
    create: {
      email: 'mike.johnson@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'APPLICANT',
      phone: '+1234567897',
      isActive: true,
    },
  });
  console.log(`✅ Applicant: ${applicant4.email} / password123\n`);

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

  const vacancyRequest3 = await prisma.vacancyRequest.create({
    data: {
      title: 'DevOps Engineer',
      description: 'DevOps engineer to manage infrastructure and CI/CD pipelines',
      departmentId: itDept.id,
      requestedBy: manager.id,
      status: 'APPROVED',
      justification: 'Need to improve deployment processes and infrastructure',
      numberOfPositions: 1,
      requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      experienceLevel: '4+ years',
      salaryRange: '$110,000 - $140,000',
      approvedAt: new Date(),
    },
  });

  const vacancyRequest4 = await prisma.vacancyRequest.create({
    data: {
      title: 'Marketing Manager',
      description: 'Marketing manager to lead digital marketing initiatives',
      departmentId: businessDept.id,
      requestedBy: manager.id,
      status: 'APPROVED',
      justification: 'Expanding marketing efforts for new product launch',
      numberOfPositions: 1,
      requiredSkills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
      experienceLevel: '5+ years',
      salaryRange: '$90,000 - $120,000',
      approvedAt: new Date(),
    },
  });

  console.log(`✅ Created ${4} vacancy requests\n`);

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

  const vacancy3 = await prisma.vacancy.create({
    data: {
      title: 'DevOps Engineer',
      description: 'Join our team as a DevOps Engineer to build and maintain our cloud infrastructure.',
      departmentId: itDept.id,
      vacancyRequestId: vacancyRequest3.id,
      createdById: recruiter.id,
      status: 'OPEN',
      location: 'Remote',
      employmentType: 'Full-time',
      salaryRange: '$110,000 - $140,000',
      requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
      responsibilities: 'Manage cloud infrastructure, implement CI/CD pipelines, monitor system performance',
      qualifications: 'BS in Computer Science or related field, 4+ years DevOps experience',
      benefits: 'Health insurance, 401k, remote work, learning budget',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      numberOfPositions: 1,
      publishedAt: new Date(),
    },
  });

  const vacancy4 = await prisma.vacancy.create({
    data: {
      title: 'Marketing Manager',
      description: 'Lead our digital marketing efforts and drive brand awareness.',
      departmentId: businessDept.id,
      vacancyRequestId: vacancyRequest4.id,
      createdById: recruiter.id,
      status: 'OPEN',
      location: 'San Francisco, CA',
      employmentType: 'Full-time',
      salaryRange: '$90,000 - $120,000',
      requiredSkills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Google Analytics', 'Social Media'],
      responsibilities: 'Develop marketing strategies, manage campaigns, analyze metrics, lead marketing team',
      qualifications: 'BA/BS in Marketing or related field, 5+ years marketing experience',
      benefits: 'Health insurance, PTO, stock options, gym membership',
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      numberOfPositions: 1,
      publishedAt: new Date(),
    },
  });

  const vacancy5 = await prisma.vacancy.create({
    data: {
      title: 'Frontend Developer',
      description: 'Build beautiful and responsive user interfaces with React.',
      departmentId: itDept.id,
      createdById: recruiter.id,
      status: 'OPEN',
      location: 'Remote',
      employmentType: 'Full-time',
      salaryRange: '$90,000 - $120,000',
      requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'Responsive Design'],
      responsibilities: 'Develop UI components, collaborate with designers, optimize performance',
      qualifications: 'BS in Computer Science or equivalent, 3+ years frontend experience',
      benefits: 'Health insurance, flexible hours, remote work',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      numberOfPositions: 2,
      publishedAt: new Date(),
    },
  });

  const vacancy6 = await prisma.vacancy.create({
    data: {
      title: 'Data Scientist',
      description: 'Analyze data and build machine learning models to drive business insights.',
      departmentId: itDept.id,
      createdById: recruiter.id,
      status: 'OPEN',
      location: 'Boston, MA',
      employmentType: 'Full-time',
      salaryRange: '$130,000 - $160,000',
      requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow'],
      responsibilities: 'Build ML models, analyze data, create visualizations, present findings',
      qualifications: 'MS/PhD in Data Science or related field, 4+ years experience',
      benefits: 'Health insurance, 401k, conference budget, stock options',
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      numberOfPositions: 1,
      publishedAt: new Date(),
    },
  });

  console.log(`✅ Created ${6} vacancies\n`);

  // ============================================
  // 5. CREATE CVs FOR APPLICANTS
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
      structuredData: {
        personalInfo: {
          name: 'Alice Applicant',
          email: 'applicant@recruitment.com',
          phone: '+1234567894',
        },
        experience: [
          {
            title: 'Senior Full Stack Developer',
            company: 'Tech Corp',
            duration: '2020-2024',
            description: 'Led development of React and Node.js applications',
          },
        ],
        education: [
          {
            degree: 'BS Computer Science',
            institution: 'MIT',
            year: '2020',
          },
        ],
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
      },
    },
  });

  const cv2 = await prisma.cV.create({
    data: {
      userId: applicant2.id,
      fileName: 'john_doe_cv.pdf',
      filePath: '/uploads/cv-sample-john.pdf',
      fileSize: 198765,
      mimeType: 'application/pdf',
      isDefault: true,
      structuredData: {
        personalInfo: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567895',
        },
        experience: [
          {
            title: 'DevOps Engineer',
            company: 'Cloud Solutions Inc',
            duration: '2019-2024',
            description: 'Managed AWS infrastructure and CI/CD pipelines',
          },
        ],
        education: [
          {
            degree: 'BS Information Systems',
            institution: 'Stanford',
            year: '2019',
          },
        ],
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins'],
      },
    },
  });

  const cv3 = await prisma.cV.create({
    data: {
      userId: applicant3.id,
      fileName: 'sarah_smith_cv.pdf',
      filePath: '/uploads/cv-sample-sarah.pdf',
      fileSize: 212345,
      mimeType: 'application/pdf',
      isDefault: true,
      structuredData: {
        personalInfo: {
          name: 'Sarah Smith',
          email: 'sarah.smith@example.com',
          phone: '+1234567896',
        },
        experience: [
          {
            title: 'Frontend Developer',
            company: 'Design Studio',
            duration: '2021-2024',
            description: 'Built responsive React applications',
          },
        ],
        education: [
          {
            degree: 'BS Web Development',
            institution: 'UC Berkeley',
            year: '2021',
          },
        ],
        skills: ['React', 'TypeScript', 'CSS', 'HTML', 'Figma'],
      },
    },
  });

  const cv4 = await prisma.cV.create({
    data: {
      userId: applicant4.id,
      fileName: 'mike_johnson_cv.pdf',
      filePath: '/uploads/cv-sample-mike.pdf',
      fileSize: 234567,
      mimeType: 'application/pdf',
      isDefault: true,
      structuredData: {
        personalInfo: {
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          phone: '+1234567897',
        },
        experience: [
          {
            title: 'Data Scientist',
            company: 'Analytics Pro',
            duration: '2018-2024',
            description: 'Built ML models for predictive analytics',
          },
        ],
        education: [
          {
            degree: 'PhD Data Science',
            institution: 'Carnegie Mellon',
            year: '2018',
          },
        ],
        skills: ['Python', 'TensorFlow', 'SQL', 'Statistics', 'R'],
      },
    },
  });

  console.log(`✅ Created ${4} CVs\n`);

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

  const motivationLetter2 = await prisma.motivationLetter.create({
    data: {
      userId: applicant2.id,
      content: 'I am very interested in the DevOps Engineer position. My 5 years of experience managing cloud infrastructure and implementing CI/CD pipelines makes me a perfect fit for this role.',
      vacancyId: vacancy3.id,
    },
  });

  const motivationLetter3 = await prisma.motivationLetter.create({
    data: {
      userId: applicant3.id,
      content: 'I would love to join your team as a Frontend Developer. My passion for creating beautiful user interfaces and 3 years of React experience align perfectly with this opportunity.',
      vacancyId: vacancy5.id,
    },
  });

  const motivationLetter4 = await prisma.motivationLetter.create({
    data: {
      userId: applicant4.id,
      content: 'I am excited to apply for the Data Scientist position. With a PhD in Data Science and 6 years of experience building ML models, I can bring significant value to your analytics team.',
      vacancyId: vacancy6.id,
    },
  });

  const motivationLetter5 = await prisma.motivationLetter.create({
    data: {
      userId: applicant.id,
      content: 'I am also interested in the Business Analyst role. My technical background combined with business acumen makes me uniquely qualified for this position.',
      vacancyId: vacancy2.id,
    },
  });

  console.log(`✅ Created ${5} motivation letters\n`);

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

  const application2 = await prisma.application.create({
    data: {
      vacancyId: vacancy3.id,
      applicantId: applicant2.id,
      cvId: cv2.id,
      motivationLetterId: motivationLetter2.id,
      status: 'INTERVIEW_R1',
      notes: 'Excellent DevOps background',
    },
  });

  const application3 = await prisma.application.create({
    data: {
      vacancyId: vacancy5.id,
      applicantId: applicant3.id,
      cvId: cv3.id,
      motivationLetterId: motivationLetter3.id,
      status: 'SHORTLISTED',
      notes: 'Good frontend skills',
    },
  });

  const application4 = await prisma.application.create({
    data: {
      vacancyId: vacancy6.id,
      applicantId: applicant4.id,
      cvId: cv4.id,
      motivationLetterId: motivationLetter4.id,
      status: 'HIRED',
      notes: 'Outstanding data science expertise',
    },
  });

  const application5 = await prisma.application.create({
    data: {
      vacancyId: vacancy2.id,
      applicantId: applicant.id,
      cvId: cv1.id,
      motivationLetterId: motivationLetter5.id,
      status: 'APPLIED',
      notes: 'Recently submitted',
    },
  });

  const application6 = await prisma.application.create({
    data: {
      vacancyId: vacancy1.id,
      applicantId: applicant2.id,
      cvId: cv2.id,
      status: 'REJECTED',
      notes: 'Not enough React experience',
    },
  });

  console.log(`✅ Created ${6} applications\n`);

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

  const evaluation2 = await prisma.evaluation.create({
    data: {
      applicationId: application2.id,
      evaluatorId: recruiter.id,
      rating: 9,
      comments: 'Outstanding DevOps knowledge and hands-on experience',
      strengths: 'Deep AWS expertise, strong automation skills',
      weaknesses: 'Could improve documentation practices',
      recommendation: 'Strong hire',
    },
  });

  const evaluation3 = await prisma.evaluation.create({
    data: {
      applicationId: application4.id,
      evaluatorId: recruiter.id,
      rating: 10,
      comments: 'Exceptional data science background with PhD',
      strengths: 'Advanced ML knowledge, published research, strong Python skills',
      weaknesses: 'None identified',
      recommendation: 'Immediate hire',
    },
  });

  console.log(`✅ Created ${3} evaluations\n`);

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
      applicationId: application1.id,
      vacancyId: vacancy1.id,
      title: 'Technical Interview - Round 1',
      description: 'First round technical interview focusing on coding skills',
      round: 1,
      scheduledById: recruiter.id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: 60,
      location: 'https://meet.google.com/abc-defg-hij',
      status: 'SCHEDULED',
      notes: 'Focus on React and Node.js experience',
    },
  });

  const interview2 = await prisma.interview.create({
    data: {
      applicationId: application2.id,
      vacancyId: vacancy3.id,
      title: 'DevOps Technical Interview',
      description: 'Technical interview for DevOps position',
      round: 1,
      scheduledById: recruiter.id,
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      duration: 90,
      location: 'https://zoom.us/j/123456789',
      status: 'SCHEDULED',
      notes: 'Discuss AWS and Kubernetes experience',
    },
  });

  const interview3 = await prisma.interview.create({
    data: {
      applicationId: application4.id,
      vacancyId: vacancy6.id,
      title: 'Data Science Interview - Final Round',
      description: 'Final round interview with leadership team',
      round: 2,
      scheduledById: recruiter.id,
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      duration: 120,
      location: 'Office - Conference Room A',
      status: 'SCHEDULED',
      notes: 'Present ML project case study',
    },
  });

  console.log(`✅ Created ${3} interviews\n`);

  // ============================================
  // 12. CREATE INTERVIEWER ASSIGNMENTS
  // ============================================
  console.log('📅 Creating interviewer assignments...');

  const interviewerAssignment1 = await prisma.interviewerAssignment.create({
    data: {
      interviewId: interview1.id,
      interviewerId: interviewer.id,
      attended: false,
    },
  });

  console.log(`✅ Created ${1} interviewer assignment\n`);

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

  await prisma.notification.create({
    data: {
      senderId: recruiter.id,
      receiverId: applicant2.id,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled',
      message: 'Your interview for DevOps Engineer has been scheduled.',
      isRead: false,
      metadata: {
        interviewId: interview2.id,
        scheduledAt: interview2.scheduledAt,
      },
    },
  });

  await prisma.notification.create({
    data: {
      senderId: recruiter.id,
      receiverId: applicant4.id,
      type: 'STATUS_UPDATE',
      title: 'Application Status Update',
      message: 'Your application for Data Scientist has been updated to: Hired',
      isRead: false,
      metadata: {
        applicationId: application4.id,
        status: 'HIRED',
      },
    },
  });

  await prisma.notification.create({
    data: {
      senderId: recruiter.id,
      receiverId: applicant.id,
      type: 'TEST_INVITATION',
      title: 'Test Invitation',
      message: 'You have been invited to take the technical assessment for Senior Full Stack Developer',
      isRead: false,
      metadata: {
        testId: test1.id,
        applicationId: application1.id,
      },
    },
  });

  console.log(`✅ Created ${6} notifications\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═══════════════════════════════════════');
  console.log('✅ Database seed completed successfully!');
  console.log('═══════════════════════════════════════\n');

  console.log('📊 Summary:');
  console.log('  • Departments: 3 (Business, IT, HR)');
  console.log('  • Users: 8 (1 admin, 1 manager, 1 recruiter, 1 interviewer, 4 applicants)');
  console.log('  • Vacancy Requests: 4');
  console.log('  • Vacancies: 6');
  console.log('  • CVs: 4');
  console.log('  • Motivation Letters: 5');
  console.log('  • Applications: 6');
  console.log('  • Evaluations: 3');
  console.log('  • Tests: 1');
  console.log('  • Test Attempts: 1');
  console.log('  • Interviews: 3');
  console.log('  • Interview Assignments: 1');
  console.log('  • Audit Logs: 2');
  console.log('  • Notifications: 6\n');

  console.log('🔑 Login Credentials:');
  console.log('  Admin:       admin@recruitment.com / admin123');
  console.log('  Manager:     manager@recruitment.com / manager123');
  console.log('  Recruiter:   recruiter@recruitment.com / recruiter123');
  console.log('  Interviewer: interviewer@recruitment.com / interviewer123');
  console.log('  Applicant 1: applicant@recruitment.com / applicant123');
  console.log('  Applicant 2: john.doe@example.com / password123');
  console.log('  Applicant 3: sarah.smith@example.com / password123');
  console.log('  Applicant 4: mike.johnson@example.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

