

import React, { useMemo } from 'react';
import { Player, WorldRecord, WorldRecordType, TierLevel, LeaderboardCategory } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card } from '../ui/Card';
import { Link } from 'react-router-dom';
import { RobloxAvatar } from '../ui/RobloxAvatar';
import { TierBadge } from './TierBadge';
import { getCategoryFromWorldRecordType } from '../../constants';

interface OverallPlayerScore {
  player: Player;
  overallScore: number;
  // Optional: For detailed breakdown display later
  // breakdown: Record<WorldRecordType, { rank: number, points: number, value: number } | undefined>;
}

const getPlacementPoints = (rank: number): number => {
  if (rank === 1) return 100;
  if (rank === 2) return 75;
  if (rank === 3) return 60;
  if (rank >= 4 && rank <= 5) return 50;
  if (rank >= 6 && rank <= 10) return 30;
  if (rank >= 11 && rank <= 25) return 15;
  if (rank >= 26 && rank <= 50) return 5;
  return 0;
};

export const OverallLeaderboardPage: React.FC = () => {
  const { players: allPlayers, worldRecords: allWorldRecords, loading, leaderboardWeights } = useAppContext();

  const overallLeaderboardData = useMemo((): OverallPlayerScore[] => {
    if (loading || !allPlayers.length || !allWorldRecords.length) {
      return [];
    }

    const verifiedRecords = allWorldRecords.filter(r => r.isVerified);
    const recordTypes = [...new Set(verifiedRecords.map(r => r.type))];
    
    const playerScores: Record<string, { totalPoints: number; /* breakdown: OverallPlayerScore['breakdown'] */ }> = {};

    allPlayers.forEach(p => {
        playerScores[p.id] = { totalPoints: 0, /* breakdown: {} as OverallPlayerScore['breakdown'] */ };
    });

    recordTypes.forEach(type => {
      const recordsForType = verifiedRecords.filter(r => r.type === type);
      
      const playerBestScores: Array<{ playerId: string; value: number }> = [];
      const playerRecordsMap: Record<string, WorldRecord[]> = {};

      recordsForType.forEach(r => {
        if (!playerRecordsMap[r.playerId]) playerRecordsMap[r.playerId] = [];
        playerRecordsMap[r.playerId].push(r);
      });

      Object.keys(playerRecordsMap).forEach(playerId => {
        const records = playerRecordsMap[playerId];
        records.sort((a, b) => type.toLowerCase().includes('speed') || type === WorldRecordType.LONGEST_SURVIVAL_ANY ? a.value - b.value : b.value - a.value);
        if (records.length > 0) {
          playerBestScores.push({ playerId, value: records[0].value });
        }
      });

      playerBestScores.sort((a, b) => type.toLowerCase().includes('speed') || type === WorldRecordType.LONGEST_SURVIVAL_ANY ? a.value - b.value : b.value - a.value);
      
      playerBestScores.forEach((scoreEntry, index) => {
        const rank = index + 1;
        const basePoints = getPlacementPoints(rank);
        const recordCategory = getCategoryFromWorldRecordType(type);
        let weightedPoints = 0;

        if (recordCategory && leaderboardWeights[recordCategory] !== undefined) {
          weightedPoints = basePoints * (leaderboardWeights[recordCategory] / 100);
        } else if (recordCategory) {
          // This case should ideally not be hit if leaderboardWeights is comprehensive for SPEED, ECONOMY, COSMETICS
          console.warn(`Weight definition missing for category: ${recordCategory} (for WR type ${type}). This category contributes 0 points to overall score.`);
          weightedPoints = 0;
        }
        // If recordCategory is null (e.g., LONGEST_SURVIVAL_ANY), weightedPoints remains 0 as it's not mapped to a weighted category.
        
        if (playerScores[scoreEntry.playerId] && weightedPoints > 0) {
          playerScores[scoreEntry.playerId].totalPoints += weightedPoints;
          // For detailed breakdown if needed later:
          // playerScores[scoreEntry.playerId].breakdown[type] = { rank, points: weightedPoints, value: scoreEntry.value };
        }
      });
    });

    return Object.entries(playerScores)
      .map(([playerId, scoreData]) => {
        const player = allPlayers.find(p => p.id === playerId);
        if (!player) return null; 
        return {
          player,
          overallScore: scoreData.totalPoints,
          // breakdown: scoreData.breakdown,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.overallScore - a!.overallScore) as OverallPlayerScore[];

  }, [allPlayers, allWorldRecords, loading, leaderboardWeights]);

  const getRankRowStyling = (rank: number): string => {
    if (rank === 1) return "bg-tier1/20 border-l-4 border-tier1"; // Gold
    if (rank === 2) return "bg-tier2/20 border-l-4 border-tier2"; // Silver
    if (rank === 3) return "bg-tier3/20 border-l-4 border-tier3"; // Bronze
    return "hover:bg-gray-800/30";
  };

  const getRankNumberStyling = (rank: number): string => {
    if (rank === 1) return "text-tier1 font-extrabold text-shadow-glow";
    if (rank === 2) return "text-tier2 font-bold text-shadow-glow";
    if (rank === 3) return "text-tier3 font-semibold text-shadow-glow";
    return "text-gray-400";
  }

  if (loading && !overallLeaderboardData.length) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner size="lg" text="Calculating Overall Rankings..."/></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4 text-center">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Overall Player Rankings</h1>
          <p className="text-sm text-gray-400">
            Players are ranked based on points earned from their placements in verified world records.
            Points are weighted by category (Speed: {leaderboardWeights.Speed}%, Economy: {leaderboardWeights.Economy}%, Cosmetics: {leaderboardWeights.Cosmetics}%).
            Base points: 1st: 100, 2nd: 75, 3rd: 60, Top 5: 50, Top 10: 30, Top 25: 15, Top 50: 5.
            World records not falling into these three main categories do not contribute to this weighted score.
          </p>
        </div>
      </Card>

      <Card noPadding>
        <div className="grid grid-cols-[50px_1fr_100px_150px] gap-x-4 p-3 border-b border-dark-border bg-dark-surface rounded-t-lg sticky top-0 z-10">
          <div className="text-xs font-semibold text-gray-400 uppercase pl-2">Rank</div>
          <div className="text-xs font-semibold text-gray-400 uppercase">Player</div>
          <div className="text-xs font-semibold text-gray-400 uppercase text-center">Tier</div>
          <div className="text-xs font-semibold text-gray-400 uppercase text-right pr-2">Overall Score</div>
        </div>
        
        {loading && overallLeaderboardData.length === 0 && <div className="p-6"><LoadingSpinner text="Updating Overall Leaderboard..."/></div>}

        {!loading && overallLeaderboardData.filter(d => d.overallScore > 0).length > 0 && (
          <div className="divide-y divide-dark-border">
            {overallLeaderboardData.filter(d => d.overallScore > 0).slice(0, 100).map((data, index) => { // Display top 100 with scores > 0
              const rank = index + 1;
              return (
              <div key={data.player.id} className={`grid grid-cols-[50px_1fr_100px_150px] gap-x-4 p-3 items-center transition-colors duration-150 ${getRankRowStyling(rank)}`}>
                <div className={`text-lg font-medium pl-2 ${getRankNumberStyling(rank)}`}>{rank}.</div>
                <div className="flex items-center space-x-3">
                    <RobloxAvatar 
                        robloxId={data.player.robloxId} 
                        username={data.player.username} 
                        size={36} 
                        customAvatarUrl={data.player.customAvatarUrl}
                        isVerifiedPlayer={data.player.isVerifiedPlayer} 
                    />
                    <div>
                        <Link to={`/profile/${data.player.id}`} className="text-sm font-semibold text-gray-100 hover:text-brand-primary">{data.player.username}</Link>
                        <p className="text-xs text-gray-500">ID: {data.player.robloxId}</p>
                    </div>
                </div>
                <div className="text-center"><TierBadge tier={data.player.tier} size="xs"/></div>
                <div className="text-lg text-gray-100 font-bold text-right pr-2">
                    {data.overallScore.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} pts
                </div>
              </div>
            )})}
          </div>
        )}
        {!loading && overallLeaderboardData.filter(d => d.overallScore > 0).length === 0 && (
          <p className="text-center text-gray-500 text-md py-12">No players have scores for the Overall Leaderboard yet, or no verified records exist to calculate scores based on current weights.</p>
        )}
      </Card>
    </div>
  );
};