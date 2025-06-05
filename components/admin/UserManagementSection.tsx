
import React, { useState, useMemo, useEffect } from 'react';
import { Player, TierLevel, Badge as BadgeType, PlayerStats } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { TIER_OPTIONS } from '../../constants';
import { UserBadgesList } from '../badges/UserBadgesList';
import { Alert } from '../ui/Alert'; // For error messages

const CreateUserModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { createPlayer } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [robloxId, setRobloxId] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!username || !password) {
            setError("Username and password are required.");
            return;
        }
        setIsLoading(true);
        const result = await createPlayer({ username, password, robloxId, email });
        setIsLoading(false);
        if (result.success) {
            onClose();
        } else {
            setError(result.message || "Failed to create user.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <h3 className="text-xl font-semibold">Create New User</h3>
            {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input label="Email (Optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Roblox ID (Optional)" value={robloxId} onChange={(e) => setRobloxId(e.target.value)} />
            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" onClick={onClose} variant="ghost" disabled={isLoading}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>Create User</Button>
            </div>
        </form>
    );
};


const EditUserModal: React.FC<{ user: Player; onClose: () => void }> = ({ user: initialUser, onClose }) => {
  const { 
    players, 
    updatePlayer, 
    badges: allBadges, 
    resetPlayerStats: contextResetPlayerStats,
    setPlayerBlacklistedStatus,
    currentUser 
  } = useAppContext();

  const liveUser = players.find(p => p.id === initialUser.id) || initialUser;

  const [username, setUsername] = useState(liveUser.username);
  const [robloxId, setRobloxId] = useState(liveUser.robloxId);
  const [selectedTier, setSelectedTier] = useState<TierLevel>(liveUser.tier);
  const [email, setEmail] = useState(liveUser.email || '');
  const [pronouns, setPronouns] = useState(liveUser.pronouns || '');
  const [location, setLocation] = useState(liveUser.location || '');
  const [bio, setBio] = useState(liveUser.bio || '');
  const [isVerified, setIsVerified] = useState(liveUser.isVerifiedPlayer || false);
  const [isBlacklisted, setIsBlacklisted] = useState(liveUser.isBlacklisted || false); 
  const [modalError, setModalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const [twitch, setTwitch] = useState(liveUser.socialLinks?.twitch || '');
  const [youtube, setYoutube] = useState(liveUser.socialLinks?.youtube || '');

  const canEditUsername = currentUser?.id === liveUser.id;

  useEffect(() => {
    setUsername(liveUser.username);
    setRobloxId(liveUser.robloxId);
    setSelectedTier(liveUser.tier);
    setEmail(liveUser.email || '');
    setPronouns(liveUser.pronouns || '');
    setLocation(liveUser.location || '');
    setBio(liveUser.bio || '');
    setIsVerified(liveUser.isVerifiedPlayer || false);
    setIsBlacklisted(liveUser.isBlacklisted || false); 
    setTwitch(liveUser.socialLinks?.twitch || '');
    setYoutube(liveUser.socialLinks?.youtube || '');
    setModalError(null);
  }, [liveUser]);


  const handleSave = async () => {
    if (!liveUser) return; 
    setModalError(null);
    setIsLoading(true);

    const updatedSocialLinks = {
        ...liveUser.socialLinks, 
        twitch: twitch || undefined,
        youtube: youtube || undefined,
    };

    const updatedUserPayload: Player = {
        ...liveUser, 
        username: canEditUsername ? username : liveUser.username, // Only send updated username if allowed
        robloxId,
        tier: selectedTier,
        email: email || undefined,
        pronouns: pronouns || undefined,
        location: location || undefined,
        bio: bio || undefined,
        socialLinks: updatedSocialLinks,
        isVerifiedPlayer: isVerified,
        isBlacklisted: isBlacklisted, 
    };
    
    const result = await updatePlayer(updatedUserPayload);
    setIsLoading(false);
    if (result.success) {
        onClose();
    } else {
        setModalError(result.message || "Failed to update user.");
    }
  };

  const handleAddBadge = (badgeId: string) => {
    if (badgeId && liveUser) {
      const newBadges = [...new Set([...liveUser.badges, badgeId])];
      updatePlayer({ ...liveUser, badges: newBadges });
    }
  };

  const handleRemoveBadge = (badgeId: string) => {
    if (liveUser) {
      const newBadges = liveUser.badges.filter(b => b !== badgeId);
      updatePlayer({ ...liveUser, badges: newBadges });
    }
  };

  const handleToggleVerification = () => {
    setIsVerified(prev => !prev); 
  };

  const handleToggleBlacklist = () => {
    setIsBlacklisted(prev => !prev);
  };


  const handleResetStats = () => {
    if (!liveUser) return;
    const confirmReset = window.confirm(`Are you sure you want to reset stats for ${liveUser.username}? This will reset Speed, Economy, and Cosmetic stats. Time Alive will be preserved.`);
    if (confirmReset) {
        contextResetPlayerStats(liveUser.id);
        onClose(); 
    }
  };

  const badgeOptions = allBadges.map(b => ({ value: b.id, label: b.name }));
  const userBadgeObjects = (liveUser?.badges || []).map(bid => allBadges.find(b => b.id === bid)).filter(Boolean) as BadgeType[];

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
      <h3 className="text-xl font-semibold">Edit {liveUser.username}</h3>
      {modalError && <Alert type="error" onClose={() => setModalError(null)}>{modalError}</Alert>}
      <Input 
        label="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        disabled={!canEditUsername || isLoading}
        title={!canEditUsername ? "Username cannot be changed for other users." : ""}
      />
      <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
      <Input label="Roblox ID" value={robloxId} onChange={(e) => setRobloxId(e.target.value)} disabled={isLoading} />
      <Select label="Tier" options={TIER_OPTIONS} value={selectedTier} onChange={(e) => setSelectedTier(e.target.value as TierLevel)} disabled={isLoading} />

      <div className="flex items-center space-x-3 mt-2">
          <label htmlFor="isVerifiedPlayerModal" className="text-sm text-gray-300">Player Verified:</label>
          <input
            type="checkbox"
            id="isVerifiedPlayerModal"
            checked={isVerified}
            onChange={handleToggleVerification}
            className="h-4 w-4 text-brand-primary bg-dark-bg border-dark-border rounded focus:ring-brand-primary"
            disabled={isLoading}
          />
          <span className={`text-xs ${isVerified ? 'text-green-400' : 'text-red-400'}`}>{isVerified ? 'VERIFIED' : 'NOT VERIFIED'}</span>
      </div>
      
      <div className="flex items-center space-x-3 mt-2">
          <label htmlFor="isBlacklistedModal" className="text-sm text-gray-300">Player Blacklisted:</label>
          <input
            type="checkbox"
            id="isBlacklistedModal"
            checked={isBlacklisted}
            onChange={handleToggleBlacklist}
            className="h-4 w-4 text-red-500 bg-dark-bg border-dark-border rounded focus:ring-red-500"
            disabled={isLoading}
          />
          <span className={`text-xs ${isBlacklisted ? 'text-red-400 font-bold' : 'text-gray-400'}`}>{isBlacklisted ? 'BLACKLISTED' : 'NOT BLACKLISTED'}</span>
      </div>


      <Input label="Pronouns" value={pronouns} onChange={(e) => setPronouns(e.target.value)} disabled={isLoading} />
      <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} disabled={isLoading} />
      <TextArea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} disabled={isLoading} />

      <fieldset className="border border-dark-border p-2 rounded-md mt-2">
          <legend className="text-xs font-medium text-gray-400 px-1">Social Links (Basic)</legend>
          <Input label="Twitch Username" value={twitch} onChange={(e) => setTwitch(e.target.value)} placeholder="channel_name" wrapperClassName="mt-1" disabled={isLoading}/>
          <Input label="YouTube Handle/ID" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="@channel or channel_id" wrapperClassName="mt-2" disabled={isLoading}/>
      </fieldset>

      <div className="mt-3">
        <h4 className="text-md font-semibold mb-1">Manage Badges</h4>
        <div className="mb-1 text-xs">
            Current: <UserBadgesList badgeIds={liveUser?.badges || []} />
        </div>
        <div className="flex space-x-2 items-center">
            <Select
                options={badgeOptions.filter(bo => !(liveUser?.badges || []).includes(bo.value as string))}
                onChange={(e) => handleAddBadge(e.target.value)}
                placeholder="Add a badge..."
                className="flex-grow text-xs"
                wrapperClassName="text-xs"
                value="" 
                disabled={isLoading}
            />
        </div>
        {userBadgeObjects.length > 0 && <h5 className="text-xs font-medium mt-2 mb-1">Click to remove:</h5>}
        <div className="flex flex-wrap gap-1">
            {userBadgeObjects.map(badge => (
                <Button key={badge.id} size="xs" variant="ghost" onClick={() => handleRemoveBadge(badge.id)} className={`${badge.colorClass} border border-current !px-1.5 !py-0.5`} disabled={isLoading}>
                    <i className={`${badge.iconClass} mr-1 text-[10px]`}></i>{badge.name} <i className="fas fa-times ml-1.5 text-[9px]"></i>
                </Button>
            ))}
        </div>
      </div>

      <Button onClick={handleResetStats} variant="danger" className="w-full mt-3" disabled={isLoading}>
        Reset Gameplay Stats (Speed, Economy, Cosmetics)
      </Button>
      <div className="flex justify-end space-x-2 mt-4">
        <Button onClick={onClose} variant="ghost" disabled={isLoading}>Cancel</Button>
        <Button onClick={handleSave} variant="primary" isLoading={isLoading} disabled={isLoading}>Save Changes</Button>
      </div>
    </div>
  );
};


export const UserManagementSection: React.FC = () => {
  const { players, togglePlayerVerification, deletePlayer, setPlayerBlacklistedStatus } = useAppContext() ;
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<Player | null>(null);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const filteredPlayers = useMemo(() => {
    return players.filter(p =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.robloxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a,b) => a.username.localeCompare(b.username));
  }, [players, searchQuery]);

  const handleDeleteUser = (player: Player) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY DELETE user "${player.username}" (ID: ${player.id})? This action cannot be undone.`)) {
      deletePlayer(player.id);
    }
  };
  
  const openEditModal = (player: Player) => {
    const freshPlayer = players.find(p => p.id === player.id);
    setEditingUser(freshPlayer || player);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-100">User Management ({filteredPlayers.length} Users)</h2>
        <Button onClick={() => setIsCreateUserModalOpen(true)} variant="primary" leftIcon={<i className="fas fa-user-plus"/>}>Create User</Button>
      </div>
      <Input
        placeholder="Search users by username, Roblox ID, email, or internal ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={<i className="fas fa-search"></i>}
      />
      <div className="overflow-x-auto bg-dark-surface rounded-lg shadow">
        <table className="min-w-full divide-y divide-dark-border">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Roblox ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Badges</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {filteredPlayers.map(player => (
              <tr key={player.id} className={`hover:bg-gray-700/30 transition-colors ${player.isBlacklisted ? 'bg-red-900/30 hover:bg-red-800/40' : ''}`}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">{player.username}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{player.robloxId}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{player.tier}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm space-x-1">
                    <Button
                        size="xs"
                        variant={player.isVerifiedPlayer ? "primary" : "ghost"}
                        onClick={() => togglePlayerVerification(player.id)}
                        className={`${player.isVerifiedPlayer ? "bg-green-600 hover:bg-green-700" : "border-gray-600"} !py-0.5`}
                    >
                        {player.isVerifiedPlayer ? 'Verified' : 'Unverified'}
                    </Button>
                    <Button
                        size="xs"
                        variant={player.isBlacklisted ? "danger" : "ghost"}
                        onClick={() => setPlayerBlacklistedStatus(player.id, !player.isBlacklisted)}
                         className={`${player.isBlacklisted ? "" : "border-gray-600"} !py-0.5`}
                    >
                        {player.isBlacklisted ? 'Blacklisted' : 'Clear'}
                    </Button>
                </td>
                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    <UserBadgesList badgeIds={player.badges} maxVisible={2} />
                 </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1">
                  <Button size="xs" variant="outline" onClick={() => openEditModal(player)}>Edit</Button>
                  <Button size="xs" variant="danger" onClick={() => handleDeleteUser(player)}>Delete</Button>
                </td>
              </tr>
            ))}
            {filteredPlayers.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">No users found matching your search.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      {editingUser && (
        <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={`Editing User: ${editingUser.username}`} size="lg">
          <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />
        </Modal>
      )}
      {isCreateUserModalOpen && (
        <Modal isOpen={isCreateUserModalOpen} onClose={() => setIsCreateUserModalOpen(false)} title="Create New User" size="md">
            <CreateUserModal onClose={() => setIsCreateUserModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};