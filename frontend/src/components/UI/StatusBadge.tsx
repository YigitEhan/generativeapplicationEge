import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string;
  type?: 'application' | 'vacancy' | 'request' | 'interview' | 'test';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'application' }) => {
  const getStatusColor = () => {
    const statusUpper = status.toUpperCase();
    
    // Application statuses
    if (type === 'application') {
      switch (statusUpper) {
        case 'APPLIED':
          return 'bg-blue-100 text-blue-800';
        case 'SCREENING':
          return 'bg-yellow-100 text-yellow-800';
        case 'TEST_INVITED':
        case 'TEST_COMPLETED':
          return 'bg-purple-100 text-purple-800';
        case 'INTERVIEW_SCHEDULED':
        case 'INTERVIEWED':
          return 'bg-indigo-100 text-indigo-800';
        case 'OFFER':
          return 'bg-green-100 text-green-800';
        case 'HIRED':
          return 'bg-green-600 text-white';
        case 'REJECTED':
          return 'bg-red-100 text-red-800';
        case 'WITHDRAWN':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Vacancy statuses
    if (type === 'vacancy') {
      switch (statusUpper) {
        case 'DRAFT':
          return 'bg-gray-100 text-gray-800';
        case 'PUBLISHED':
          return 'bg-green-100 text-green-800';
        case 'CLOSED':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Request statuses
    if (type === 'request') {
      switch (statusUpper) {
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-800';
        case 'APPROVED':
          return 'bg-green-100 text-green-800';
        case 'DECLINED':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Interview statuses
    if (type === 'interview') {
      switch (statusUpper) {
        case 'SCHEDULED':
          return 'bg-blue-100 text-blue-800';
        case 'COMPLETED':
          return 'bg-green-100 text-green-800';
        case 'CANCELLED':
          return 'bg-red-100 text-red-800';
        case 'RESCHEDULED':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Test statuses
    if (type === 'test') {
      switch (statusUpper) {
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-800';
        case 'IN_PROGRESS':
          return 'bg-blue-100 text-blue-800';
        case 'COMPLETED':
          return 'bg-green-100 text-green-800';
        case 'EXPIRED':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusColor()
      )}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;

