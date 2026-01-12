import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Candidate } from '../types';

function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    education: '',
    linkedIn: '',
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates');
      setCandidates(response.data);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience: formData.experience ? parseInt(formData.experience) : undefined,
      };
      await api.post('/candidates', payload);
      setShowForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        skills: '',
        experience: '',
        education: '',
        linkedIn: '',
      });
      fetchCandidates();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create candidate');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await api.delete(`/candidates/${id}`);
      fetchCandidates();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete candidate');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Candidates</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Candidate'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Add New Candidate</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="JavaScript, React, Node.js"
              />
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Education</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                value={formData.linkedIn}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Add Candidate</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Skills</th>
              <th>Experience</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.firstName} {candidate.lastName}</td>
                <td>{candidate.email}</td>
                <td>{candidate.phone || '-'}</td>
                <td>{candidate.skills.join(', ')}</td>
                <td>{candidate.experience ? `${candidate.experience} years` : '-'}</td>
                <td>{candidate._count?.applications || 0}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(candidate.id)}>
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

export default Candidates;

