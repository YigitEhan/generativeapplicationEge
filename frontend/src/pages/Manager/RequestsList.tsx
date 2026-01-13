import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { StatusBadge } from '../../components/UI/StatusBadge';
import api from '../../lib/api';

export const RequestsList = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/vacancy-requests');
      // Handle paginated response
      const data = response.data.data || response.data;
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === 'all') return true;
    return request.status === filter.toUpperCase();
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
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Requests</h1>
          <p className="text-gray-600">Manage your department's hiring requests</p>
        </div>
        <Link to="/manager/requests/new">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Request
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium ${filter === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          All ({requests.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium ${filter === 'pending' ? 'border-b-2 border-yellow-600 text-yellow-600' : 'text-gray-600'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 font-medium ${filter === 'approved' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 font-medium ${filter === 'rejected' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
        >
          Rejected
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No requests found</p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    <StatusBadge status={request.status} type="request" />
                  </div>
                  
                  <p className="text-gray-600 mb-3">{request.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <span className="ml-2 font-medium">{request.department?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Positions:</span>
                      <span className="ml-2 font-medium">{request.numberOfPositions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <span className={`ml-2 font-medium ${
                        request.priority === 'HIGH' ? 'text-red-600' :
                        request.priority === 'MEDIUM' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {request.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2">{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.justification && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700"><strong>Justification:</strong> {request.justification}</p>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <Link to={`/manager/requests/${request.id}`}>
                    <Button size="sm" variant="outline">View Details</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RequestsList;

