import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { vacanciesApi } from '../../lib/api';
import type { Vacancy } from '../../types/api';
import { Card } from '../../components/UI/Card';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';

export const VacancyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchVacancy();
    }
  }, [id]);

  const fetchVacancy = async () => {
    try {
      setLoading(true);
      // Use public endpoint for vacancy details
      const response = await vacanciesApi.getPublicById(id!);
      setVacancy(response.data);
    } catch (error) {
      console.error('Failed to fetch vacancy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role === 'APPLICANT') {
      navigate(`/applicant/apply/${id}`);
    } else {
      alert('Only applicants can apply for positions');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">Vacancy not found</p>
              <Link to="/vacancies" className="mt-4 inline-block">
                <Button>Back to Vacancies</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/vacancies" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Back to all positions
        </Link>

        <Card>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{vacancy.title}</h1>
                  <p className="text-lg text-gray-600">{vacancy.department}</p>
                </div>
                <StatusBadge status={vacancy.status} type="vacancy" />
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {vacancy.employmentType.replace('_', ' ')}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {vacancy.experienceLevel}
                </span>
                {vacancy.location && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    📍 {vacancy.location}
                  </span>
                )}
              </div>

              {vacancy.salaryMin && vacancy.salaryMax && (
                <p className="text-lg font-semibold text-gray-900 mt-4">
                  ${vacancy.salaryMin.toLocaleString()} - ${vacancy.salaryMax.toLocaleString()} / year
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About the Role</h2>
              <p className="text-gray-700 whitespace-pre-line">{vacancy.description}</p>
            </div>

            {/* Responsibilities */}
            {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {vacancy.responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {vacancy.requirements && vacancy.requirements.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {vacancy.requirements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {vacancy.benefits && vacancy.benefits.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Benefits</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {vacancy.benefits.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply Button */}
            {vacancy.status === 'PUBLISHED' && (
              <div className="pt-6 border-t">
                {!isAuthenticated ? (
                  <Button onClick={handleApply} size="lg" fullWidth>
                    Sign in to Apply
                  </Button>
                ) : user?.role === 'APPLICANT' ? (
                  <Button onClick={handleApply} size="lg" fullWidth>
                    Apply for this position
                  </Button>
                ) : (
                  <div className="text-center text-gray-600 py-4">
                    Only applicants can apply for positions
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VacancyDetail;

