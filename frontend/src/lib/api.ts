import axios from 'axios';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Vacancy,
  VacancyRequest,
  Application,
  Test,
  TestAttempt,
  Interview,
  Evaluation,
  Notification,
} from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// Auth API
// ============================================
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  me: () =>
    api.get<User>('/auth/me'),
};

// ============================================
// Vacancies API
// ============================================
export const vacanciesApi = {
  getAll: (params?: { status?: string; department?: string }) =>
    api.get<Vacancy[]>('/vacancies', { params }),

  getPublic: (params?: { department?: string; employmentType?: string }) =>
    api.get<Vacancy[]>('/vacancies/public', { params }),

  getById: (id: string) =>
    api.get<Vacancy>(`/vacancies/${id}`),

  create: (data: Partial<Vacancy>) =>
    api.post<Vacancy>('/vacancies', data),

  update: (id: string, data: Partial<Vacancy>) =>
    api.put<Vacancy>(`/vacancies/${id}`, data),

  publish: (id: string) =>
    api.post<Vacancy>(`/vacancies/${id}/publish`),

  close: (id: string) =>
    api.post<Vacancy>(`/vacancies/${id}/close`),

  delete: (id: string) =>
    api.delete(`/vacancies/${id}`),
};

// ============================================
// Vacancy Requests API
// ============================================
export const vacancyRequestsApi = {
  getAll: (params?: { status?: string; department?: string }) =>
    api.get<VacancyRequest[]>('/vacancy-requests', { params }),

  getById: (id: string) =>
    api.get<VacancyRequest>(`/vacancy-requests/${id}`),

  create: (data: Partial<VacancyRequest>) =>
    api.post<VacancyRequest>('/vacancy-requests', data),

  update: (id: string, data: Partial<VacancyRequest>) =>
    api.put<VacancyRequest>(`/vacancy-requests/${id}`, data),

  approve: (id: string, notes?: string) =>
    api.post<VacancyRequest>(`/vacancy-requests/${id}/approve`, { notes }),

  decline: (id: string, notes: string) =>
    api.post<VacancyRequest>(`/vacancy-requests/${id}/decline`, { notes }),
};

// ============================================
// Applications API
// ============================================
export const applicationsApi = {
  getAll: (params?: { vacancyId?: string; status?: string }) =>
    api.get<Application[]>('/applications', { params }),

  getMine: () =>
    api.get<Application[]>('/applications/mine'),

  getById: (id: string) =>
    api.get<Application>(`/applications/${id}`),

  apply: (vacancyId: string, data: FormData) =>
    api.post<Application>(`/vacancies/${vacancyId}/apply`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateStatus: (id: string, status: string, notes?: string) =>
    api.put<Application>(`/applications/${id}/status`, { status, notes }),

  withdraw: (id: string) =>
    api.post<Application>(`/applications/${id}/withdraw`),

  downloadCV: (cvId: string) =>
    api.get(`/applications/cv/${cvId}/download`, { responseType: 'blob' }),
};

// ============================================
// Tests API
// ============================================
export const testsApi = {
  getByVacancy: (vacancyId: string) =>
    api.get<Test[]>(`/vacancies/${vacancyId}/tests`),

  getById: (id: string) =>
    api.get<Test>(`/tests/${id}`),

  create: (data: Partial<Test>) =>
    api.post<Test>('/tests', data),

  update: (id: string, data: Partial<Test>) =>
    api.put<Test>(`/tests/${id}`, data),

  delete: (id: string) =>
    api.delete(`/tests/${id}`),

  inviteToTest: (applicationId: string, testId: string) =>
    api.post(`/applications/${applicationId}/invite-test`, { testId }),

  getAttempt: (applicationId: string) =>
    api.get<TestAttempt>(`/applications/${applicationId}/test`),

  submitQuiz: (applicationId: string, answers: any) =>
    api.post<TestAttempt>(`/applications/${applicationId}/test/submit`, { answers }),

  markExternalComplete: (applicationId: string, score: number, passed: boolean) =>
    api.post<TestAttempt>(`/applications/${applicationId}/test/mark-complete`, { score, passed }),
};

// ============================================
// Interviews API
// ============================================
export const interviewsApi = {
  getAll: (params?: { applicationId?: string; interviewerId?: string }) =>
    api.get<Interview[]>('/interviews', { params }),

  getById: (id: string) =>
    api.get<Interview>(`/interviews/${id}`),

  schedule: (data: Partial<Interview>) =>
    api.post<Interview>('/interviews', data),

  reschedule: (id: string, scheduledAt: string, duration: number) =>
    api.put<Interview>(`/interviews/${id}/reschedule`, { scheduledAt, duration }),

  cancel: (id: string, reason?: string) =>
    api.post<Interview>(`/interviews/${id}/cancel`, { reason }),

  assignInterviewer: (id: string, interviewerId: string, role?: string) =>
    api.post(`/interviews/${id}/assign`, { interviewerId, role }),

  removeInterviewer: (id: string, interviewerId: string) =>
    api.delete(`/interviews/${id}/interviewers/${interviewerId}`),

  complete: (id: string) =>
    api.post<Interview>(`/interviews/${id}/complete`),

  submitFeedback: (id: string, feedback: string, rating: number) =>
    api.post(`/interviews/${id}/feedback`, { feedback, rating }),
};

// ============================================
// Evaluations API
// ============================================
export const evaluationsApi = {
  getByApplication: (applicationId: string) =>
    api.get<Evaluation[]>(`/applications/${applicationId}/evaluations`),

  getById: (id: string) =>
    api.get<Evaluation>(`/evaluations/${id}`),

  create: (data: Partial<Evaluation>) =>
    api.post<Evaluation>('/evaluations', data),

  update: (id: string, data: Partial<Evaluation>) =>
    api.put<Evaluation>(`/evaluations/${id}`, data),

  submit: (id: string) =>
    api.post<Evaluation>(`/evaluations/${id}/submit`),
};

// ============================================
// Notifications API
// ============================================
export const notificationsApi = {
  getMine: (params?: { isRead?: boolean; type?: string; limit?: number; offset?: number }) =>
    api.get<{ notifications: Notification[]; total: number; unreadCount: number }>('/notifications/mine', { params }),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    api.post<Notification>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.post<{ count: number }>('/notifications/read-all'),
};

export default api;
