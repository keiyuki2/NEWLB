
import React from 'react';
import { Badge } from '../../types';

interface BadgeCardItemProps {
  badge: Badge;
}

export const BadgeCardItem: React.FC<BadgeCardItemProps> = ({ badge }) => {
  return (
    <div className="bg-dark-surface p-4 rounded-lg border border-dark-border flex items-center space-x-4 h-full hover:shadow-md hover:border-brand-accent/60 transition-all duration-200">
      <div className={`text-3xl ${badge.colorClass} w-10 h-10 flex items-center justify-center flex-shrink-0`}>
        <i className={badge.iconClass}></i>
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-100">{badge.name}</h3>
        <p className="text-xs text-gray-400">{badge.description}</p> {/* Short description from badge.description */}
      </div>
    </div>
  );
};