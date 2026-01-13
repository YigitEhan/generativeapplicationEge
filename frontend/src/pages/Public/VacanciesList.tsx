import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vacanciesApi } from '../../lib/api';
import type { Vacancy } from '../../types/api';
import { Card } from '../../components/UI/Card';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { Button } from '../../components/UI/Button';

export const VacanciesList = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    employmentType: '',
  });

  useEffect(() => {
    fetchVacancies();
  }, [filters]);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const response = await vacanciesApi.getPublic(filters);
      const data = response.data.data || response.data;
      setVacancies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch vacancies:', error);
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Open Positions</h1>
          <p className="text-lg text-gray-600">Find your next opportunity and join our team</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="HR">HR</option>
          </select>

          <select
            value={filters.employmentType}
            onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        {/* Vacancies Grid */}
        {vacancies.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No open positions at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vacancies.map((vacancy) => (
              <div key={vacancy.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{vacancy.title}</h3>
                      <StatusBadge status={vacancy.status} type="vacancy" />
                    </div>
                    <p className="text-sm text-gray-600">{vacancy.department}</p>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3">{vacancy.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {vacancy.employmentType.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {vacancy.experienceLevel}
                    </span>
                    {vacancy.location && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        📍 {vacancy.location}
                      </span>
                    )}
                  </div>

                  {vacancy.salaryMin && vacancy.salaryMax && (
                    <p className="text-sm font-medium text-gray-900">
                      ${vacancy.salaryMin.toLocaleString()} - ${vacancy.salaryMax.toLocaleString()}
                    </p>
                  )}

                  <Link to={`/vacancies/${vacancy.id}`}>
                    <Button fullWidth>View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/login">
            <Button variant="outline">Sign in to apply</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VacanciesList;

