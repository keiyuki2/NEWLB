

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clan, Player } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { RobloxAvatar } from '../ui/RobloxAvatar';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UserBadgesList } from '../badges/UserBadgesList';
import ReactMarkdown from 'react-markdown'; // Added for Markdown support

export const ClanProfilePage: React.FC = () => {
  const { clanId } = useParams<{ clanId: string }>();
  const { clans, players: allPlayers, currentUser, isAdmin, toggleClanVerification, submitClanApplication } = useAppContext(); // Assuming submitClanApplication is added for joining

  const clan = clans.find(c => c.id === clanId);
  
  if (!clan) {
    return <div className="text-center text-red-500 text-xl py-10">Clan not found.</div>;
  }

  const leader = allPlayers.find(p => p.id === clan.leaderId);
  const members = clan.members.map(memberId => allPlayers.find(p => p.id === memberId)).filter(Boolean) as Player[];

  const isClanLeader = currentUser?.id === clan.leaderId;
  const isMember = clan.members.includes(currentUser?.id || '');

  // Basic Markdown rendering (no complex plugins for simplicity)
  const renderMarkdown = (text: string) => (
    <div className="prose prose-invert prose-sm max-w-none text-gray-300">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="relative mb-8">
        {clan.bannerUrl && (
          <img src={clan.bannerUrl} alt={`${clan.name} banner`} className="w-full h-48 md:h-64 object-cover rounded-xl shadow-lg" />
        )}
        <div className={`absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent ${clan.bannerUrl ? 'rounded-b-xl' : 'bg-dark-surface rounded-xl shadow-lg'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center">
                {clan.name} [{clan.tag}]
                {clan.isVerified && <i className="fas fa-check-circle text-blue-400 ml-2 text-2xl" title="Verified Clan"></i>}
              </h1>
              {leader && <p className="text-sm text-gray-300">Led by: <Link to={`/profile/${leader.id}`} className="hover:text-brand-primary">{leader.username}</Link></p>}
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
                {isAdmin && (
                    <Button variant={clan.isVerified ? "danger" : "primary"} size="sm" onClick={() => toggleClanVerification(clan.id, !clan.isVerified)}>
                        {clan.isVerified ? "Unverify" : "Verify Clan"}
                    </Button>
                )}
                {!isMember && currentUser && (
                    <Button variant="secondary" size="sm" onClick={() => alert(`Join request simulation for ${clan.name}. Implement submitClanApplication.`)}>
                        Request to Join
                    </Button>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info & Requirements */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Clan Information" titleIcon={<i className="fas fa-info-circle"/>}>
            <p><strong>Members:</strong> {clan.memberCount}</p>
            <p><strong>Activity:</strong> {clan.activityStatus}</p>
            <p><strong>Founded:</strong> {clan.foundedDate.toLocaleDateString()}</p>
            {clan.discordLink && (
              <p><strong>Discord:</strong> <a href={clan.discordLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{clan.discordLink}</a></p>
            )}
          </Card>
          <Card title="About Us" titleIcon={<i className="fas fa-scroll"/>}>
            {renderMarkdown(clan.description)}
          </Card>
          <Card title="Requirements to Join" titleIcon={<i className="fas fa-tasks"/>}>
            {renderMarkdown(clan.requirementsToJoin)}
          </Card>
        </div>

        {/* Right Column - Members & Forum (Conceptual) */}
        <div className="lg:col-span-2 space-y-6">
          <Card title={`Members (${members.length})`} titleIcon={<i className="fas fa-users"/>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {members.map(member => (
                <Link key={member.id} to={`/profile/${member.id}`} className="flex items-center space-x-3 p-2 bg-dark-bg rounded-lg hover:bg-gray-700 transition-colors">
                  <RobloxAvatar robloxId={member.robloxId} username={member.username} size={40} />
                  <div>
                    <p className="font-medium text-gray-100">{member.username}</p>
                    <UserBadgesList badgeIds={member.badges} maxVisible={2} />
                  </div>
                  {member.id === clan.leaderId && <i className="fas fa-crown text-yellow-400 ml-auto" title="Clan Leader"></i>}
                </Link>
              ))}
            </div>
          </Card>
          <Card title="Clan Forum / Announcements" titleIcon={<i className="fas fa-bullhorn"/>}>
            <p className="text-gray-400">
                {isClanLeader || isAdmin ? (
                    <Button size="sm" onClick={() => alert("Forum post creation UI would open here.")}>Create New Post</Button>
                ) : "View clan announcements and discussions here."}
            </p>
            {/* Placeholder for Forum Posts */}
            <div className="mt-4 space-y-3">
                <div className="p-3 bg-dark-bg rounded-lg">
                    <h4 className="font-semibold">Recruitment Drive!</h4>
                    <p className="text-xs text-gray-500">Posted by {leader?.username || 'Leader'} - {new Date(Date.now() - 86400000).toLocaleDateString()}</p>
                    <p className="text-sm mt-1">We are looking for active T3+ players! Apply now!</p>
                </div>
                 <div className="p-3 bg-dark-bg rounded-lg">
                    <h4 className="font-semibold">Weekly Event: Map Domination</h4>
                    <p className="text-xs text-gray-500">Posted by {leader?.username || 'Leader'} - {new Date(Date.now() - 86400000 * 3).toLocaleDateString()}</p>
                    <p className="text-sm mt-1">Get ready for this Saturday's event. Details in Discord.</p>
                </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};