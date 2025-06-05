
import React from 'react';
import { Badge } from '../../types';
import { BadgeIcon } from './BadgeIcon';
import { useAppContext } from '../../contexts/AppContext';

interface UserBadgesListProps {
  badgeIds: string[];
  maxVisible?: number;
  onClick?: () => void; 
}

export const UserBadgesList: React.FC<UserBadgesListProps> = ({ badgeIds, maxVisible = 5, onClick }) => {
  const { badges: allBadges } = useAppContext();

  const userBadges = badgeIds
    .map(id => allBadges.find(b => b.id === id))
    .filter(Boolean)
    .filter(badge => (badge as Badge).isVisible) as Badge[];
  
  const sortedBadges = userBadges.sort((a, b) => {
    const priority: Record<string, number> = {
        "verified_yt": 1, "verified_tiktok": 1,
        "game_admin": 2, "moderator": 3, "staff_badge": 2, // Added staff_badge priority
    };
    return (priority[a.id] || 10) - (priority[b.id] || 10);
  });

  const visibleBadges = sortedBadges.slice(0, maxVisible);
  const hiddenCount = sortedBadges.length - visibleBadges.length;

  if (userBadges.length === 0) {
    return null;
  }

  const wrapperProps: React.HTMLAttributes<HTMLDivElement> = onClick ? {
    onClick: onClick,
    role: 'button',
    tabIndex: 0,
    onKeyDown: (e) => { if ((e.key === 'Enter' || e.key === ' ') && onClick) onClick(); },
    className: `flex items-center space-x-1.5 p-1 rounded-md transition-colors duration-150 hover:bg-dark-border/50 cursor-pointer`,
    'aria-label': "View all badges for this user"
  } : {
    className: "flex items-center space-x-1.5"
  };

  return (
    <div {...wrapperProps}>
      {visibleBadges.map(badge => (
        <BadgeIcon key={badge.id} badge={badge} size="sm" />
      ))}
      {hiddenCount > 0 && (
        <div className="text-xs text-gray-400 bg-dark-surface px-1.5 py-0.5 rounded-full border border-gray-600">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
};
