import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import api from '../../lib/api';

interface Interview {
  id: string;
  title: string;
  type: string;
  scheduledAt: string;
  location: string;
  status: string;
  applicationId: string;
  vacancyTitle: string;
}

export const Interviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      // Fetch all applications - now includes interviewAssignments in single query
      const response = await api.get('/applications/mine');
      const applications = response.data.data || response.data || [];

      const allInterviews: Interview[] = [];

      // Extract interviews directly from the applications data
      for (const app of applications) {
        if (app.interviewAssignments && Array.isArray(app.interviewAssignments)) {
          for (const assignment of app.interviewAssignments) {
            if (assignment.interview) {
              allInterviews.push({
                id: assignment.interview.id,
                title: assignment.interview.title || 'Interview',
                type: assignment.interview.type || 'ONSITE',
                scheduledAt: assignment.interview.scheduledAt,
                location: assignment.interview.location || 'TBD',
                status: assignment.interview.status || 'SCHEDULED',
                applicationId: app.id,
                vacancyTitle: app.vacancy?.title || 'Unknown Position',
              });
            }
          }
        }
      }

      // Sort by scheduled date
      allInterviews.sort((a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );

      setInterviews(allInterviews);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const now = new Date();
    const interviewDate = new Date(interview.scheduledAt);
    
    if (filter === 'upcoming') {
      return interviewDate > now && interview.status !== 'COMPLETED' && interview.status !== 'CANCELLED';
    }
    if (filter === 'completed') {
      return interview.status === 'COMPLETED';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
          <p className="text-gray-600">View your scheduled interviews</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {(['all', 'upcoming', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredInterviews.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No interviews found</p>
            <p className="text-sm text-gray-400 mt-2">
              Interviews will appear here once they are scheduled for your applications
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map((interview) => (
            <Card key={interview.id}>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{interview.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(interview.status)}`}>
                      {interview.status}
                    </span>
                  </div>
                  <p className="text-gray-600">For: {interview.vacancyTitle}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📅 {formatDate(interview.scheduledAt)}</span>
                    <span>📍 {interview.location}</span>
                    <span className="capitalize">🎯 {interview.type.toLowerCase().replace('_', ' ')}</span>
                  </div>
                </div>
                <Link
                  to={`/applicant/applications/${interview.applicationId}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Application →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Interviews;

