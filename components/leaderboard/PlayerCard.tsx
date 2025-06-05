

import React from 'react';
import { Player } from '../../types';
import { TIER_STYLES } from '../../constants';
import { RobloxAvatar } from '../ui/RobloxAvatar';
import { TierBadge } from './TierBadge';
import { UserBadgesList } from '../badges/UserBadgesList';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

interface PlayerCardProps {
  player: Player;
  rank?: number;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, rank }) => {
  const tierStyle = TIER_STYLES[player.tier];
  const { clans } = useAppContext();
  const playerClan = clans.find(c => c.id === player.clanId);

  const formatTime = (seconds: number): string => {
    if (seconds === 0 || !seconds) return "-";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec < 10 ? '0' : ''}${sec}s`;
  };
  
  const formatNumber = (num: number): string => {
    return num > 0 ? num.toLocaleString() : (num === 0 ? "0" : "-");
  }

  return (
    <Link 
        to={`/profile/${player.id}`} 
        className={`block bg-dark-surface border border-dark-border rounded-lg p-3 hover:bg-gray-800/50 transition-colors duration-150 ${tierStyle.cardClass.replace('border-tier1','border-l-4 border-l-tier1').replace('border-tier2','border-l-4 border-l-tier2').replace('border-tier3','border-l-4 border-l-tier3')} ${TIER_STYLES[player.tier].glowClass ? TIER_STYLES[player.tier].glowClass + ' shadow-md' : 'shadow-sm'}`}
    >
      <div className="flex items-center space-x-3">
        {rank && <div className="text-xl font-semibold text-gray-400 w-6 text-center">{rank}</div>}
        <RobloxAvatar robloxId={player.robloxId} username={player.username} customAvatarUrl={player.customAvatarUrl} size={48} className="border-none"/>
        <div className="flex-grow">
          <div className="flex items-baseline space-x-2 mb-0.5">
            <h3 className="text-base font-semibold text-gray-100 group-hover:text-brand-primary">{player.username}</h3>
            <TierBadge tier={player.tier} size="xs" />
          </div>
          <div className="flex items-center space-x-2">
            <UserBadgesList badgeIds={player.badges} maxVisible={3} />
            {playerClan && (
                <Link to={`/clans/${playerClan.id}`} onClick={(e)=> e.stopPropagation()} className="text-xs bg-gray-700/70 px-1.5 py-0.5 rounded text-gray-400 hover:bg-gray-600 hover:text-gray-200">
                  [{playerClan.tag}]
                </Link>
            )}
          </div>
        </div>
        <div className="text-right space-y-0.5 min-w-[100px]">
          <p className="text-xs text-gray-400">
            <i className="fas fa-stopwatch mr-1 opacity-60"></i>{formatTime(player.stats.speedNormal)} (N)
          </p>
          <p className="text-xs text-gray-400">
            <i className="fas fa-gem mr-1 opacity-60"></i>{formatNumber(player.stats.cosmeticsUnusuals)} (U)
          </p>
        </div>
      </div>
    </Link>
  );
};