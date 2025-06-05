
import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAppContext } from '../../contexts/AppContext';
import { Player } from '../../types';
import { RobloxAvatar } from '../ui/RobloxAvatar';

interface NewStaffChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (staffPlayerIds: string[]) => void;
}

export const NewStaffChatModal: React.FC<NewStaffChatModalProps> = ({ isOpen, onClose, onStartChat }) => {
  const { players, currentUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  const staffMembers = useMemo(() => {
    if (!currentUser) return [];
    return players.filter(
      (p) =>
        p.id !== currentUser.id &&
        (p.badges.includes('game_admin') || p.badges.includes('moderator')) &&
        p.username.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.username.localeCompare(b.username));
  }, [players, currentUser, searchTerm]);

  const handleToggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds(prevSelected =>
      prevSelected.includes(staffId)
        ? prevSelected.filter(id => id !== staffId)
        : [...prevSelected, staffId]
    );
  };

  const handleConfirmStartChat = () => {
    if (selectedStaffIds.length > 0) {
      onStartChat(selectedStaffIds);
      onClose(); 
    }
  };
  
  const handleCloseModal = () => {
    setSearchTerm('');
    setSelectedStaffIds([]);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Start a New Staff Chat" size="md">
      <div className="space-y-4">
        <Input
          placeholder="Search staff members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<i className="fas fa-search text-xs opacity-50"></i>}
          autoFocus
        />
        <p className="text-xs text-gray-400">Select one or more staff members to include in the chat.</p>
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {staffMembers.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No staff members found matching your search.</p>
          )}
          {staffMembers.map((staff) => {
            const isSelected = selectedStaffIds.includes(staff.id);
            return (
            <button
              key={staff.id}
              onClick={() => handleToggleStaffSelection(staff.id)}
              className={`w-full flex items-center space-x-3 p-2 rounded-lg border transition-colors
                                ${isSelected 
                                    ? 'bg-brand-primary/20 border-brand-primary shadow-md' 
                                    : 'bg-dark-bg border-dark-border hover:border-gray-600'}`}
            >
              <RobloxAvatar
                robloxId={staff.robloxId}
                username={staff.username}
                size={36}
                customAvatarUrl={staff.customAvatarUrl}
                isVerifiedPlayer={staff.isVerifiedPlayer}
              />
              <span className={`font-medium ${isSelected ? 'text-brand-primary': 'text-gray-200'}`}>{staff.username}</span>
              <div className="ml-auto flex items-center space-x-2">
                {(staff.badges.includes('game_admin')) && <span className="text-xs bg-red-500/30 text-red-400 px-1.5 py-0.5 rounded">Admin</span>}
                {(staff.badges.includes('moderator') && !staff.badges.includes('game_admin')) && <span className="text-xs bg-purple-500/30 text-purple-400 px-1.5 py-0.5 rounded">Mod</span>}
                <div 
                    className={`w-5 h-5 flex items-center justify-center rounded border-2 
                        ${isSelected ? 'bg-brand-primary border-brand-primary' : 'bg-dark-surface border-gray-500'}`}
                >
                    {isSelected && <i className="fas fa-check text-white text-xs"></i>}
                </div>
              </div>
            </button>
          )}
          )}
        </div>
        <div className="flex justify-end space-x-2 pt-3">
          <Button variant="ghost" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmStartChat}
            disabled={selectedStaffIds.length === 0}
          >
            Start Chat ({selectedStaffIds.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};