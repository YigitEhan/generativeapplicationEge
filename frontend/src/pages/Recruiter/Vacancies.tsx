import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { StatusBadge } from '../../components/UI/StatusBadge';
import api from '../../lib/api';

export const Vacancies = () => {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const response = await api.get('/vacancies');
      const data = response.data.data || response.data;
      setVacancies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch vacancies:', error);
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVacancies = vacancies.filter((vacancy) => {
    if (filter === 'all') return true;
    if (filter === 'open') return vacancy.status === 'OPEN' || vacancy.status === 'PUBLISHED';
    if (filter === 'closed') return vacancy.status === 'CLOSED';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Vacancies</h1>
          <p className="text-gray-600">Create and manage job vacancies</p>
        </div>
        <Link to="/recruiter/vacancies/new">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Vacancy
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium ${filter === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          All ({vacancies.length})
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 font-medium ${filter === 'open' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
        >
          Open
        </button>
        <button
          onClick={() => setFilter('closed')}
          className={`px-4 py-2 font-medium ${filter === 'closed' ? 'border-b-2 border-gray-600 text-gray-600' : 'text-gray-600'}`}
        >
          Closed
        </button>
      </div>

      {/* Vacancies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVacancies.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No vacancies found</p>
          </Card>
        ) : (
          filteredVacancies.map((vacancy) => (
            <Card key={vacancy.id}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{vacancy.title}</h3>
                  <StatusBadge status={vacancy.status} type="vacancy" />
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">{vacancy.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Department:</span>
                    <span className="font-medium">{vacancy.department?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Applications:</span>
                    <span className="font-medium">{vacancy._count?.applications || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Positions:</span>
                    <span className="font-medium">{vacancy.numberOfPositions}</span>
                  </div>
                  {vacancy.applicationDeadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deadline:</span>
                      <span className={new Date(vacancy.applicationDeadline) < new Date() ? 'text-red-600 font-medium' : ''}>
                        {new Date(vacancy.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <Link to={`/recruiter/vacancies/${vacancy.id}`}>
                  <Button size="sm" fullWidth>Manage</Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Vacancies;

