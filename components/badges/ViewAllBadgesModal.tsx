
import React from 'react';
import { Modal } from '../ui/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { Badge as BadgeType } from '../../types'; // Renamed to avoid conflict

interface ViewAllBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  badgeIds: string[];
}

export const ViewAllBadgesModal: React.FC<ViewAllBadgesModalProps> = ({ isOpen, onClose, username, badgeIds }) => {
  const { badges: allBadgesConfig } = useAppContext();

  const userOwnedBadges = badgeIds
    .map(id => allBadgesConfig.find(b => b.id === id))
    .filter(Boolean) as BadgeType[];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${username}'s Badges (${userOwnedBadges.length})`} size="md">
      {userOwnedBadges.length === 0 ? (
        <p className="text-gray-400 text-center py-4">This user has no badges.</p>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 py-1">
          {userOwnedBadges.map(badge => (
            <div key={badge.id} className="flex items-start space-x-3 p-3 bg-dark-bg rounded-lg border border-dark-border shadow-sm">
              <div className={`text-3xl ${badge.colorClass} mt-1 flex-shrink-0 w-8 text-center`}>
                <i className={badge.iconClass}></i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-100">{badge.name}</h4>
                <p className="text-sm text-gray-300 leading-tight">{badge.description}</p>
                <p className="text-xs text-gray-500 mt-1">Category: {badge.category} - Value: {badge.value} pts</p>
                <p className="text-xs text-gray-400 mt-0.5">Criteria: {badge.unlockCriteria || "General recognition."}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
