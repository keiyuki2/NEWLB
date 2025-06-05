

import React from 'react';
import { Badge, UsernameColorTag } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

interface BadgeCardItemIndexProps {
  badge: Badge;
  onClickShowPreview: (tag: UsernameColorTag | null) => void;
}

export const BadgeCardItemIndex: React.FC<BadgeCardItemIndexProps> = ({ badge, onClickShowPreview }) => {
  const { usernameColorTags } = useAppContext(); 
  const linkedColorTag = badge.colorTagId ? usernameColorTags.find(tag => tag.id === badge.colorTagId) : undefined;

  const handleClick = () => {
    if (linkedColorTag) {
      onClickShowPreview(linkedColorTag);
    } else if (badge.usernameColorUnlock) { // Handle direct unlock for preview
      onClickShowPreview({
        id: `direct-${badge.id}`,
        name: `${badge.name} Style`,
        cssClasses: badge.usernameColorUnlock.textClasses,
        description: badge.usernameColorUnlock.description,
      });
    } else {
      onClickShowPreview(null); // Indicate no specific previewable tag
    }
  };

  return (
    <div 
      className="bg-dark-surface p-4 rounded-lg border border-dark-border flex flex-col items-start space-y-2 h-full hover:shadow-lg hover:border-brand-accent/50 transition-all duration-200 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick();}}
      aria-label={`View details for badge: ${badge.name}`}
    >
      <div className="flex items-center space-x-3 w-full">
        <div className={`text-3xl ${badge.colorClass} w-10 h-10 flex items-center justify-center flex-shrink-0`}>
          <i className={badge.iconClass}></i>
        </div>
        <div>
            <h3 className="text-md font-semibold text-gray-100">{badge.name}</h3>
            <p className="text-xs text-gray-400">{badge.description}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1 flex-grow">{badge.unlockCriteria}</p>
      
      {(badge.colorTagId || badge.usernameColorUnlock || (badge.value !== undefined && badge.value > 0)) && (
        <div className="mt-auto pt-2 border-t border-dark-border/50 w-full space-y-1">
            {(badge.colorTagId || badge.usernameColorUnlock) && (
                <p className="text-xs text-yellow-400 flex items-center">
                    <i className="fas fa-palette mr-1.5"></i> 
                    {linkedColorTag?.name || badge.usernameColorUnlock?.description || "Unlocks Username Style"}
                </p>
            )}
            {(badge.value !== undefined && badge.value > 0) && (
                <p className="text-xs text-brand-accent font-medium">
                    Points: {badge.value}
                </p>
            )}
        </div>
      )}
    </div>
  );
};
