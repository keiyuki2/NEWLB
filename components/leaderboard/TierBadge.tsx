

import React from 'react';
import { TierLevel } from '../../types';
import { TIER_STYLES } from '../../constants';
import { Tooltip } from '../ui/Tooltip';

interface TierBadgeProps {
  tier: TierLevel;
  animated?: boolean; // For promotion pulse
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, animated = false, size = 'md' }) => {
  const tierStyle = TIER_STYLES[tier];
  if (!tierStyle) return null; // Fallback for invalid tier

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] leading-tight',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  const iconSizeClasses = {
    xs: 'text-[9px] mr-0.5',
    sm: 'text-[10px] mr-1',
    md: 'text-xs mr-1.5',
    lg: 'text-sm mr-1.5',
  }

  return (
    <Tooltip text={tierStyle.name} position="top">
      <div
        className={`inline-flex items-center rounded ${tierStyle.badgeClass} ${sizeClasses[size]} ${animated ? 'animate-pulse-fast' : ''} ${tierStyle.glowClass || ''} transition-all duration-300 whitespace-nowrap`}
      >
        <i className={`${tierStyle.iconClass} ${iconSizeClasses[size]}`}></i>
        <span>{tier}</span>
      </div>
    </Tooltip>
  );
};
