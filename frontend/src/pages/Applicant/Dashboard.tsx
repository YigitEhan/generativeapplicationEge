import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi, vacanciesApi } from '../../lib/api';
import type { Application, Vacancy } from '../../types/api';
import { Card } from '../../components/UI/Card';
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
        vacanciesApi.getPublic({ }),
      ]);
      setApplications(appsRes.data);
      setVacancies(vacsRes.data.slice(0, 3)); // Show only 3 latest
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your application overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
            <p className="text-sm text-gray-600 mt-1">Total Applications</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {applications.filter(a => ['SCREENING', 'TEST_INVITED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">In Progress</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {applications.filter(a => a.status === 'HIRED').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Offers</p>
          </div>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card title="My Applications" actions={
        <Link to="/applicant/applications">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      }>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't applied to any positions yet.</p>
            <Link to="/vacancies">
              <Button>Browse Open Positions</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.slice(0, 5).map((app) => (
              <Link key={app.id} to={`/applicant/applications/${app.id}`}>
                <div className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.vacancy?.title}</h3>
                    <p className="text-sm text-gray-600">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={app.status} type="application" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Open Positions */}
      <Card title="Open Positions" actions={
        <Link to="/vacancies">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      }>
        {vacancies.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No open positions at the moment.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {vacancies.map((vacancy) => (
              <Link key={vacancy.id} to={`/vacancies/${vacancy.id}`}>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{vacancy.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{vacancy.department}</p>
                  <Button size="sm" fullWidth>View Details</Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApplicantDashboard;

