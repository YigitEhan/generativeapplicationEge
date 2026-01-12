import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../../lib/api';
import type { Application } from '../../types/api';
import { Card } from '../../components/UI/Card';
import { StatusBadge } from '../../components/UI/StatusBadge';

export const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationsApi.getMine();
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>

      {applications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't applied to any positions yet.</p>
            <Link to="/vacancies" className="text-blue-600 hover:text-blue-700">Browse Open Positions →</Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <Link to={`/applicant/applications/${app.id}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{app.vacancy?.title}</h3>
                    <p className="text-sm text-gray-600">{app.vacancy?.department}</p>
                    <p className="text-xs text-gray-500 mt-2">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={app.status} type="application" />
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;

