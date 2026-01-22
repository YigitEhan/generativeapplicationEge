import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { vacanciesApi } from '../../lib/api';
import type { Vacancy } from '../../types/api';
import { Button } from '../../components/UI/Button';

export const ApplicantVacancyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchVacancy();
    }
  }, [id]);

  const fetchVacancy = async () => {
    try {
      setLoading(true);
      const response = await vacanciesApi.getPublicById(id!);
      setVacancy(response.data);
    } catch (error) {
      console.error('Failed to fetch vacancy:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = () => {
    if (!vacancy) return 'N/A';
    if (typeof vacancy.department === 'object' && vacancy.department) {
      return vacancy.department.name;
    }
    return (vacancy.department as string) || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Position Not Found</h2>
          <p className="text-gray-500 mb-6">This position may have been closed or removed.</p>
          <Link to="/applicant/vacancies">
            <Button>Browse Open Positions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link to="/applicant/vacancies" className="inline-flex items-center text-blue-600 hover:text-blue-700">
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to positions
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{vacancy.title}</h1>
              <p className="text-blue-100 text-lg">{getDepartmentName()}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              vacancy.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {vacancy.status}
            </span>
          </div>
        </div>

        <div className="p-8">
          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {vacancy.location && (
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {vacancy.location}
              </div>
            )}
            {vacancy.employmentType && (
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {vacancy.employmentType}
              </div>
            )}
            {vacancy.salaryRange && (
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {vacancy.salaryRange}
              </div>
            )}
            {vacancy.numberOfPositions && (
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {vacancy.numberOfPositions} position{vacancy.numberOfPositions > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {vacancy.applicationDeadline && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                ⏰ Application Deadline: {new Date(vacancy.applicationDeadline).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Apply Button */}
          {vacancy.status === 'OPEN' && (
            <Button
              onClick={() => navigate(`/applicant/apply/${id}`)}
              size="lg"
              fullWidth
              className="mb-8"
            >
              Apply for this Position
            </Button>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Position</h2>
        <p className="text-gray-700 whitespace-pre-line">{vacancy.description}</p>
      </div>

      {/* Required Skills */}
      {vacancy.requiredSkills && vacancy.requiredSkills.length > 0 && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {vacancy.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Responsibilities */}
      {vacancy.responsibilities && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
          <p className="text-gray-700 whitespace-pre-line">{vacancy.responsibilities}</p>
        </div>
      )}

      {/* Qualifications */}
      {vacancy.qualifications && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Qualifications</h2>
          <p className="text-gray-700 whitespace-pre-line">{vacancy.qualifications}</p>
        </div>
      )}

      {/* Benefits */}
      {vacancy.benefits && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
          <p className="text-gray-700 whitespace-pre-line">{vacancy.benefits}</p>
        </div>
      )}

      {/* Apply Button (bottom) */}
      {vacancy.status === 'OPEN' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Apply?</h3>
          <p className="text-gray-600 mb-6">Take the next step in your career and join our team!</p>
          <Button onClick={() => navigate(`/applicant/apply/${id}`)} size="lg">
            Apply Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApplicantVacancyDetail;

