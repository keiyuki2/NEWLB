

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Badge, BadgeCategory, UsernameColorTag } from '../../types';
import { Tabs } from '../ui/Tabs';
import { BADGE_CATEGORIES_TABS, INITIAL_BADGES } from '../../constants';
import { RewardPreviewModal } from './RewardPreviewModal'; 
import { BadgeCardItemIndex } from './BadgeCardItemIndex'; // Import the sub-component


export const BadgeIndexView: React.FC = () => {
  const { badges: allBadgesFromContext } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);
  const [previewTag, setPreviewTag] = useState<UsernameColorTag | null>(null);

  const achievementBadgesForHowTo = useMemo(() => 
    INITIAL_BADGES.filter(b => ["clan_founder", "speed_demon", "collector_adept"].includes(b.id) && b.isVisible)
  , []);
  const specialBadgesForHowTo = useMemo(() => 
    INITIAL_BADGES.filter(b => ["beta_tester", "verified_yt", "game_admin"].includes(b.id) && b.isVisible)
  , []);

  const selectedCategory = BADGE_CATEGORIES_TABS[activeTab]?.category;
  
  const getBadgesForTab = () => {
    const publiclyVisibleBadges = allBadgesFromContext.filter(badge => badge.isVisible);
    if (selectedCategory) {
        return publiclyVisibleBadges.filter(badge => badge.category === selectedCategory);
    }
    return publiclyVisibleBadges; 
  }

  const displayedBadges = getBadgesForTab();

  const handleShowPreviewTag = (tag: UsernameColorTag | null) => {
    setPreviewTag(tag);
  };

  const tabItems = BADGE_CATEGORIES_TABS.map(tabInfo => ({
    label: `${tabInfo.label}${tabInfo.category ? ` (${getBadgesForTab().filter(b => b.category === tabInfo.category).length})` : ` (${getBadgesForTab().length})`}`,
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
          Explore all publicly available badges. They can be earned through achievements, assigned by staff, or obtained during special events. Click on a badge to see style previews if applicable.
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
