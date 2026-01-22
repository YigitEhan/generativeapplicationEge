import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { RoleBasedRedirect } from './components/RoleBasedRedirect';

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
const ApplicantInterviews = lazy(() => import('./pages/Applicant/Interviews'));
const ApplicantVacancyDetail = lazy(() => import('./pages/Applicant/VacancyDetail'));

const RecruiterDashboard = lazy(() => import('./pages/Recruiter/Dashboard'));
const RecruiterVacancies = lazy(() => import('./pages/Recruiter/Vacancies'));
const RecruiterVacancyDetail = lazy(() => import('./pages/Recruiter/VacancyDetail'));
const RecruiterRequests = lazy(() => import('./pages/Recruiter/Requests'));
const RecruiterApplicationsList = lazy(() => import('./pages/Recruiter/ApplicationsList'));
const RecruiterApplicationDetail = lazy(() => import('./pages/Recruiter/ApplicationDetail'));
const RecruiterInterviews = lazy(() => import('./pages/Recruiter/Interviews'));

const ManagerDashboard = lazy(() => import('./pages/Manager/Dashboard'));
const ManagerNewRequest = lazy(() => import('./pages/Manager/NewRequest'));
const ManagerApplicationDetail = lazy(() => import('./pages/Manager/ApplicationDetail'));
const ManagerRequestsList = lazy(() => import('./pages/Manager/RequestsList'));
const ManagerVacanciesList = lazy(() => import('./pages/Manager/VacanciesList'));

const InterviewerDashboard = lazy(() => import('./pages/Interviewer/Dashboard'));
const InterviewerInterviewDetail = lazy(() => import('./pages/Interviewer/InterviewDetail'));
const InterviewerInterviewsList = lazy(() => import('./pages/Interviewer/InterviewsList'));

const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));

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

            {/* Protected Routes with Layout */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              {/* Root redirect based on role */}
              <Route index element={<RoleBasedRedirect />} />

              {/* Applicant Routes */}
              <Route path="applicant/dashboard" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantDashboard /></ProtectedRoute>} />
              <Route path="applicant/applications" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantApplications /></ProtectedRoute>} />
              <Route path="applicant/vacancies" element={<ProtectedRoute allowedRoles={['APPLICANT']}><VacanciesList /></ProtectedRoute>} />
              <Route path="applicant/vacancies/:id" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantVacancyDetail /></ProtectedRoute>} />
              <Route path="applicant/apply/:vacancyId" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantApply /></ProtectedRoute>} />
              <Route path="applicant/applications/:id" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantApplicationDetail /></ProtectedRoute>} />
              <Route path="applicant/test/:applicationId" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantTest /></ProtectedRoute>} />
              <Route path="applicant/interviews" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantInterviews /></ProtectedRoute>} />
              <Route path="applicant/profile" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantProfile /></ProtectedRoute>} />

              {/* Recruiter Routes */}
              <Route path="recruiter/dashboard" element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}><RecruiterDashboard /></ProtectedRoute>} />
              <Route path="recruiter/vacancies" element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}><RecruiterVacancies /></ProtectedRoute>} />
              <Route path="recruiter/vacancies/:id" element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}><RecruiterVacancyDetail /></ProtectedRoute>} />
              <Route path="recruiter/requests" element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}><RecruiterRequests /></ProtectedRoute>} />
              <Route path="recruiter/applications" element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}><RecruiterApplicationsList /></ProtectedRoute>} />
              <Route path="recruiter/applications/:id" element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}><RecruiterApplicationDetail /></ProtectedRoute>} />
              <Route path="recruiter/interviews" element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}><RecruiterInterviews /></ProtectedRoute>} />

              {/* Manager Routes */}
              <Route path="manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerDashboard /></ProtectedRoute>} />
              <Route path="manager/requests" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerRequestsList /></ProtectedRoute>} />
              <Route path="manager/requests/new" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerNewRequest /></ProtectedRoute>} />
              <Route path="manager/vacancies" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerVacanciesList /></ProtectedRoute>} />
              <Route path="manager/applications/:id" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><ManagerApplicationDetail /></ProtectedRoute>} />

              {/* Interviewer Routes */}
              <Route path="interviewer/dashboard" element={<ProtectedRoute allowedRoles={['INTERVIEWER', 'ADMIN']}><InterviewerDashboard /></ProtectedRoute>} />
              <Route path="interviewer/interviews" element={<ProtectedRoute allowedRoles={['INTERVIEWER', 'ADMIN']}><InterviewerInterviewsList /></ProtectedRoute>} />
              <Route path="interviewer/interviews/:id" element={<ProtectedRoute allowedRoles={['INTERVIEWER', 'ADMIN']}><InterviewerInterviewDetail /></ProtectedRoute>} />

              {/* Shared Routes */}
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Unauthorized */}
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
                  <p className="text-xl text-gray-600 mb-8">You don't have permission to access this page</p>
                  <a href="/" className="text-blue-600 hover:text-blue-800">Go to Dashboard</a>
                </div>
              </div>
            } />

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <a href="/vacancies" className="text-blue-600 hover:text-blue-800">View Vacancies</a>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
