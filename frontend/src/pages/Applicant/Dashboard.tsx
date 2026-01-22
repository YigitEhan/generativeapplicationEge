import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi, vacanciesApi } from '../../lib/api';
import type { Application, Vacancy } from '../../types/api';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { Button } from '../../components/UI/Button';

export const ApplicantDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, vacsRes] = await Promise.all([
        applicationsApi.getMine(),
        vacanciesApi.getPublic(),
      ]);
      const appsData = appsRes.data as any; const apps = appsData.data || appsData;
      const vacsData = vacsRes.data as any; const vacs = vacsData.data || vacsData;
      setApplications(Array.isArray(apps) ? apps : []);
      setVacancies(Array.isArray(vacs) ? vacs.slice(0, 3) : []); // Show only 3 latest
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setApplications([]);
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your application overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">
                {applications.filter(a => ['SCREENING', 'TEST_INVITED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offers</p>
              <p className="text-3xl font-bold text-gray-900">
                {applications.filter(a => a.status === 'HIRED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
          <Link to="/applicant/applications">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't applied to any positions yet.</p>
            <Link to="/applicant/vacancies">
              <Button>Browse Open Positions</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <Link key={app.id} to={`/applicant/applications/${app.id}`}>
                <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900">{app.vacancy?.title}</h3>
                    <p className="text-sm text-gray-500">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={app.status} type="application" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Open Positions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Open Positions</h2>
          <Link to="/applicant/vacancies">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        {vacancies.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No open positions at the moment.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {vacancies.map((vacancy) => (
              <Link key={vacancy.id} to={`/applicant/vacancies/${vacancy.id}`}>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-gray-900 mb-2">{vacancy.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {typeof vacancy.department === 'object' && vacancy.department
                      ? vacancy.department.name
                      : vacancy.department || 'N/A'}
                  </p>
                  <Button size="sm" fullWidth>View Details</Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;


