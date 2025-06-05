
import React, { useState, useEffect } from 'react';
import { WorldRecord, Player, WorldRecordType, LeaderboardCategory } from '../../types';
import { RobloxAvatar } from '../ui/RobloxAvatar';
import { Link } from 'react-router-dom';
import { TierBadge } from '../leaderboard/TierBadge';
import { UserBadgesList } from '../badges/UserBadgesList';
import { SparkleParticle } from '../effects/SparkleParticle';
import { Tooltip } from '../ui/Tooltip';
import { Button } from '../ui/Button';

interface WRPlayerCardProps {
  record: WorldRecord;
  player: Player;
  isActive: boolean;
  isPreview?: boolean;
  index: number; 
}

const formatRecordValueDisplay = (type: WorldRecord['type'], value: number): string => {
  if (type.startsWith(LeaderboardCategory.SPEED) || type === WorldRecordType.LONGEST_SURVIVAL_ANY) {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    const ms = Math.floor((value - Math.floor(value)) * 1000); 
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s` + (ms > 0 ? `.${ms.toString().padStart(3, '0')}`.slice(0,3) : ''); 
  }
  if (type.startsWith(LeaderboardCategory.COSMETICS)) return `${value.toLocaleString()} items`;
  return value.toString();
};

const getRecordIconClass = (type: WorldRecordType): string => {
  if (type.startsWith(LeaderboardCategory.SPEED)) return "fas fa-stopwatch";
  if (type.startsWith(LeaderboardCategory.COSMETICS)) return "fas fa-gem";
  if (type === WorldRecordType.LONGEST_SURVIVAL_ANY) return "fas fa-shield-alt";
  return "fas fa-trophy";
};

const getRecordMode = (type: WorldRecordType): string | null => {
    if (type.includes(LeaderboardCategory.SPEED)) {
        if (type.includes("Normal")) return "Normal Mode";
        if (type.includes("Glitched")) return "Glitched Mode";
    }
    return null;
}

const BACKGROUND_VARIANTS = [
  'animated-gradient-bg',           
  'animated-gradient-bg-variant1',  
  'animated-gradient-bg-variant2',  
];

export const WRPlayerCard: React.FC<WRPlayerCardProps> = ({ record, player, isActive, isPreview = false, index }) => {
  const [sparkles, setSparkles] = useState<Array<{ id: string; style: React.CSSProperties }>>([]);
  const [showStatPulse, setShowStatPulse] = useState(false);

  useEffect(() => {
    let sparkleInterval: NodeJS.Timeout | undefined;
    if (isActive && !isPreview) {
      setShowStatPulse(true);
      sparkleInterval = setInterval(() => {
        if (sparkles.length < (isPreview ? 5 : 20)) { 
          const newSparkle: { id: string; style: React.CSSProperties } = {
            id: `sparkle-${Date.now()}-${Math.random()}`,
            style: {
              top: `${Math.random() * 100 - 20}%`, 
              left: `${Math.random() * 100 - 20}%`,
              animationDelay: `${Math.random() * 0.4}s`,
              transform: `scale(${Math.random() * 0.7 + (isPreview ? 0.4 : 0.7)}) rotate(${Math.random() * 360}deg)`,
            },
          };
          setSparkles(prev => [...prev, newSparkle]);
        }
      }, isPreview ? 800 : 300); 
    } else {
      setShowStatPulse(false);
      setSparkles([]); 
    }
    return () => {
      if (sparkleInterval) clearInterval(sparkleInterval);
    };
  }, [isActive, isPreview, sparkles.length]);

  const handleSparkleAnimationEnd = (id: string) => {
    setSparkles(prev => prev.filter(s => s.id !== id));
  };
  
  const typeParts = record.type.split(" - ");
  const mainCategory = typeParts[0]; 
  const subCategory = typeParts[1]; 
  const mapName = typeParts.length === 3 && mainCategory === LeaderboardCategory.SPEED ? typeParts[2] : null;
  
  const recordTitle = `${mainCategory} - ${subCategory}`;
  const recordMode = getRecordMode(record.type);

  const avatarSize = isPreview ? 80 : 128;
  const selectedBgClass = BACKGROUND_VARIANTS[index % BACKGROUND_VARIANTS.length];

  return (
    <div 
      className={`relative w-full h-full aspect-[10/16] max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col
                  border-2 transition-all duration-300 ease-in-out group diagonal-stripes
                  ${isActive && !isPreview ? 'shadow-wr-card-active border-pink-500 animate-card-glow' : 'border-purple-600/70 shadow-wr-card-subtle-glow'}
                  ${isPreview ? 'cursor-default' : 'cursor-pointer transform hover:scale-[1.01]'}
                  ${selectedBgClass}`}
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        {sparkles.map(s => (
          <SparkleParticle key={s.id} id={s.id} style={s.style} onAnimationEnd={handleSparkleAnimationEnd} color="bg-pink-300" size={isPreview ? "w-1.5 h-1.5" : "w-2.5 h-2.5"} />
        ))}
      </div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 py-1.5 px-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-b-lg shadow-lg z-20">
        <p className="text-black font-bold text-[10px] sm:text-xs uppercase tracking-wider text-center">
          <i className="fas fa-trophy mr-1"></i>World Record Holder
        </p>
      </div>

      <div className="relative z-10 flex flex-col h-full pt-10 p-3 sm:p-4"> 
        
        <div className="flex flex-col items-center text-center mb-2 sm:mb-3">
            <div className={`relative p-1 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-xl mb-2 w-${avatarSize/4} h-${avatarSize/4} sm:w-${avatarSize/3.5} sm:h-${avatarSize/3.5}`}>
                <RobloxAvatar 
                    robloxId={player.robloxId} 
                    username={player.username} 
                    customAvatarUrl={player.customAvatarUrl} 
                    size={avatarSize - (isPreview ? 8:12)} 
                    className="rounded-md"
                    isVerifiedPlayer={player.isVerifiedPlayer}
                />
                <div className="absolute -top-2 -right-2 z-10">
                    <TierBadge tier={player.tier} size={isPreview ? 'xs' : 'sm'} />
                </div>
            </div>
            <Link to={`/profile/${player.id}`}>
                <h2 className={`text-lg sm:text-xl font-bold text-white text-shadow-glow group-hover:text-yellow-300 transition-colors ${isActive ? 'text-yellow-200' : ''}`}>{player.username}</h2>
            </Link>
            <div className="mt-1 scale-75 sm:scale-90"> 
                <UserBadgesList badgeIds={player.badges} maxVisible={isPreview ? 2 : 3} />
            </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center text-center my-2 sm:my-3">
            <Tooltip text={record.type} position="top">
                <p className="text-xs sm:text-sm font-semibold text-purple-200/90 flex items-center justify-center">
                    <i className={`${getRecordIconClass(record.type)} mr-1.5 text-xs sm:text-sm`}></i>
                    {recordTitle}
                </p>
            </Tooltip>
            {mapName && <p className="text-[10px] sm:text-xs text-purple-300/80">Map: {mapName}</p>}
            <p 
                className={`text-4xl sm:text-5xl md:text-6xl font-black text-white my-1 sm:my-1.5 tracking-tighter text-shadow-lg ${showStatPulse ? 'animate-stat-pulse' : ''}`}
                onAnimationEnd={() => setShowStatPulse(false)}
            >
                {formatRecordValueDisplay(record.type, record.value)}
            </p>
            {recordMode && <p className="text-[10px] sm:text-xs font-medium text-pink-300/90 bg-black/20 px-1.5 py-0.5 rounded-full">{recordMode}</p>}
        </div>

        <div className="mt-auto text-center border-t border-purple-500/30 pt-2 sm:pt-3">
          <div className="flex justify-between items-center text-[10px] sm:text-xs text-purple-300/70 mb-1.5 sm:mb-2">
            <span>Set: {new Date(record.timestamp).toLocaleDateString()}</span>
            {record.region && <span>Region: {record.region}</span>}
          </div>
          <a href={record.proofUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
            <Button variant="outline" size="xs" className="w-full border-pink-400/50 hover:border-pink-300 text-pink-300 hover:text-pink-200 hover:bg-pink-500/20 !py-1 sm:!py-1.5">
                <i className="fas fa-video mr-1.5"></i>View Proof
            </Button>
          </a>
          {!record.isVerified && <p className="text-[9px] text-yellow-400 mt-1">(Pending Verification)</p>}
        </div>
      </div>
    </div>
  );
};