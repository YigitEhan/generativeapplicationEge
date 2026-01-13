import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { StatusBadge } from '../../components/UI/StatusBadge';
import api from '../../lib/api';

interface Stats {
  upcomingInterviews: number;
  completedInterviews: number;
  pendingFeedback: number;
  totalInterviews: number;
}

export const InterviewerDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    upcomingInterviews: 0,
    completedInterviews: 0,
    pendingFeedback: 0,
    totalInterviews: 0,
  });
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const interviewsRes = await api.get('/interviewer/interviews');
      const interviews = interviewsRes.data;

      const now = new Date();
      const upcoming = interviews.filter((i: any) =>
        i.status === 'SCHEDULED' && new Date(i.scheduledAt) > now
      );
      const completed = interviews.filter((i: any) => i.status === 'COMPLETED');
      const pendingFeedback = interviews.filter((i: any) =>
        i.status === 'SCHEDULED' &&
        new Date(i.scheduledAt) < now &&
        !i.interviewers?.[0]?.completedAt
      );

      setStats({
        upcomingInterviews: upcoming.length,
        completedInterviews: completed.length,
        pendingFeedback: pendingFeedback.length,
        totalInterviews: interviews.length,
      });

      setUpcomingInterviews(upcoming.slice(0, 5));
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
        <h1 className="text-2xl font-bold text-gray-900">Interviewer Dashboard</h1>
        <p className="text-gray-600">Manage your interview schedule and feedback</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Interviews</p>
              <p className="text-3xl font-bold text-blue-600">{stats.upcomingInterviews}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Feedback</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingFeedback}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedInterviews}</p>
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
              <p className="text-sm font-medium text-gray-600">Total Interviews</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalInterviews}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Interviews */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
          <Link to="/interviewer/interviews">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        {upcomingInterviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No upcoming interviews scheduled</p>
        ) : (
          <div className="space-y-3">
            {upcomingInterviews.map((interview) => (
              <Link key={interview.id} to={`/interviewer/interviews/${interview.id}`}>
                <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {interview.application?.applicant?.firstName} {interview.application?.applicant?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{interview.application?.vacancy?.title}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(interview.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={interview.status} type="interview" />
                    {interview.location && (
                      <p className="text-xs text-gray-500 mt-1">{interview.location}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Pending Feedback Alert */}
      {stats.pendingFeedback > 0 && (
        <Card>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">Feedback Required</h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>You have {stats.pendingFeedback} interview{stats.pendingFeedback > 1 ? 's' : ''} awaiting your feedback.</p>
              </div>
              <div className="mt-4">
                <Link to="/interviewer/interviews?filter=pending">
                  <Button size="sm" variant="outline">
                    Submit Feedback
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InterviewerDashboard;

