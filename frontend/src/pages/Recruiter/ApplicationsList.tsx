import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { StatusBadge } from '../../components/UI/StatusBadge';
import api from '../../lib/api';

export const ApplicationsList = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'under_review' | 'interview'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      // Handle paginated response
      const data = response.data.data || response.data;
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    if (filter === 'submitted') return app.status === 'SUBMITTED';
    if (filter === 'under_review') return app.status === 'UNDER_REVIEW' || app.status === 'SCREENING';
    if (filter === 'interview') return app.status === 'INTERVIEW_SCHEDULED';
    return true;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600">Review and manage candidate applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium ${filter === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          All ({applications.length})
        </button>
        <button
          onClick={() => setFilter('submitted')}
          className={`px-4 py-2 font-medium ${filter === 'submitted' ? 'border-b-2 border-yellow-600 text-yellow-600' : 'text-gray-600'}`}
        >
          New Submissions
        </button>
        <button
          onClick={() => setFilter('under_review')}
          className={`px-4 py-2 font-medium ${filter === 'under_review' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
        >
          Under Review
        </button>
        <button
          onClick={() => setFilter('interview')}
          className={`px-4 py-2 font-medium ${filter === 'interview' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
        >
          Interview Stage
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No applications found</p>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app.applicant?.firstName} {app.applicant?.lastName}
                    </h3>
                    <StatusBadge status={app.status} type="application" />
                  </div>
                  
                  <p className="text-gray-700 font-medium mb-1">{app.vacancy?.title}</p>
                  <p className="text-sm text-gray-500 mb-2">{app.vacancy?.department?.name}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {app.applicant?.email}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {app.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">{app.notes}</p>
                  )}
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  <Link to={`/recruiter/applications/${app.id}`}>
                    <Button size="sm">Review</Button>
                  </Link>
                  {app.cv && (
                    <Button size="sm" variant="outline">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      CV
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationsList;

