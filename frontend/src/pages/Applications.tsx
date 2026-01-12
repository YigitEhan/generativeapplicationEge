import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Application, Job, Candidate } from '../types';

function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jobId: '',
    candidateId: '',
    coverLetter: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, jobsRes, candidatesRes] = await Promise.all([
        api.get('/applications'),
        api.get('/jobs'),
        api.get('/candidates'),
      ]);
      setApplications(appsRes.data);
      setJobs(jobsRes.data);
      setCandidates(candidatesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/applications', formData);
      setShowForm(false);
      setFormData({ jobId: '', candidateId: '', coverLetter: '' });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create application');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/applications/${id}`, { status });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      await api.delete(`/applications/${id}`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete application');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: 'badge-warning',
      REVIEWING: 'badge-info',
      INTERVIEW: 'badge-info',
      OFFERED: 'badge-success',
      ACCEPTED: 'badge-success',
      REJECTED: 'badge-danger',
    };
    return statusMap[status] || 'badge-info';
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Applications</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Application'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Create New Application</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job</label>
              <select
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                required
              >
                <option value="">Select a job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.department}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Candidate</label>
              <select
                value={formData.candidateId}
                onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                required
              >
                <option value="">Select a candidate</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.firstName} {candidate.lastName} - {candidate.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cover Letter</label>
              <textarea
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Application</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Candidate</th>
              <th>Status</th>
              <th>Applied Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.job?.title}</td>
                <td>{app.candidate?.firstName} {app.candidate?.lastName}</td>
                <td>
                  <select
                    className={`badge ${getStatusBadgeClass(app.status)}`}
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWING">Reviewing</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFERED">Offered</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </td>
                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(app.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Applications;

