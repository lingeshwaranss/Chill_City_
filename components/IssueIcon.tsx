import React from 'react';
import { Zap, AlertTriangle, Trash, Droplets, Footprints, Construction } from 'lucide-react';

interface IssueIconProps {
  type: string;
  size?: number;
  className?: string;
}

const IssueIcon: React.FC<IssueIconProps> = ({ type, size = 20, className = "" }) => {
  const normalizedType = type.toLowerCase();
  
  if (normalizedType.includes('streetlight') || normalizedType.includes('electric')) {
    return <Zap size={size} className={className} />;
  }
  if (normalizedType.includes('pothole') || normalizedType.includes('road')) {
    return <Construction size={size} className={className} />;
  }
  if (normalizedType.includes('garbage') || normalizedType.includes('waste') || normalizedType.includes('dump')) {
    return <Trash size={size} className={className} />;
  }
  if (normalizedType.includes('water') || normalizedType.includes('leak') || normalizedType.includes('pipe')) {
    return <Droplets size={size} className={className} />;
  }
  if (normalizedType.includes('footpath') || normalizedType.includes('walk') || normalizedType.includes('pedestrian')) {
    return <Footprints size={size} className={className} />;
  }
  
  return <AlertTriangle size={size} className={className} />;
};

export default IssueIcon;