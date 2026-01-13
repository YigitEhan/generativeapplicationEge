import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'APPLICANT':
      return <Navigate to="/applicant/dashboard" replace />;
    case 'RECRUITER':
      return <Navigate to="/recruiter/dashboard" replace />;
    case 'MANAGER':
      return <Navigate to="/manager/dashboard" replace />;
    case 'INTERVIEWER':
      return <Navigate to="/interviewer/dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/recruiter/dashboard" replace />;
    default:
      return <Navigate to="/vacancies" replace />;
  }
};

