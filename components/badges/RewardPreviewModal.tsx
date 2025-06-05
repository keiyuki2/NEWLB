
import React from 'react';
import { Modal } from '../ui/Modal';
import { UsernameColorTag } from '../../types';

interface RewardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: UsernameColorTag;
}

export const RewardPreviewModal: React.FC<RewardPreviewModalProps> = ({ isOpen, onClose, tag }) => {
  if (!isOpen) return null;

  const usernameClasses = [...tag.cssClasses, tag.effectClass || ''].join(' ');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Username Style Preview" size="sm">
      <div className="text-center py-4">
        <p className="text-sm text-gray-400 mb-2">This badge unlocks the following username style:</p>
        <div className="p-4 bg-dark-bg rounded-md inline-block">
          <span className={`text-2xl font-bold ${usernameClasses}`}>
            {tag.iconClass && <i className={`${tag.iconClass} mr-2`}></i>}
            Sample Username
          </span>
        </div>
        {tag.description && <p className="text-xs text-gray-500 mt-3">{tag.description}</p>}
         <p className="text-xs text-gray-500 mt-1">Effect: {tag.effectClass || "None"}</p>
      </div>
    </Modal>
  );
};
