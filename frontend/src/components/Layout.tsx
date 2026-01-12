import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>Recruitment System</h2>
        </div>
        <div className="navbar-menu">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/jobs" className="nav-link">Jobs</Link>
          <Link to="/candidates" className="nav-link">Candidates</Link>
          <Link to="/applications" className="nav-link">Applications</Link>
        </div>
        <div className="navbar-user">
          <span>{user?.firstName} {user?.lastName}</span>
          <span className="badge badge-info">{user?.role}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

