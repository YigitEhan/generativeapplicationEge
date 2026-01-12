export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'RECRUITER' | 'HIRING_MANAGER';
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
  salary?: string;
  requirements?: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumePath?: string;
  skills: string[];
  experience?: number;
  education?: string;
  linkedIn?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export interface Application {
  id: string;
  jobId: string;
  job?: Job;
  candidateId: string;
  candidate?: Candidate;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'OFFERED' | 'ACCEPTED' | 'REJECTED';
  coverLetter?: string;
  notes?: string;
  reviewedById?: string;
  reviewedBy?: User;
  appliedAt: string;
  updatedAt: string;
}

