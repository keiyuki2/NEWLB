
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Player, WorldRecord, SubmissionStatus, Badge as BadgeType, UsernameColorTag, LeaderboardCategory, SpeedSubCategory, PlayerStats, CollectionRank } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { RobloxAvatar } from '../ui/RobloxAvatar';
import { Card } from '../ui/Card';
import { RecordCard } from '../world-records/RecordCard';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import ReactMarkdown from 'react-markdown';
import { EditProfileModal } from './EditProfileModal';
import { SOCIAL_LINK_DEFINITIONS, TIER_STYLES, COLLECTION_RANKS } from '../../constants';
import { TierBadge } from '../leaderboard/TierBadge';
import { Tooltip } from '../ui/Tooltip';
import { SparkleParticle } from '../effects/SparkleParticle';
import { UserBadgesList } from '../badges/UserBadgesList';
import { ViewAllBadgesModal } from '../badges/ViewAllBadgesModal';

const formatTimeAgo = (date?: Date): string => {
    if (!date) return "N/A";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");
    return Math.floor(seconds) + (Math.floor(seconds) === 1 ? " second ago" : " seconds ago");
};

const StatDisplay: React.FC<{ label: string; value: number; unit?: string, lowerIsBetter?: boolean }> = ({ label, value, unit = '', lowerIsBetter = false }) => {
    const displayValue = value === 0 && lowerIsBetter ? "-" : value.toLocaleString();
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-2.5 bg-dark-bg rounded hover:bg-gray-700/50">
            <span className="text-sm text-gray-300 mb-0.5 sm:mb-0">{label}:</span>
            <span className="text-sm font-medium text-gray-100">{displayValue}{unit && value !== 0 ? unit : ''}</span>
        </div>
    );
};


export const PlayerProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const {
    players, worldRecords: allRecords, submissions, currentUser, isStaff,
    badges: allBadgesConfig, clans, usernameColorTags
  } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: string; style: React.CSSProperties }>>([]);

  const [isViewAllBadgesModalOpen, setIsViewAllBadgesModalOpen] = useState(false);
  const [viewingPlayerBadgesInfo, setViewingPlayerBadgesInfo] = useState<{ username: string; badgeIds: string[] } | null>(null);

  const effectiveUserId = userId === 'me' ? currentUser?.id : userId;
  const player = players.find(p => p.id === effectiveUserId);

  if (!player) {
    return <div className="text-center text-red-500 text-xl py-10">Player not found.</div>;
  }

  const playerClan = clans.find(c => c.id === player.clanId);
  const playerRecords = allRecords.filter(r => r.playerId === player.id && r.isVerified);
  const playerPendingSubmissions = submissions.filter(s => s.submittedBy === player.id && s.status === SubmissionStatus.PENDING);
  const isOwnProfile = currentUser?.id === player.id;

  const playerBadgePoints = useMemo(() => {
    return player.badges.reduce((sum, badgeId) => {
        const badge = allBadgesConfig.find(b => b.id === badgeId);
        return sum + (badge?.value || 0); // Sum points from ALL badges, visible or not
    }, 0);
  }, [player.badges, allBadgesConfig]);

  const playerCollectionRank = useMemo(() => {
    const sortedRanks = [...COLLECTION_RANKS].sort((a, b) => b.pointsRequired - a.pointsRequired);
    return sortedRanks.find(rank => playerBadgePoints >= rank.pointsRequired) || COLLECTION_RANKS.find(r => r.pointsRequired === 0) || COLLECTION_RANKS[0];
  }, [playerBadgePoints]);

  const SPARKLY_RANK_IDS = ['cr_gold', 'cr_platinum', 'cr_diamond', 'cr_radiant_nexus'];
  const showSparkles = playerCollectionRank && SPARKLY_RANK_IDS.includes(playerCollectionRank.id);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (showSparkles) {
      intervalId = setInterval(() => {
        setSparkles(prevSparkles => {
          if (prevSparkles.length > 15) return prevSparkles;
          const newSparkleId = `sparkle-${Date.now()}-${Math.random()}`;
          const newSparkleStyle: React.CSSProperties = {
            top: `${Math.random() * 100 - 10}%`,
            left: `${Math.random() * 100 - 10}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `scale(${Math.random() * 0.5 + 0.5})`,
          };
          return [...prevSparkles, { id: newSparkleId, style: newSparkleStyle }];
        });
      }, 600);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
      setSparkles([]);
    };
  }, [showSparkles]);

  const handleSparkleAnimationEnd = (id: string) => {
    setSparkles(prev => prev.filter(s => s.id !== id));
  };

  const getUsernameDisplayInfo = (): { classes: string[]; iconClass?: string } => {
    const defaultClasses = ['text-lg', 'md:text-xl', 'font-bold', 'text-white', 'break-all'];
    let appliedIconClass: string | undefined = undefined;
    let appliedTextClasses: string[] = [...defaultClasses];

    if (player.selectedUsernameTagId) {
        const selectedTag = usernameColorTags.find(tag => tag.id === player.selectedUsernameTagId);
        if (selectedTag) {
            appliedTextClasses = [...defaultClasses.filter(c => !c.startsWith('text-')), ...selectedTag.cssClasses];
            if (selectedTag.effectClass) appliedTextClasses.push(selectedTag.effectClass);
            appliedIconClass = selectedTag.iconClass;
            return { classes: appliedTextClasses, iconClass: appliedIconClass };
        }
    }

    const colorUnlockBadge = player.badges
        .map(badgeId => allBadgesConfig.find(b => b.id === badgeId && (b.usernameColorUnlock || b.colorTagId)))
        .filter(Boolean)[0] as BadgeType | undefined;

    if (colorUnlockBadge?.colorTagId) {
        const tagFromBadge = usernameColorTags.find(tag => tag.id === colorUnlockBadge.colorTagId);
        if (tagFromBadge) {
            appliedTextClasses = [...defaultClasses.filter(c => !c.startsWith('text-')), ...tagFromBadge.cssClasses];
            if (tagFromBadge.effectClass) appliedTextClasses.push(tagFromBadge.effectClass);
            appliedIconClass = tagFromBadge.iconClass;
            return { classes: appliedTextClasses, iconClass: appliedIconClass };
        }
    } else if (colorUnlockBadge?.usernameColorUnlock) {
        appliedTextClasses = [...defaultClasses.filter(c => !c.startsWith('text-')), ...colorUnlockBadge.usernameColorUnlock.textClasses];
    }
    return { classes: appliedTextClasses, iconClass: appliedIconClass };
  };

  const { classes: usernameDynamicClasses, iconClass: usernameIconClass } = getUsernameDisplayInfo();
  const usernameClasses = usernameDynamicClasses.join(' ');

  const handleMessagePlayer = () => {
    if (!currentUser || !isStaff) { 
        alert("Messaging is available for staff members.");
        return;
    }
    if (player && player.id !== currentUser.id) navigate(`/messages?with=${player.id}`);
  };

  const PlayerStatsDisplay: React.FC<{ stats: PlayerStats }> = ({ stats }) => (
    <Card title="Player Statistics" titleIcon={<i className="fas fa-chart-bar"/>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <h4 className="col-span-full text-md font-semibold text-brand-accent mt-2 mb-1.5">Speed</h4>
            <StatDisplay label="Normal" value={stats.speedNormal} unit="s" lowerIsBetter />
            <StatDisplay label="Glitched" value={stats.speedGlitched} unit="s" lowerIsBetter />

            <h4 className="col-span-full text-md font-semibold text-brand-accent mt-3 mb-1.5">Cosmetics</h4>
            <StatDisplay label="Unusuals" value={stats.cosmeticsUnusuals} />
            <StatDisplay label="Accessories" value={stats.cosmeticsAccessories} />
        </div>
    </Card>
  );

  const profileTabs = [
    {
      label: "Overview",
      icon: <i className="fas fa-user-circle"></i>,
      content: (
        <div className="space-y-4">
            <PlayerStatsDisplay stats={player.stats} />
        </div>
      )
    },
    {
      label: `World Records (${playerRecords.length})`,
      icon: <i className="fas fa-trophy"></i>,
      content: (
        <div>
          {playerRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playerRecords.map(record => <RecordCard key={record.id} record={record} player={player} />)}
            </div>
          ) : <p className="text-gray-400 text-center py-6">No world records achieved yet.</p>}
        </div>
      )
    },
    {
      label: `Pending Submissions (${playerPendingSubmissions.length})`,
      icon: <i className="fas fa-hourglass-half"></i>,
      content: (
        <Card>
          {playerPendingSubmissions.length > 0 ? (
            <ul className="space-y-2">
              {playerPendingSubmissions.map(sub => (
                <li key={sub.id} className="text-sm text-gray-300 p-2 bg-dark-bg rounded">
                  <span className="font-semibold">{sub.type.replace(/([A-Z])/g, ' $1').trim()}:</span> Submitted on {sub.submissionDate.toLocaleDateString()} - Status: {sub.status}
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-400">No pending submissions.</p>}
        </Card>
      )
    },
  ];

  const hasSocialLinks = player.socialLinks && Object.values(player.socialLinks).some(link => !!link);
  
  const displayCustomBanner = player.canSetCustomBanner && player.customProfileBannerUrl && player.customProfileBannerUrl.trim() !== "";


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-6">
      <div className="lg:col-span-8 space-y-6">
        {/* Profile Header Card */}
        <Card className="!bg-dark-surface relative overflow-hidden" noPadding>
          <div className="relative h-60 md:h-72 w-full">
            {displayCustomBanner ? (
              <div
                className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center filter brightness-75"
                style={{ backgroundImage: `url(${player.customProfileBannerUrl})` }}
                aria-hidden="true"
              ></div>
            ) : (
              <div
                className="absolute inset-0 z-0 bg-black"
                aria-hidden="true"
              ></div>
            )}

            <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start">
              <RobloxAvatar
                customAvatarUrl={player.customAvatarUrl}
                robloxId={player.robloxId}
                username={player.username}
                size={96} 
                className="rounded-full border-4 border-black shadow-lg mb-2" 
                isVerifiedPlayer={player.isVerifiedPlayer}
              />
              <div className="flex flex-col items-start min-w-0 text-left">
                <div className="flex items-center space-x-2 mb-0.5">
                  {usernameIconClass && <i className={`${usernameIconClass} ${usernameClasses.split(' ').filter(c => c.startsWith('text-') || c.startsWith('bg-')).join(' ')} text-xl md:text-2xl`}></i>}
                  <h1 className={`${usernameClasses} text-shadow-lg`}>{player.username}</h1>
                </div>
                {playerClan && (
                  <p className="text-xs text-gray-100 mb-0.5 truncate text-shadow-sm">
                    Clan: <Link to={`/clans/${playerClan.id}`} className="font-semibold text-brand-accent hover:underline">[{playerClan.tag}] {playerClan.name}</Link>
                  </p>
                )}
                <div className="text-xs text-gray-100 space-y-0 text-shadow-sm">
                  {player.pronouns && <p className="truncate">{player.pronouns}</p>}
                  {player.location && <p className="flex items-center truncate"><i className="fas fa-map-marker-alt mr-1.5 text-gray-300"></i>{player.location}</p>}
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 z-20 flex space-x-2">
              {isOwnProfile && <Button variant="primary" size="sm" onClick={() => setIsEditModalOpen(true)} leftIcon={<i className="fas fa-pencil-alt"/>}>Edit</Button>}
              {!isOwnProfile && currentUser && isStaff && <Button variant="secondary" size="sm" onClick={handleMessagePlayer} leftIcon={<i className="fas fa-envelope"/>}>Message</Button>}
            </div>
          </div>
        </Card>

        <Card title="About Me" titleIcon={<i className="fas fa-user-edit"/>} className="bg-dark-surface">
            {player.bio ? (
                <div className="prose prose-invert prose-sm max-w-none text-gray-300"><ReactMarkdown>{player.bio}</ReactMarkdown></div>
            ) : <p className="text-gray-400">This player hasn't added a bio yet.</p>}
        </Card>

        {hasSocialLinks && (
          <Card title="Connections" titleIcon={<i className="fas fa-link"/>} className="bg-dark-surface" contentClassName="!p-3">
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(player.socialLinks || {}).map(([key, value]) => {
                const def = SOCIAL_LINK_DEFINITIONS[key as keyof typeof SOCIAL_LINK_DEFINITIONS];
                if (value && def) {
                  const fullUrl = def.prefix && !value.startsWith('http') && key !== 'discord' ? `${def.prefix}${value}` : value;
                  return (
                    <Tooltip key={key} text={`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`} position="top">
                        <a 
                            href={key === 'discord' ? '#' : (value.startsWith('http') ? value : fullUrl) }
                            target={key === 'discord' ? '_self' : '_blank'} 
                            rel="noopener noreferrer" 
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-150 bg-dark-bg border border-dark-border hover:border-gray-600`}
                        >
                        <i className={`${def.icon} ${def.color} text-xl`}></i>
                        <span className="text-xs text-gray-300 hidden sm:inline">{value}</span>
                        </a>
                    </Tooltip>
                  );
                }
                return null;
              })}
            </div>
          </Card>
        )}

        <Card className="bg-dark-surface" noPadding>
          <div className="border-t border-dark-border px-2 bg-dark-surface/80 backdrop-blur-sm rounded-b-lg">
             <Tabs tabs={profileTabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills"/>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <Card title={`Quick Info`} titleIcon={<i className="fas fa-id-card"/>}>
          <div className="space-y-1.5 text-sm text-gray-300">
            <div className="flex justify-between items-center">
              <span>Collection Rank:</span>
              {playerCollectionRank && (
                 <Tooltip text={`${playerCollectionRank.name}: ${playerCollectionRank.description}`} position="left">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-1 w-14 h-14">
                            <img src={playerCollectionRank.imageUrl} alt={playerCollectionRank.name} className="w-14 h-14 object-contain" />
                            {showSparkles && sparkles.map(s => <SparkleParticle key={s.id} id={s.id} style={s.style} onAnimationEnd={handleSparkleAnimationEnd} />)}
                        </div>
                        <span className="font-medium text-xs">{playerCollectionRank.name}</span>
                    </div>
                 </Tooltip>
              )}
            </div>
            <div className="flex justify-between"><span>Collection Score:</span> <span className="font-medium text-brand-accent">{playerBadgePoints.toLocaleString()} pts</span></div>
            <div className="flex justify-between"><span>Tier:</span> <TierBadge tier={player.tier} size="sm" /></div>
            <div className="flex justify-between"><span>Joined:</span> <span className="font-medium">{formatTimeAgo(player.joinedDate)}</span></div>
            <div className="flex justify-between"><span>Last Online:</span> <span className="font-medium">{formatTimeAgo(player.lastActive)}</span></div>
            <div className="flex justify-between"><span>Records Held:</span> <span className="font-medium">{playerRecords.length}</span></div>
            {player.isVerifiedPlayer && <div className="flex justify-between text-green-400"><span>Status:</span> <span className="font-medium flex items-center"><i className="fas fa-check-circle mr-1"></i>Verified Player</span></div>}
          </div>
        </Card>

        <Card title="Badges Earned" titleIcon={<i className="fas fa-medal"/>}>
            {player.badges.length > 0 ? (
                <UserBadgesList // UserBadgesList itself will filter for visible badges
                    badgeIds={player.badges}
                    maxVisible={10}
                    onClick={() => {
                        setViewingPlayerBadgesInfo({ username: player.username, badgeIds: player.badges });
                        setIsViewAllBadgesModalOpen(true);
                    }}
                />
            ) : <p className="text-sm text-gray-400">No badges earned yet.</p>}
        </Card>
      </div>

      {isEditModalOpen && isOwnProfile && player && (
        <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} player={player}/>
      )}

      {viewingPlayerBadgesInfo && (
        <ViewAllBadgesModal // ViewAllBadgesModal will filter for visible badges
            isOpen={isViewAllBadgesModalOpen}
            onClose={() => {
                setIsViewAllBadgesModalOpen(false);
                setViewingPlayerBadgesInfo(null);
            }}
            username={viewingPlayerBadgesInfo.username}
            badgeIds={viewingPlayerBadgesInfo.badgeIds}
        />
      )}
    </div>
  );
};
