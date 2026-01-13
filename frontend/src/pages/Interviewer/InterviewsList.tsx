import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { StatusBadge } from '../../components/UI/StatusBadge';
import api from '../../lib/api';

export const InterviewsList = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await api.get('/interviewer/interviews');
      setInterviews(response.data);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const now = new Date();
    const scheduledAt = new Date(interview.scheduledAt);
    const isPending = scheduledAt < now && !interview.interviewers?.[0]?.completedAt;
    const isUpcoming = scheduledAt > now && interview.status === 'SCHEDULED';
    const isCompleted = interview.status === 'COMPLETED';

    if (filter === 'upcoming') return isUpcoming;
    if (filter === 'pending') return isPending;
    if (filter === 'completed') return isCompleted;
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
        <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
        <p className="text-gray-600">Manage your interview schedule</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium ${filter === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          All ({interviews.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 font-medium ${filter === 'upcoming' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium ${filter === 'pending' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600'}`}
        >
          Pending Feedback
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 font-medium ${filter === 'completed' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
        >
          Completed
        </button>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {filteredInterviews.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No interviews found</p>
          </Card>
        ) : (
          filteredInterviews.map((interview) => (
            <Card key={interview.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {interview.application?.applicant?.firstName} {interview.application?.applicant?.lastName}
                    </h3>
                    <StatusBadge status={interview.status} type="interview" />
                  </div>
                  
                  <p className="text-gray-700 font-medium mb-1">{interview.application?.vacancy?.title}</p>
                  <p className="text-sm text-gray-500 mb-2">{interview.application?.vacancy?.department?.name}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(interview.scheduledAt).toLocaleString()}
                    </div>
                    {interview.location && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {interview.location}
                      </div>
                    )}
                  </div>

                  {interview.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">{interview.notes}</p>
                  )}
                </div>

                <div className="ml-4">
                  <Link to={`/interviewer/interviews/${interview.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default InterviewsList;

