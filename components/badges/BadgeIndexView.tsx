
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Badge, BadgeCategory, UsernameColorTag } from '../../types';
import { Tabs } from '../ui/Tabs';
import { BADGE_CATEGORIES_TABS, INITIAL_BADGES } from '../../constants';
import { RewardPreviewModal } from './RewardPreviewModal'; 

const BadgeCardItemIndex: React.FC<{ badge: Badge; onClickShowPreview: (tag: UsernameColorTag | null) => void }> = ({ badge, onClickShowPreview }) => {
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
    }
    // If no reward, onClickShowPreview(null) can be called or nothing happens
  };

  return (
    <div 
      className="bg-dark-surface p-4 rounded-lg border border-dark-border flex flex-col items-start space-y-2 h-full hover:shadow-lg hover:border-brand-accent/50 transition-all duration-200 cursor-pointer"
      onClick={handleClick} // Changed from hover to click
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
      {(badge.colorTagId || badge.usernameColorUnlock) && (
        <div className="mt-auto pt-2 border-t border-dark-border/50 w-full">
            <p className="text-xs text-yellow-400 flex items-center">
                <i className="fas fa-palette mr-1.5"></i> 
                {linkedColorTag?.name || badge.usernameColorUnlock?.description || "Unlocks Username Style"}
            </p>
        </div>
      )}
    </div>
  );
};

export const BadgeIndexView: React.FC = () => {
  const { badges: allBadgesFromContext } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);
  const [previewTag, setPreviewTag] = useState<UsernameColorTag | null>(null);

  const achievementBadgesForHowTo = INITIAL_BADGES.filter(b => ["survivalist", "top_reviver", "speed_king"].includes(b.id));
  const specialBadgesForHowTo = INITIAL_BADGES.filter(b => ["beta_tester", "verified_yt", "game_admin"].includes(b.id));

  const selectedCategory = BADGE_CATEGORIES_TABS[activeTab]?.category;
  
  const getBadgesForTab = () => {
    if (selectedCategory) {
        return allBadgesFromContext.filter(badge => badge.category === selectedCategory);
    }
    return allBadgesFromContext; 
  }

  const displayedBadges = getBadgesForTab();

  const handleShowPreviewTag = (tag: UsernameColorTag | null) => {
    setPreviewTag(tag);
  };

  const tabItems = BADGE_CATEGORIES_TABS.map(tabInfo => ({
    label: tabInfo.label,
    content: (
      displayedBadges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedBadges.map(badge => (
            <BadgeCardItemIndex key={badge.id} badge={badge} onClickShowPreview={handleShowPreviewTag} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">No badges in this category.</p>
      )
    )
  }));


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100 mb-1">Badge Index</h1>
        <p className="text-md text-gray-400">
          Explore all available badges. They can be earned through achievements, assigned by staff, or obtained during special events.
        </p>
      </div>

      <Tabs tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} variant="pills" />

      <Card title="How to Earn Badges" titleIcon={<i className="fas fa-question-circle opacity-80"/>}>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-3">Achievement Badges</h3>
            <p className="text-sm text-gray-400 mb-4">
              Achievement badges are earned automatically when you reach specific milestones in the game:
            </p>
            <ul className="space-y-2">
              {achievementBadgesForHowTo.map(badge => (
                <li key={`howto-${badge.id}`} className="flex items-start">
                  <i className={`${badge.iconClass} ${badge.colorClass} mt-1 mr-3 text-lg w-5 text-center`}></i>
                  <span className="text-gray-300">{badge.unlockCriteria}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-3">Special Badges</h3>
            <p className="text-sm text-gray-400 mb-4">
              Special badges are granted by admins for specific roles or achievements:
            </p>
             <ul className="space-y-2">
              {specialBadgesForHowTo.map(badge => (
                <li key={`howto-special-${badge.id}`} className="flex items-start">
                  <i className={`${badge.iconClass} ${badge.colorClass} mt-1 mr-3 text-lg w-5 text-center`}></i>
                  <span className="text-gray-300">{badge.unlockCriteria}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
      {previewTag && (
        <RewardPreviewModal 
            isOpen={!!previewTag} 
            onClose={() => setPreviewTag(null)} 
            tag={previewTag} 
        />
      )}
    </div>
  );
};