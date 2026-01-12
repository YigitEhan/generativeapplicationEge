import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationsApi } from '../../lib/api';
import type { Application } from '../../types/api';
import { Card } from '../../components/UI/Card';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { Timeline } from '../../components/UI/Timeline';
import { Button } from '../../components/UI/Button';

export const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await applicationsApi.getById(id!);
      setApplication(response.data);
    } catch (error) {
      console.error('Failed to fetch application:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!application) {
    return <Card><p className="text-center text-gray-500 py-8">Application not found</p></Card>;
  }

  const timelineEvents = [
    { date: application.createdAt, title: 'Application Submitted', description: 'Your application was received' },
    ...(application.status !== 'APPLIED' ? [{ date: application.updatedAt, title: 'Status Updated', description: `Status changed to ${application.status}` }] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/applicant/applications" className="text-blue-600 hover:text-blue-700">
        ← Back to Applications
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{application.vacancy?.title}</h1>
          <p className="text-gray-600 mt-1">{application.vacancy?.department}</p>
        </div>
        <StatusBadge status={application.status} type="application" />
      </div>

      <Card title="Application Details">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
            <p className="text-gray-700 whitespace-pre-line">{application.coverLetter}</p>
          </div>
          
          {application.cv && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">CV</h3>
              <Button variant="outline" size="sm">Download CV</Button>
            </div>
          )}
        </div>
      </Card>

      <Card title="Application Timeline">
        <Timeline events={timelineEvents} />
      </Card>

      {application.status === 'TEST_INVITED' && (
        <Card>
          <div className="text-center py-6">
            <p className="text-lg font-semibold text-gray-900 mb-4">You've been invited to take a test!</p>
            <Link to={`/applicant/test/${application.id}`}>
              <Button>Take Test</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ApplicationDetail;

