import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Job } from '../types';

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    type: 'FULL_TIME',
    status: 'OPEN',
    salary: '',
    requirements: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/jobs', formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        department: '',
        location: '',
        type: 'FULL_TIME',
        status: 'OPEN',
        salary: '',
        requirements: '',
      });
      fetchJobs();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create job');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete job');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Jobs</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Job'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Create New Job</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            <div className="form-group">
              <label>Salary</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Requirements</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Job</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Location</th>
              <th>Type</th>
              <th>Status</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.department}</td>
                <td>{job.location}</td>
                <td>{job.type}</td>
                <td>
                  <span className={`badge badge-${job.status === 'OPEN' ? 'success' : 'warning'}`}>
                    {job.status}
                  </span>
                </td>
                <td>{job._count?.applications || 0}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(job.id)}>
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

export default Jobs;

