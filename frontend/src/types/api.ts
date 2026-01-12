// User & Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'RECRUITER' | 'INTERVIEWER' | 'APPLICANT';
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Vacancy Types
export interface Vacancy {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  salaryMin?: number;
  salaryMax?: number;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  deadline?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export interface VacancyRequest {
  id: string;
  title: string;
  description: string;
  department: string;
  justification: string;
  headcount: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  requestedBy: string;
  requestedByUser?: User;
  reviewedBy?: string;
  reviewedByUser?: User;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Application Types
export interface Application {
  id: string;
  vacancyId: string;
  vacancy?: Vacancy;
  applicantId: string;
  applicant?: User;
  status: 'APPLIED' | 'SCREENING' | 'TEST_INVITED' | 'TEST_COMPLETED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
  coverLetter?: string;
  notes?: string;
  cvId?: string;
  cv?: CV;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CV {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

// Test Types
export interface Test {
  id: string;
  vacancyId: string;
  title: string;
  description: string;
  type: 'QUIZ' | 'CODING' | 'EXTERNAL';
  duration?: number;
  passingScore?: number;
  questions?: Question[];
  externalLink?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  test?: Test;
  applicationId: string;
  application?: Application;
  candidateId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  startedAt?: string;
  completedAt?: string;
  score?: number;
  passed?: boolean;
  answers?: any;
}

// Interview Types
export interface Interview {
  id: string;
  applicationId: string;
  application?: Application;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  interviewers: InterviewerAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewerAssignment {
  id: string;
  interviewId: string;
  interviewerId: string;
  interviewer?: User;
  role?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  feedback?: string;
  rating?: number;
}

// Evaluation Types
export interface Evaluation {
  id: string;
  applicationId: string;
  application?: Application;
  evaluatorId: string;
  evaluator?: User;
  type: 'SCREENING' | 'TECHNICAL' | 'HR' | 'FINAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  score?: number;
  strengths?: string;
  weaknesses?: string;
  recommendation?: 'STRONG_HIRE' | 'HIRE' | 'MAYBE' | 'NO_HIRE' | 'STRONG_NO_HIRE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  senderId?: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  metadata?: any;
  createdAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

