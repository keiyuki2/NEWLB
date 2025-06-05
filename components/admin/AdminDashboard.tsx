
import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { SubmissionStatus, TierLevel } from '../../types';
import { TIER_STYLES } from '../../constants'; // For tier names/colors

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  colorClass?: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass = 'text-brand-primary', subtext }) => (
  <div className="admin-stat-card flex items-start space-x-4">
    <div className={`p-3 rounded-lg admin-stat-card-icon`}>
      <i className={`${icon} text-2xl ${colorClass}`}></i>
    </div>
    <div>
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-100">{value}</p>
      {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
  </div>
);

const MiniStatCard: React.FC<{label: string, value: string | number, icon?: string, iconColor?: string}> = ({label, value, icon, iconColor = 'text-gray-400'}) => (
    <div className="bg-dark-bg p-3 rounded-lg flex items-center space-x-2 shadow-sm border border-dark-border">
        {icon && <i className={`${icon} ${iconColor} text-sm`}></i>}
        <span className="text-xs text-gray-400">{label}:</span>
        <span className="text-sm font-semibold text-gray-200">{value}</span>
    </div>
);


export const AdminDashboard: React.FC = () => {
  const { players, clans, worldRecords, submissions, badges } = useAppContext();

  const activeUsers = players.filter(p => new Date(p.lastActive).getTime() > Date.now() - (7 * 86400000)).length;
  const pendingSubmissionsCount = submissions.filter(s => s.status === SubmissionStatus.PENDING).length;
  const approvedSubmissionsCount = submissions.filter(s => s.status === SubmissionStatus.APPROVED).length;
  const rejectedSubmissionsCount = submissions.filter(s => s.status === SubmissionStatus.REJECTED).length;

  const tierDistribution = useMemo(() => {
    const distribution: Record<TierLevel, number> = {
      [TierLevel.T1]: 0, [TierLevel.T2]: 0, [TierLevel.T3]: 0, [TierLevel.T4]: 0, [TierLevel.T5]: 0,
    };
    players.forEach(p => {
      if (distribution[p.tier] !== undefined) {
        distribution[p.tier]++;
      }
    });
    return distribution;
  }, [players]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-100 mb-6">Admin Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Users" value={players.length} icon="fas fa-users" colorClass="text-sky-400"/>
        <StatCard title="Active Users (7d)" value={activeUsers} icon="fas fa-user-clock" colorClass="text-green-400"/>
        <StatCard title="Total Clans" value={clans.length} icon="fas fa-shield-alt" colorClass="text-purple-400"/>
        <StatCard title="Pending Submissions" value={pendingSubmissionsCount} icon="fas fa-inbox" colorClass={pendingSubmissionsCount > 0 ? "text-yellow-400" : "text-gray-400"}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Platform Content" titleIcon={<i className="fas fa-database text-indigo-400"/>} className="lg:col-span-1">
            <div className="space-y-3">
                <MiniStatCard label="World Records" value={worldRecords.length} icon="fas fa-trophy" iconColor="text-amber-400"/>
                <MiniStatCard label="Configured Badges" value={badges.length} icon="fas fa-medal" iconColor="text-yellow-500"/>
                <MiniStatCard label="Total Submissions" value={submissions.length} icon="fas fa-file-alt" iconColor="text-gray-400"/>
            </div>
        </Card>

        <Card title="Submission Statistics" titleIcon={<i className="fas fa-chart-pie text-teal-400"/>} className="lg:col-span-1">
            <div className="space-y-3">
                <MiniStatCard label="Approved" value={approvedSubmissionsCount} icon="fas fa-check-circle" iconColor="text-green-500"/>
                <MiniStatCard label="Rejected" value={rejectedSubmissionsCount} icon="fas fa-times-circle" iconColor="text-red-500"/>
                <MiniStatCard label="Pending" value={pendingSubmissionsCount} icon="fas fa-hourglass-half" iconColor="text-yellow-500"/>
            </div>
        </Card>
        
        <Card title="Tier Distribution" titleIcon={<i className="fas fa-layer-group text-pink-400"/>} className="lg:col-span-1">
          <div className="space-y-2">
            {Object.entries(tierDistribution).map(([tier, count]) => (
              <div key={tier} className="flex justify-between items-center text-sm p-1.5 bg-dark-bg rounded">
                <span className="font-medium" style={{ color: TIER_STYLES[tier as TierLevel]?.cardClass.includes('tier1') ? TIER_STYLES.T1.badgeClass.split(' ').find(c => c.startsWith('text-'))?.replace('text-', '#') || '#FFD700' : TIER_STYLES[tier as TierLevel]?.iconClass.split(' ').find(c => c.startsWith('text-'))?.replace('text-', '#') || '#ccc' }}>
                    <i className={`${TIER_STYLES[tier as TierLevel]?.iconClass || ''} mr-1.5`}></i>
                    {TIER_STYLES[tier as TierLevel]?.name.split(' - ')[0] || tier}
                </span>
                <span className="font-semibold text-gray-200">{count} players</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recent Activity (Placeholder)" titleIcon={<i className="fas fa-history text-gray-400"/>}>
        <p className="text-gray-500 text-center py-8">Dynamic activity feed coming soon.</p>
      </Card>
    </div>
  );
};