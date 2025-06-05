import React from 'react';
import { Clan } from '../../types';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface ClanCardProps {
  clan: Clan;
}

export const ClanCard: React.FC<ClanCardProps> = ({ clan }) => {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg shadow-sm overflow-hidden hover:border-gray-600 transition-colors duration-200 flex flex-col h-full">
      {clan.bannerUrl && (
        <img src={clan.bannerUrl} alt={`${clan.name} banner`} className="w-full h-24 object-cover" />
      )}
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-md font-semibold text-gray-100 truncate" title={clan.name}>{clan.name} [{clan.tag}]</h3>
          {clan.isVerified && (
            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full flex items-center whitespace-nowrap">
              <i className="fas fa-check-circle mr-1"></i>Verified
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 space-y-0.5 mb-2">
            <p>Members: {clan.memberCount}</p>
            <p>Activity: <span className={clan.activityStatus === "Active" ? "text-green-400" : clan.activityStatus === "Recruiting" ? "text-yellow-400" : "text-red-400"}>{clan.activityStatus}</span></p>
        </div>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-grow min-h-[30px]">{clan.description.replace(/##+\s*/g, '').replace(/\*\*/g, '')}</p>
        <Link to={`/clans/${clan.id}`} className="mt-auto">
          <Button variant="outline" size="sm" className="w-full border-gray-700 hover:border-gray-500">
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};