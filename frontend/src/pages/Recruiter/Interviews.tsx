import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { StatusBadge } from '../../components/UI/StatusBadge';
import api from '../../lib/api';

interface Interview {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  status: string;
  round?: number;
  application?: {
    id: string;
    applicant?: { id: string; firstName: string; lastName: string; email: string };
    vacancy?: { id: string; title: string; department?: { name: string } };
  };
  interviewers?: Array<{
    id: string;
    interviewer?: { id: string; firstName: string; lastName: string; email: string };
    status: string;
  }>;
  scheduledBy?: { firstName: string; lastName: string };
}

interface Application {
  id: string;
  applicant?: { firstName: string; lastName: string };
  vacancy?: { title: string };
  status: string;
}

interface Interviewer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const Interviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState<{ show: boolean; id: string; title: string }>({ show: false, id: '', title: '' });
  const [cancelReason, setCancelReason] = useState('');

  // Schedule modal state
  const [scheduleModal, setScheduleModal] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    title: '',
    description: '',
    round: 1,
    scheduledAt: '',
    duration: 60,
    location: '',
    interviewerIds: [] as string[],
  });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await api.get('/interviews');
      setInterviews(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.post(`/interviews/${cancelModal.id}/cancel`, { reason: cancelReason });
      setCancelModal({ show: false, id: '', title: '' });
      setCancelReason('');
      fetchInterviews();
    } catch (error) {
      console.error('Failed to cancel interview:', error);
    }
  };

  const openScheduleModal = async () => {
    try {
      const [appsRes, usersRes] = await Promise.all([
        api.get('/applications'),
        api.get('/users?role=INTERVIEWER'),
      ]);
      const apps = appsRes.data.data || appsRes.data || [];
      // Filter to applications that can have interviews scheduled
      const eligibleApps = apps.filter((a: Application) =>
        ['SHORTLISTED', 'INTERVIEW_R1', 'INTERVIEW_R2', 'UNDER_REVIEW'].includes(a.status)
      );
      setApplications(eligibleApps);
      setInterviewers(usersRes.data.data || usersRes.data || []);
      setScheduleModal(true);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleForm.applicationId || !scheduleForm.title || !scheduleForm.scheduledAt || scheduleForm.interviewerIds.length === 0) {
      alert('Please fill all required fields');
      return;
    }
    setScheduling(true);
    try {
      await api.post(`/applications/${scheduleForm.applicationId}/interviews`, {
        title: scheduleForm.title,
        description: scheduleForm.description,
        round: scheduleForm.round,
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
        duration: scheduleForm.duration,
        location: scheduleForm.location,
        interviewerIds: scheduleForm.interviewerIds,
      });
      setScheduleModal(false);
      setScheduleForm({ applicationId: '', title: '', description: '', round: 1, scheduledAt: '', duration: 60, location: '', interviewerIds: [] });
      fetchInterviews();
    } catch (error: any) {
      console.error('Failed to schedule interview:', error);
      alert(error.response?.data?.error || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const filteredInterviews = interviews.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'scheduled') return i.status === 'SCHEDULED' || i.status === 'RESCHEDULED';
    if (filter === 'completed') return i.status === 'COMPLETED';
    if (filter === 'cancelled') return i.status === 'CANCELLED';
    return true;
  });

  const now = new Date();
  const upcoming = interviews.filter(i => (i.status === 'SCHEDULED' || i.status === 'RESCHEDULED') && new Date(i.scheduledAt) > now);
  const today = interviews.filter(i => {
    const date = new Date(i.scheduledAt);
    return (i.status === 'SCHEDULED' || i.status === 'RESCHEDULED') &&
      date.toDateString() === now.toDateString();
  });

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Interviews</h1>
          <p className="text-gray-600">Schedule and track candidate interviews</p>
        </div>
        <Button onClick={openScheduleModal}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Schedule Interview
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{interviews.length}</p>
          <p className="text-sm text-gray-500">Total Interviews</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">{today.length}</p>
          <p className="text-sm text-gray-500">Today</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600">{upcoming.length}</p>
          <p className="text-sm text-gray-500">Upcoming</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-600">{interviews.filter(i => i.status === 'COMPLETED').length}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                filter === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} ({tab === 'all' ? interviews.length :
                tab === 'scheduled' ? interviews.filter(i => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED').length :
                tab === 'completed' ? interviews.filter(i => i.status === 'COMPLETED').length :
                interviews.filter(i => i.status === 'CANCELLED').length})
            </button>
          ))}
        </nav>
      </div>

      {/* Interviews List */}
      {filteredInterviews.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No interviews found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map(interview => (
            <Card key={interview.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{interview.title}</h3>
                    <StatusBadge status={interview.status} type="interview" />
                    {interview.round && <span className="text-xs bg-gray-100 px-2 py-1 rounded">Round {interview.round}</span>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{interview.application?.applicant?.firstName} {interview.application?.applicant?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{interview.application?.vacancy?.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDateTime(interview.scheduledAt)}</span>
                      <span className="text-gray-400">({interview.duration} min)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{interview.interviewers?.map(i => `${i.interviewer?.firstName} ${i.interviewer?.lastName}`).join(', ') || 'No interviewers'}</span>
                    </div>
                  </div>
                  {interview.location && (
                    <div className="mt-2 text-sm">
                      <a href={interview.location} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {interview.location.startsWith('http') ? '📹 Join Meeting' : `📍 ${interview.location}`}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/recruiter/applications/${interview.application?.id}`)}>
                    View Application
                  </Button>
                  {(interview.status === 'SCHEDULED' || interview.status === 'RESCHEDULED') && (
                    <Button size="sm" variant="danger" onClick={() => setCancelModal({ show: true, id: interview.id, title: interview.title })}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Interview?</h3>
            <p className="text-gray-600 mb-4">Cancel "{cancelModal.title}"? This will notify all participants.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              className="w-full p-3 border rounded-lg mb-4 resize-none"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => { setCancelModal({ show: false, id: '', title: '' }); setCancelReason(''); }}>
                Keep Interview
              </Button>
              <Button variant="danger" onClick={handleCancel}>Cancel Interview</Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Interview</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application *</label>
                <select
                  value={scheduleForm.applicationId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, applicationId: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select an application</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.applicant?.firstName} {app.applicant?.lastName} - {app.vacancy?.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="e.g., Technical Interview - Round 1"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  placeholder="Interview details..."
                  className="w-full p-2 border rounded-lg resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
                  <input
                    type="number"
                    min="1"
                    value={scheduleForm.round}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, round: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min="15"
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) || 60 })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduledAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Meeting Link</label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  placeholder="https://meet.google.com/... or Office Room 101"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interviewers *</label>
                <div className="border rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                  {interviewers.length === 0 ? (
                    <p className="text-sm text-gray-500">No interviewers available</p>
                  ) : (
                    interviewers.map(i => (
                      <label key={i.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={scheduleForm.interviewerIds.includes(i.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setScheduleForm({ ...scheduleForm, interviewerIds: [...scheduleForm.interviewerIds, i.id] });
                            } else {
                              setScheduleForm({ ...scheduleForm, interviewerIds: scheduleForm.interviewerIds.filter(id => id !== i.id) });
                            }
                          }}
                          className="rounded"
                        />
                        {i.firstName} {i.lastName} ({i.email})
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setScheduleModal(false)}>Cancel</Button>
              <Button onClick={handleSchedule} disabled={scheduling}>
                {scheduling ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;

