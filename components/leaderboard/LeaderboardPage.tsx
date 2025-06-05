
import React, { useState, useMemo, useEffect } from 'react';
import { Player, LeaderboardCategory, SpeedSubCategory, CosmeticsSubCategory, PlayerStats } from '../../types';
import { LeaderboardFilters, LeaderboardFiltersState } from './LeaderboardFilters';
import { useAppContext } from '../../contexts/AppContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card } from '../ui/Card';
import { Link } from 'react-router-dom';
import { RobloxAvatar } from '../ui/RobloxAvatar';
import { TierBadge } from './TierBadge';
import { SPEED_SUB_CATEGORIES_OPTIONS, COSMETICS_SUB_CATEGORIES_OPTIONS, MAP_FILTER_OPTIONS } from '../../constants';
import { Alert } from '../ui/Alert'; 

// Helper to format stat values
const formatStatValue = (value: number, category: LeaderboardCategory, subCategory: string | null): string => {
    if (value === 0 && (category === LeaderboardCategory.SPEED)) return "-"; 
    if (value === null || value === undefined) return "-";

    if (category === LeaderboardCategory.SPEED) {
        return `${value}s`;
    }
    return value.toLocaleString();
};


export const LeaderboardPage: React.FC = () => {
  const { players: allPlayers, loading } = useAppContext();
  
  const [filters, setFilters] = useState<LeaderboardFiltersState>({ 
    category: LeaderboardCategory.SPEED, 
    subCategory: SPEED_SUB_CATEGORIES_OPTIONS[0].value, 
    searchQuery: '',
    selectedMap: MAP_FILTER_OPTIONS[0].value,
  });

  const itemsToDisplay = 100; 

  useEffect(() => { 
    let subCatToSet: SpeedSubCategory | CosmeticsSubCategory | null = null;
    let mapToSet = filters.selectedMap;

    if (filters.category === LeaderboardCategory.SPEED) {
      subCatToSet = filters.subCategory as SpeedSubCategory || SPEED_SUB_CATEGORIES_OPTIONS[0].value;
      mapToSet = filters.selectedMap || MAP_FILTER_OPTIONS[0].value;
    } else if (filters.category === LeaderboardCategory.COSMETICS) {
      subCatToSet = filters.subCategory as CosmeticsSubCategory || COSMETICS_SUB_CATEGORIES_OPTIONS[0].value;
      mapToSet = ''; 
    } else {
      mapToSet = '';
    }
    
    if (filters.subCategory !== subCatToSet || filters.selectedMap !== mapToSet) {
        setFilters(f => ({ ...f, subCategory: subCatToSet, selectedMap: mapToSet }));
    }

  }, [filters.category, filters.subCategory, filters.selectedMap]);


  const handleFilterChange = <K extends keyof LeaderboardFiltersState>(key: K, value: LeaderboardFiltersState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleApplyFilters = () => {
    console.log("Applying filters:", filters);
  };

  const handleRefresh = () => {
    console.log("Refreshing leaderboard data...");
    const currentCategory = filters.category;
    setFilters(f => ({...f, category: LeaderboardCategory.COSMETICS})); 
    setTimeout(() => setFilters(f => ({...f, category: currentCategory})), 50); 
  };


  const filteredAndSortedPlayers = useMemo(() => {
    if (!filters.category || !filters.subCategory) return []; 

    let result = [...allPlayers];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.username.toLowerCase().includes(query) ||
        p.robloxId.toLowerCase().includes(query)
      );
    }
    
    result.sort((a, b) => {
      const statsA = a.stats;
      const statsB = b.stats;

      switch (filters.category) {
        case LeaderboardCategory.SPEED:
          if (filters.subCategory === SpeedSubCategory.NORMAL) return (statsA.speedNormal || Infinity) - (statsB.speedNormal || Infinity);
          if (filters.subCategory === SpeedSubCategory.GLITCHED) return (statsA.speedGlitched || Infinity) - (statsB.speedGlitched || Infinity);
          break;
        case LeaderboardCategory.COSMETICS:
          if (filters.subCategory === CosmeticsSubCategory.UNUSUALS) return (statsB.cosmeticsUnusuals || 0) - (statsA.cosmeticsUnusuals || 0);
          if (filters.subCategory === CosmeticsSubCategory.ACCESSORIES) return (statsB.cosmeticsAccessories || 0) - (statsA.cosmeticsAccessories || 0);
          break;
        default: 
          return (a.stats.speedNormal || Infinity) - (b.stats.speedNormal || Infinity); 
      }
      return 0; 
    });

    return result.slice(0, itemsToDisplay);
  }, [allPlayers, filters, itemsToDisplay]);

  const getStatToDisplay = (playerStats: PlayerStats): number => {
    switch (filters.category) {
      case LeaderboardCategory.SPEED:
        return filters.subCategory === SpeedSubCategory.NORMAL ? playerStats.speedNormal : playerStats.speedGlitched;
      case LeaderboardCategory.COSMETICS:
        return filters.subCategory === CosmeticsSubCategory.UNUSUALS ? playerStats.cosmeticsUnusuals : playerStats.cosmeticsAccessories;
      default:
        return playerStats.speedNormal; 
    }
  };

  const mainStatHeader = filters.subCategory ? `${filters.category} (${filters.subCategory})` : filters.category;

  const getRankRowStyling = (rank: number): string => {
    if (rank === 1) return "bg-tier1/20 border-l-4 border-tier1"; 
    if (rank === 2) return "bg-tier2/20 border-l-4 border-tier2"; 
    if (rank === 3) return "bg-tier3/20 border-l-4 border-tier3"; 
    return "hover:bg-gray-800/30";
  };

  const getRankNumberStyling = (rank: number): string => {
    if (rank === 1) return "text-tier1 font-extrabold text-shadow-glow";
    if (rank === 2) return "text-tier2 font-bold text-shadow-glow";
    if (rank === 3) return "text-tier3 font-semibold text-shadow-glow";
    return "text-gray-400";
  }

  if (loading && !allPlayers.length) { 
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner size="lg"/></div>;
  }
   if (!filters.subCategory && !loading && filters.category) { 
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner text="Initializing filters..."/></div>;
  }

  return (
    <div className="space-y-6">
      
      <LeaderboardFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters} 
        onRefresh={handleRefresh}
      />

      {filters.category === LeaderboardCategory.SPEED && filters.selectedMap && filters.selectedMap !== "" && (
        <Alert type="info" title="Map-Specific Leaderboard Note">
          Map-specific filtering for player stats is currently under development due to data structure limitations. 
          The leaderboard below shows general <strong>{filters.subCategory}</strong> stats. 
          Map-specific submissions for <strong>{filters.selectedMap}</strong> are being collected and will be used for future dedicated map leaderboards.
        </Alert>
      )}

      <Card noPadding>
        <div className="overflow-x-auto">
          <div className="min-w-[700px] md:min-w-full"> 
            <div className="grid grid-cols-[50px_minmax(150px,1fr)_100px_120px_120px] gap-x-4 px-3 py-3 border-b border-dark-border bg-dark-surface rounded-t-lg sticky top-0 z-10">
              <div className="text-xs font-semibold text-gray-400 uppercase pl-1">Rank</div>
              <div className="text-xs font-semibold text-gray-400 uppercase">Player</div>
              <div className="text-xs font-semibold text-gray-400 uppercase text-center">Tier</div>
              <div className="text-xs font-semibold text-gray-400 uppercase text-right">{mainStatHeader}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase text-right pr-1">Last Active</div>
            </div>
            
            {loading && filteredAndSortedPlayers.length === 0 && <div className="p-6"><LoadingSpinner text="Updating leaderboard..."/></div>}

            {!loading && filteredAndSortedPlayers.length > 0 && (
              <div className="divide-y divide-dark-border">
                {filteredAndSortedPlayers.map((player, index) => {
                  const rank = index + 1;
                  return (
                  <div key={player.id} className={`grid grid-cols-[50px_minmax(150px,1fr)_100px_120px_120px] gap-x-4 px-3 py-3 items-center transition-colors duration-150 ${getRankRowStyling(rank)}`}>
                    <div className={`text-lg font-medium pl-1 ${getRankNumberStyling(rank)}`}>{rank}.</div>
                    <div className="flex items-center space-x-3">
                        <RobloxAvatar 
                            robloxId={player.robloxId} 
                            username={player.username} 
                            size={36} 
                            customAvatarUrl={player.customAvatarUrl}
                            isVerifiedPlayer={player.isVerifiedPlayer} 
                        />
                        <div className="overflow-hidden">
                            <Link to={`/profile/${player.id}`} className="text-sm font-semibold text-gray-100 hover:text-brand-primary truncate block">{player.username}</Link>
                            <p className="text-xs text-gray-500 truncate">ID: {player.robloxId}</p>
                        </div>
                    </div>
                    <div className="text-center"><TierBadge tier={player.tier} size="xs"/></div>
                    <div className="text-sm text-gray-300 text-right">
                        {formatStatValue(getStatToDisplay(player.stats), filters.category, filters.subCategory)}
                    </div>
                    <div className="text-sm text-gray-300 text-right pr-1">{player.lastActive.toLocaleDateString()}</div>
                  </div>
                )})}
              </div>
            )}
            {!loading && filteredAndSortedPlayers.length === 0 && (
              <p className="text-center text-gray-500 text-md py-12">No players found with the current filters.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};