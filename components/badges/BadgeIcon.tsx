
import React from 'react';
import { Badge } from '../../types';
import { Tooltip } from '../ui/Tooltip';

interface BadgeIconProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ badge, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-sm h-5 w-5',
    md: 'text-lg h-6 w-6',
    lg: 'text-xl h-8 w-8',
  };

  return (
    <Tooltip text={`${badge.name}: ${badge.description}`} position="top">
      <div className={`inline-flex items-center justify-center p-1 rounded-full ${badge.colorClass} bg-dark-surface border border-gray-600`}>
        <i className={`${badge.iconClass} ${sizeClasses[size]}`}></i>
      </div>
    </Tooltip>
  );
};
    