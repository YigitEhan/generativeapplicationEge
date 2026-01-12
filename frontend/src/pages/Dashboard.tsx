import { useEffect, useState } from 'react';
import api from '../lib/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [jobsRes, candidatesRes, applicationsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/candidates'),
        api.get('/applications'),
      ]);

      const jobs = jobsRes.data;
      const candidates = candidatesRes.data;
      const applications = applicationsRes.data;

      setStats({
        totalJobs: jobs.length,
        openJobs: jobs.filter((j: any) => j.status === 'OPEN').length,
        totalCandidates: candidates.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((a: any) => a.status === 'PENDING').length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Jobs</h3>
          <p className="stat-number">{stats.totalJobs}</p>
        </div>
        <div className="stat-card">
          <h3>Open Jobs</h3>
          <p className="stat-number">{stats.openJobs}</p>
        </div>
        <div className="stat-card">
          <h3>Total Candidates</h3>
          <p className="stat-number">{stats.totalCandidates}</p>
        </div>
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p className="stat-number">{stats.totalApplications}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Applications</h3>
          <p className="stat-number">{stats.pendingApplications}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

