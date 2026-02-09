import React from 'react';
import { IssueStatus } from '../types';

interface StatusBadgeProps {
  status: IssueStatus | string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  let colorClass = 'bg-gray-500 text-white';

  switch (status) {
    case IssueStatus.NEW:
      colorClass = 'bg-danger text-white shadow-sm'; // Red
      break;
    case IssueStatus.IN_PROGRESS:
      colorClass = 'bg-warning text-black font-bold shadow-sm'; // Yellow
      break;
    case IssueStatus.RESOLVED:
      colorClass = 'bg-success text-white shadow-sm'; // Green
      break;
    case IssueStatus.DISPUTED:
      colorClass = 'bg-red-800 text-white border-2 border-white shadow-md'; // Dark Red
      break;
    case 'Submitted':
    case 'Assigned':
      colorClass = 'bg-primary text-white';
      break;
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`${colorClass} ${sizeClass} font-bold rounded-full uppercase tracking-wider inline-block`}>
      {status}
    </span>
  );
};

export default StatusBadge;