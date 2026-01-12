import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Public Pages
import VacanciesList from './pages/Public/VacanciesList';
import VacancyDetail from './pages/Public/VacancyDetail';

// Lazy load other pages for code splitting
import { lazy, Suspense } from 'react';

const ApplicantDashboard = lazy(() => import('./pages/Applicant/Dashboard'));
const ApplicantApplications = lazy(() => import('./pages/Applicant/MyApplications'));
const ApplicantApply = lazy(() => import('./pages/Applicant/ApplyForm'));
const ApplicantApplicationDetail = lazy(() => import('./pages/Applicant/ApplicationDetail'));
const ApplicantTest = lazy(() => import('./pages/Applicant/TakeTest'));
const ApplicantProfile = lazy(() => import('./pages/Applicant/Profile'));

const RecruiterDashboard = lazy(() => import('./pages/Recruiter/Dashboard'));
const RecruiterVacancies = lazy(() => import('./pages/Recruiter/Vacancies'));
const RecruiterVacancyDetail = lazy(() => import('./pages/Recruiter/VacancyDetail'));
const RecruiterRequests = lazy(() => import('./pages/Recruiter/Requests'));
const RecruiterApplicationDetail = lazy(() => import('./pages/Recruiter/ApplicationDetail'));
const RecruiterInterviews = lazy(() => import('./pages/Recruiter/Interviews'));

const ManagerDashboard = lazy(() => import('./pages/Manager/Dashboard'));
const ManagerNewRequest = lazy(() => import('./pages/Manager/NewRequest'));
const ManagerApplicationDetail = lazy(() => import('./pages/Manager/ApplicationDetail'));

const InterviewerDashboard = lazy(() => import('./pages/Interviewer/Dashboard'));
const InterviewerInterviewDetail = lazy(() => import('./pages/Interviewer/InterviewDetail'));

const Notifications = lazy(() => import('./pages/Notifications'));

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vacancies" element={<VacanciesList />} />
            <Route path="/vacancies/:id" element={<VacancyDetail />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                {/* Applicant Routes */}
                <Route element={<ProtectedRoute allowedRoles={['APPLICANT']} />}>
                  <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
                  <Route path="/applicant/applications" element={<ApplicantApplications />} />
                  <Route path="/applicant/apply/:vacancyId" element={<ApplicantApply />} />
                  <Route path="/applicant/applications/:id" element={<ApplicantApplicationDetail />} />
                  <Route path="/applicant/test/:applicationId" element={<ApplicantTest />} />
                  <Route path="/applicant/profile" element={<ApplicantProfile />} />
                </Route>

                {/* Recruiter Routes */}
                <Route element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']} />}>
                  <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                  <Route path="/recruiter/vacancies" element={<RecruiterVacancies />} />
                  <Route path="/recruiter/vacancies/:id" element={<RecruiterVacancyDetail />} />
                  <Route path="/recruiter/requests" element={<RecruiterRequests />} />
                  <Route path="/recruiter/applications/:id" element={<RecruiterApplicationDetail />} />
                  <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
                </Route>

                {/* Manager Routes */}
                <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']} />}>
                  <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                  <Route path="/manager/requests/new" element={<ManagerNewRequest />} />
                  <Route path="/manager/applications/:id" element={<ManagerApplicationDetail />} />
                </Route>

                {/* Interviewer Routes */}
                <Route element={<ProtectedRoute allowedRoles={['INTERVIEWER', 'ADMIN']} />}>
                  <Route path="/interviewer/dashboard" element={<InterviewerDashboard />} />
                  <Route path="/interviewer/interviews/:id" element={<InterviewerInterviewDetail />} />
                </Route>

                {/* Shared Routes */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<ApplicantProfile />} />

                {/* Default redirect based on role */}
                <Route path="/" element={<Navigate to="/applicant/dashboard" replace />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
