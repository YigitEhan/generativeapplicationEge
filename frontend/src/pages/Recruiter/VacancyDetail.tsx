import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { vacanciesApi, applicationsApi } from '../../lib/api';
import type { Vacancy, Application } from '../../types/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { StatusBadge } from '../../components/UI/StatusBadge';

export const VacancyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'applications'>('details');
  const [showCloseModal, setShowCloseModal] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vacRes, appsRes] = await Promise.all([
        vacanciesApi.getById(id!),
        applicationsApi.getAll({ vacancyId: id }),
      ]);
      setVacancy(vacRes.data);
      const appsData = (appsRes.data as any).data || appsRes.data;
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch (error) {
      console.error('Failed to fetch vacancy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      await vacanciesApi.close(id!);
      setShowCloseModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to close vacancy:', error);
    }
  };

  const getDeptName = () => {
    if (!vacancy) return 'N/A';
    if (typeof vacancy.department === 'object' && vacancy.department) return vacancy.department.name;
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
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Vacancy Not Found</h2>
        <Link to="/recruiter/vacancies"><Button>Back to Vacancies</Button></Link>
      </div>
    );
  }

  const stats = {
    total: applications.length,
    applied: applications.filter(a => ['APPLIED', 'SUBMITTED'].includes(a.status)).length,
    screening: applications.filter(a => a.status === 'SCREENING').length,
    interview: applications.filter(a => ['INTERVIEW_SCHEDULED', 'INTERVIEW'].includes(a.status)).length,
    hired: applications.filter(a => a.status === 'HIRED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/recruiter/vacancies" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vacancy.title}</h1>
            <p className="text-gray-600">{getDeptName()} • {vacancy.location || 'Remote'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <StatusBadge status={vacancy.status} type="vacancy" />
          {vacancy.status === 'OPEN' && (
            <Button variant="danger" onClick={() => setShowCloseModal(true)}>Close Vacancy</Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Applied', value: stats.applied, color: 'gray' },
          { label: 'Screening', value: stats.screening, color: 'yellow' },
          { label: 'Interview', value: stats.interview, color: 'purple' },
          { label: 'Hired', value: stats.hired, color: 'green' },
          { label: 'Rejected', value: stats.rejected, color: 'red' },
        ].map(stat => (
          <Card key={stat.label} className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['details', 'applications'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'details' ? 'Vacancy Details' : `Applications (${applications.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' ? (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{vacancy.description}</p>
            </Card>
            {vacancy.responsibilities && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Responsibilities</h3>
                <p className="text-gray-700 whitespace-pre-line">{vacancy.responsibilities}</p>
              </Card>
            )}
            {vacancy.qualifications && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Qualifications</h3>
                <p className="text-gray-700 whitespace-pre-line">{vacancy.qualifications}</p>
              </Card>
            )}
          </div>
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Job Info</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd>{vacancy.employmentType}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Salary</dt><dd>{vacancy.salaryRange || 'N/A'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Positions</dt><dd>{vacancy.numberOfPositions}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Deadline</dt><dd>{vacancy.applicationDeadline ? new Date(vacancy.applicationDeadline).toLocaleDateString() : 'N/A'}</dd></div>
              </dl>
            </Card>
            {vacancy.requiredSkills && vacancy.requiredSkills.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {vacancy.requiredSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </Card>
            )}
            {vacancy.benefits && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                <p className="text-gray-700 text-sm whitespace-pre-line">{vacancy.benefits}</p>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          {applications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No applications yet</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map(app => (
                <div key={app.id} className="py-4 flex items-center justify-between hover:bg-gray-50 px-2 -mx-2 rounded cursor-pointer" onClick={() => navigate(`/recruiter/applications/${app.id}`)}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {(app.applicant?.firstName?.[0] || '') + (app.applicant?.lastName?.[0] || '')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{app.applicant?.firstName} {app.applicant?.lastName}</p>
                      <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                    <StatusBadge status={app.status} type="application" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Close Vacancy?</h3>
            <p className="text-gray-600 mb-6">This will stop accepting new applications. This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCloseModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleClose}>Close Vacancy</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacancyDetail;

