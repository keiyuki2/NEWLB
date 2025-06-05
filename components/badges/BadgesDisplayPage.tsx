

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Badge, CollectionRank } from '../../types';
import { Button } from '../ui/Button'; 
import { Tooltip } from '../ui/Tooltip';
import { COLLECTION_RANKS } from '../../constants';
import { CollectionBadgeItem } from './CollectionBadgeItem';


// Badge Index Button with Hover Effect
const BadgeIndexButton: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const socialIcons = [
        { icon: 'fab fa-twitch', color: 'text-purple-400', key: 'twitch' },
        { icon: 'fab fa-youtube', color: 'text-red-500', key: 'youtube' },
        { icon: 'fab fa-tiktok', color: 'text-pink-400', key: 'tiktok' },
        { icon: 'fab fa-twitter', color: 'text-sky-400', key: 'twitter' },
    ];

    return (
        <div className="relative inline-block">
            <Link to="/badges/index">
                <Button 
                    variant="primary" 
                    size="md" 
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onFocus={() => setIsHovered(true)}
                    onBlur={() => setIsHovered(false)}
                    leftIcon={<i className="fas fa-list-alt"></i>}
                >
                    View Badge Index
                </Button>
            </Link>
            {/* Hover Icons */}
            {socialIcons.map((item, index) => (
                <div
                    key={item.key}
                    className={`absolute transition-all duration-300 ease-out pointer-events-none
                        ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                        ${index === 0 ? '-top-3 -left-3' : ''}
                        ${index === 1 ? '-top-3 -right-3' : ''}
                        ${index === 2 ? '-bottom-3 -left-3' : ''}
                        ${index === 3 ? '-bottom-3 -right-3' : ''}
                    `}
                    style={{ transitionDelay: isHovered ? `${index * 50}ms` : '0ms' }}
                >
                    <i className={`${item.icon} ${item.color} text-2xl p-1 bg-dark-surface rounded-full shadow-lg`}></i>
                </div>
            ))}
        </div>
    );
};


export const BadgesDisplayPage: React.FC = () => {
  const { badges: allBadgesConfig, currentUser } = useAppContext();

  const publiclyVisibleBadges = useMemo(() => 
    allBadgesConfig.filter(b => b.isVisible)
  , [allBadgesConfig]);

  const totalPossibleValue = useMemo(() => 
    publiclyVisibleBadges.reduce((sum, badge) => sum + (badge.value || 0), 0)
  , [publiclyVisibleBadges]);

  const currentUserBadgeValue = useMemo(() => 
    currentUser
      ? currentUser.badges.reduce((sum, badgeId) => {
          const badge = allBadgesConfig.find(b => b.id === badgeId); 
          return sum + (badge?.value || 0);
        }, 0)
      : 0
  , [currentUser, allBadgesConfig]);

  const currentCollectionRank = useMemo(() => {
    const sortedRanks = [...COLLECTION_RANKS].sort((a, b) => b.pointsRequired - a.pointsRequired);
    return sortedRanks.find(rank => currentUserBadgeValue >= rank.pointsRequired) || COLLECTION_RANKS.find(r => r.pointsRequired === 0) || COLLECTION_RANKS[0];
  }, [currentUserBadgeValue]);

  const nextCollectionRank = useMemo(() => {
    if (!currentCollectionRank) return null;
    const sortedRanksAsc = [...COLLECTION_RANKS].sort((a, b) => a.pointsRequired - b.pointsRequired);
    const currentIndex = sortedRanksAsc.findIndex(rank => rank.id === currentCollectionRank.id);
    return (currentIndex !== -1 && currentIndex < sortedRanksAsc.length - 1) ? sortedRanksAsc[currentIndex + 1] : null;
  }, [currentCollectionRank]);

  const pointsToNextRank = useMemo(() => {
    if (!nextCollectionRank) return 0;
    return Math.max(0, nextCollectionRank.pointsRequired - currentUserBadgeValue);
  }, [nextCollectionRank, currentUserBadgeValue]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-1">Badge Collection</h1>
            <p className="text-md text-gray-400">
                Collect badges by completing achievements, participating in events, or through special roles.
            </p>
        </div>
        <div className="mt-4 sm:mt-0">
            <BadgeIndexButton />
        </div>
      </div>

      {currentUser && currentCollectionRank && (
        <Card titleIcon={<i className="fas fa-star text-yellow-400"/>} title="Your Collection Status">
          <div className="flex items-center space-x-3 mb-3">
            <Tooltip text={`${currentCollectionRank.name}: ${currentCollectionRank.description}`} position="right">
                <img src={currentCollectionRank.imageUrl} alt={currentCollectionRank.name} className="w-12 h-12 object-contain" />
            </Tooltip>
            <div>
                <p className="text-lg font-semibold text-gray-100">{currentCollectionRank.name}</p>
                <p className="text-2xl font-bold text-brand-primary">
                    {currentUserBadgeValue.toLocaleString()} / {totalPossibleValue.toLocaleString()} Points
                </p>
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700">
            <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${nextCollectionRank && nextCollectionRank.pointsRequired > 0 ? (currentUserBadgeValue / nextCollectionRank.pointsRequired) * 100 : (currentUserBadgeValue > 0 ? 100 : 0)}%` }}
            ></div>
          </div>
          {nextCollectionRank ? (
             <p className="text-xs text-gray-400 mt-1.5 text-right">
                {pointsToNextRank.toLocaleString()} points to <span className="font-semibold text-gray-300">{nextCollectionRank.name}</span>
             </p>
          ) : (
            <p className="text-xs text-green-400 mt-1.5 text-right">
                <i className="fas fa-check-circle mr-1"></i> You've reached the highest rank!
            </p>
          )}
        </Card>
      )}
        
      <Card title="All Publicly Viewable Badges" titleIcon={<i className="fas fa-medal opacity-80"/>}>
        {publiclyVisibleBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {publiclyVisibleBadges.map(badge => (
                <CollectionBadgeItem 
                    key={badge.id} 
                    badge={badge} 
                    isObtained={currentUser?.badges.includes(badge.id) || false} 
                />
            ))}
            </div>
        ) : (
            <p className="text-gray-400 text-center py-6">No badges are currently available for display.</p>
        )}
      </Card>
    </div>
  );
};
