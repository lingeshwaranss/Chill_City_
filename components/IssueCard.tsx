import React from 'react';
import { Issue } from '../types';
import StatusBadge from './StatusBadge';
import IssueIcon from './IssueIcon';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IssueCardProps {
  issue: Issue;
  isActive?: boolean;
  onClick?: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 
        ${isActive 
          ? 'bg-blue-50 border-primary shadow-lg ring-1 ring-primary' 
          : 'bg-surface border-gray-200 hover:border-primary/50 hover:shadow-md'
        }`}
    >
      <div className="relative w-24 h-24 flex-shrink-0">
        <img 
            src={issue.imageUrl} 
            alt={issue.type} 
            className="w-full h-full object-cover rounded-lg border border-gray-100 shadow-sm" 
        />
        <div className="absolute top-1 left-1 bg-white/90 p-1 rounded-full shadow-sm text-primary">
            <IssueIcon type={issue.type} size={14} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-lg text-primary leading-tight line-clamp-1">{issue.type}</h3>
            <StatusBadge status={issue.status} />
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{issue.description}</p>
        </div>
        
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500 font-medium">
            <MapPin size={14} className="mr-1 text-danger" />
            <span className="truncate max-w-[120px]">{issue.locationName}</span>
          </div>
          <Link 
            to={`/complaint/${issue.id}`} 
            className="text-primary text-xs flex items-center hover:underline font-bold uppercase tracking-wide"
            onClick={(e) => e.stopPropagation()} // Prevent card click
          >
            Details <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;