

import React from 'react';
import { Badge } from '../../types';

interface CollectionBadgeItemProps {
  badge: Badge;
  isObtained: boolean;
}

export const CollectionBadgeItem: React.FC<CollectionBadgeItemProps> = ({ badge, isObtained }) => {
  return (
    <div 
      className={`p-3 border rounded-lg flex flex-col items-center justify-center text-center h-full transition-all duration-200 ease-in-out
        ${isObtained ? 'bg-dark-surface border-dark-border shadow-md hover:border-brand-accent/70' : 'bg-gray-800/30 border-gray-700/50 filter grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}`}
    >
      <div className={`text-3xl mb-2 ${isObtained ? badge.colorClass : 'text-gray-500'}`}>
        <i className={badge.iconClass}></i>
      </div>
      <h3 className={`text-sm font-semibold ${isObtained ? 'text-gray-100' : 'text-gray-400'}`}>{badge.name}</h3>
      <p className={`text-xs ${isObtained ? 'text-gray-400' : 'text-gray-500'}`}>{badge.description}</p>
      {(badge.value !== undefined && badge.value > 0) && (
        <p className={`mt-1 text-xs font-bold ${isObtained ? 'text-brand-accent' : 'text-gray-600'}`}>
          Value: {badge.value}
        </p>
      )}
      {!isObtained && <div className="mt-1 text-[10px] text-gray-500">(Locked)</div>}
    </div>
  );
};
