import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { StatusBadge } from '../../components/UI/StatusBadge';
import api from '../../lib/api';

interface Stats {
  totalVacancies: number;
  activeVacancies: number;
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
}

export const RecruiterDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalVacancies: 0,
    activeVacancies: 0,
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vacanciesRes, applicationsRes, interviewsRes] = await Promise.all([
        api.get('/vacancies'),
        api.get('/applications'),
        api.get('/interviews'),
      ]);

      const vacancies = vacanciesRes.data;
      const applications = applicationsRes.data;
      const interviews = interviewsRes.data;

      setStats({
        totalVacancies: vacancies.length,
        activeVacancies: vacancies.filter((v: any) => v.status === 'OPEN').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((a: any) => a.status === 'SUBMITTED').length,
        interviewsScheduled: interviews.filter((i: any) => i.status === 'SCHEDULED').length,
      });

      setRecentApplications(applications.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
        <p className="text-gray-600">Manage vacancies, applications, and interviews</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vacancies</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalVacancies}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Vacancies</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeVacancies}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Interviews</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.interviewsScheduled}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <Link to="/recruiter/applications">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No applications yet</p>
        ) : (
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <Link key={app.id} to={`/recruiter/applications/${app.id}`}>
                <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900">{app.applicant?.firstName} {app.applicant?.lastName}</h3>
                    <p className="text-sm text-gray-500">{app.vacancy?.title}</p>
                  </div>
                  <StatusBadge status={app.status} type="application" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default RecruiterDashboard;

