
import React, { useState, useMemo } from 'react'; // Added useMemo
import { Tabs } from '../ui/Tabs';
import { AdminDashboard } from './AdminDashboard';
import { UserManagementSection } from './UserManagementSection';
import { SubmissionsQueueSection } from './SubmissionsQueueSection';
import { SiteSettingsSection } from './SiteSettingsSection'; 
import { UsernameColorTagManagementSection } from './UsernameColorTagManagementSection';
import { ManageBadgesSection } from './ManageBadgesSection';
import { ToolsSection } from './ToolsSection';
import { useAppContext } from '../../contexts/AppContext';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { LeaderboardManagementSection } from './LeaderboardManagementSection'; // New Import

export const AdminPanelPage: React.FC = () => {
  const { isAdmin, loading, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  if (!currentUser) { 
    return <Navigate to="/" replace />; 
  }
  if (!isAdmin) { 
    return (
        <div className="container mx-auto p-8 text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
            <p className="text-gray-300">You do not have permission to view this page.</p>
            <Navigate to="/" replace /> 
        </div>
    );
  }

  const adminTabs = useMemo(() => [ 
    { label: "Dashboard", icon: <i className="fas fa-tachometer-alt"></i>, content: <AdminDashboard /> },
    { label: "User Management", icon: <i className="fas fa-users-cog"></i>, content: <UserManagementSection /> },
    { label: "Submissions", icon: <i className="fas fa-inbox"></i>, content: <SubmissionsQueueSection /> },
    { label: "Manage Badges", icon: <i className="fas fa-tasks"></i>, content: <ManageBadgesSection /> },
    { label: "Leaderboard Mgmt", icon: <i className="fas fa-trophy"></i>, content: <LeaderboardManagementSection /> },
    { label: "Tools", icon: <i className="fas fa-tools"></i>, content: <ToolsSection /> },
    { label: "Username Tags", icon: <i className="fas fa-palette"></i>, content: <UsernameColorTagManagementSection /> },
    { label: "Site Settings", icon: <i className="fas fa-cogs"></i>, content: <SiteSettingsSection /> },
  ], []); 

  return (
    <div className="container mx-auto p-4 md:p-8 pb-20">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
        <i className="fas fa-user-shield mr-3"></i>Admin Panel
      </h1>
      <Tabs tabs={adminTabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills" />
    </div>
  );
};
