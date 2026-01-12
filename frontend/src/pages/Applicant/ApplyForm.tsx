import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vacanciesApi, applicationsApi } from '../../lib/api';
import type { Vacancy } from '../../types/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';

export const ApplyForm = () => {
  const { vacancyId } = useParams<{ vacancyId: string }>();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [formData, setFormData] = useState({
    coverLetter: '',
    cvFile: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (vacancyId) {
      fetchVacancy();
    }
  }, [vacancyId]);

  const fetchVacancy = async () => {
    try {
      const response = await vacanciesApi.getById(vacancyId!);
      setVacancy(response.data);
    } catch (error) {
      console.error('Failed to fetch vacancy:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, cvFile: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cvFile) {
      alert('Please upload your CV');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('coverLetter', formData.coverLetter);
      data.append('cv', formData.cvFile);

      await applicationsApi.apply(vacancyId!, data);
      alert('Application submitted successfully!');
      navigate('/applicant/applications');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!vacancy) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Apply for Position</h1>
        <p className="mt-2 text-gray-600">{vacancy.title} - {vacancy.department}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter
            </label>
            <textarea
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us why you're a great fit for this role..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CV (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {formData.cvFile && (
              <p className="mt-2 text-sm text-gray-600">Selected: {formData.cvFile.name}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" loading={loading} fullWidth>
              Submit Application
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)} fullWidth>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ApplyForm;

