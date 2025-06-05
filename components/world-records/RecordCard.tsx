
import React from 'react';
import { WorldRecord, Player, WorldRecordType, LeaderboardCategory } from '../../types';
import { RobloxAvatar } from '../ui/RobloxAvatar';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface RecordCardProps {
  record: WorldRecord;
  player?: Player;
}

const formatRecordValue = (type: WorldRecord['type'], value: number): string => {
    if (type.startsWith(LeaderboardCategory.SPEED) || type === WorldRecordType.LONGEST_SURVIVAL_ANY) {
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
    }
    if (type === WorldRecordType.ECONOMY_MONEY_MATCH) {
        return `$${value.toLocaleString()}`;
    }
    if (type === WorldRecordType.ECONOMY_POINTS_MATCH) {
        return `${value.toLocaleString()} pts`;
    }
    if (type === WorldRecordType.COSMETICS_UNUSUALS_TOTAL || type === WorldRecordType.COSMETICS_ACCESSORIES_TOTAL) {
        return `${value.toLocaleString()} items`;
    }
    return value.toString();
  };

const getRecordIcon = (type: WorldRecordType) => {
    if (type.startsWith(LeaderboardCategory.SPEED)) return "fas fa-stopwatch";
    if (type.startsWith(LeaderboardCategory.ECONOMY)) return "fas fa-coins";
    if (type.startsWith(LeaderboardCategory.COSMETICS)) return "fas fa-gem";
    if (type === WorldRecordType.LONGEST_SURVIVAL_ANY) return "fas fa-shield-alt";
    return "fas fa-trophy";
}

export const RecordCard: React.FC<RecordCardProps> = ({ record, player }) => {
  const displayType = record.type.replace(/-/g, ' '); 

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg shadow-sm p-3 hover:border-gray-600 transition-colors duration-200 flex flex-col h-full">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm font-semibold text-brand-accent truncate flex items-center" title={displayType}>
            <i className={`${getRecordIcon(record.type)} mr-1.5 text-xs opacity-70`}></i>
            {displayType}
        </h4>
        {record.region && (
          <span className="text-[10px] bg-gray-700/70 text-gray-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">{record.region}</span>
        )}
      </div>
      
      <p className="text-xl font-bold text-gray-100 mb-2">{formatRecordValue(record.type, record.value)}</p>

      {player && (
        <Link to={`/profile/${player.id}`} className="flex items-center space-x-2 mb-2 group">
          <RobloxAvatar robloxId={player.robloxId} username={player.username} size={28} className="border-none"/>
          <div>
            <p className="text-xs font-medium text-gray-300 group-hover:text-brand-primary truncate">{player.username}</p>
          </div>
        </Link>
      )}
      
      <div className="text-[10px] text-gray-500 mb-2.5 flex-grow">
        Set on: {record.timestamp.toLocaleDateString()}
        {!record.isVerified && <span className="ml-1 text-yellow-500">(Pending)</span>}
      </div>

      <a href={record.proofUrl} target="_blank" rel="noopener noreferrer" className="mt-auto">
        <Button variant="outline" size="xs" className="w-full border-gray-700 hover:border-gray-500" leftIcon={<i className="fas fa-video"></i>}>
          View Proof
        </Button>
      </a>
    </div>
  );
};
