
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge, BadgeCategory } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { Alert } from '../ui/Alert';

const BADGE_CATEGORY_OPTIONS: { value: BadgeCategory; label: string }[] = [
    { value: "Achievement", label: "Achievement" }, { value: "Role", label: "Role" },
    { value: "Verification", label: "Verification" }, { value: "Event", label: "Event" },
    { value: "General", label: "General" },
];

interface EditBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: Badge;
}

export const EditBadgeModal: React.FC<EditBadgeModalProps> = ({ isOpen, onClose, badge }) => {
  const { updateBadge, usernameColorTags } = useAppContext();

  const [name, setName] = useState(badge.name);
  const [description, setDescription] = useState(badge.description);
  const [iconClass, setIconClass] = useState(badge.iconClass);
  const [colorClass, setColorClass] = useState(badge.colorClass);
  const [unlockCriteria, setUnlockCriteria] = useState(badge.unlockCriteria);
  const [value, setValue] = useState(badge.value);
  const [category, setCategory] = useState<BadgeCategory>(badge.category);
  const [selectedColorTagId, setSelectedColorTagId] = useState<string>(badge.colorTagId || '');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (badge) {
        setName(badge.name);
        setDescription(badge.description);
        setIconClass(badge.iconClass);
        setColorClass(badge.colorClass);
        setUnlockCriteria(badge.unlockCriteria);
        setValue(badge.value);
        setCategory(badge.category);
        setSelectedColorTagId(badge.colorTagId || '');
        setError(null);
    }
  }, [badge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!name || !iconClass || !colorClass || !category) {
      setError("Name, icon, color, and category are required.");
      setIsLoading(false);
      return;
    }
    if (value <= 0) {
      setError("Badge value must be a positive number.");
      setIsLoading(false);
      return;
    }

    try {
      await updateBadge(badge.id, { 
        name, 
        description, 
        iconClass, 
        colorClass, 
        unlockCriteria, 
        value, 
        category, 
        colorTagId: selectedColorTagId || undefined 
      });
      onClose();
    } catch (err) {
      console.error("Error updating badge:", err);
      setError("Failed to update badge. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const usernameTagOptions = [
    { value: "", label: "None (No Username Style)" },
    ...usernameColorTags.map(tag => ({ value: tag.id, label: `${tag.name} (${tag.id})` }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Badge: ${badge.name}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
        
        <Input label="Badge Name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
        <Select 
          label="Category"
          options={BADGE_CATEGORY_OPTIONS}
          value={category}
          onChange={e => setCategory(e.target.value as BadgeCategory)}
          required
          disabled={isLoading}
        />
        <TextArea label="Description" value={description} onChange={e => setDescription(e.target.value)} disabled={isLoading} />
        <Input label="Font Awesome Icon Class" value={iconClass} onChange={e => setIconClass(e.target.value)} required disabled={isLoading} />
        <Input label="Tailwind Color Class" value={colorClass} onChange={e => setColorClass(e.target.value)} required disabled={isLoading} />
        <TextArea label="Unlock Criteria" value={unlockCriteria} onChange={e => setUnlockCriteria(e.target.value)} disabled={isLoading} />
        <Input label="Badge Value (Points)" type="number" value={value.toString()} onChange={e => setValue(parseInt(e.target.value, 10) || 0)} required disabled={isLoading} />
        
        <Select
          label="Link Username Color Tag (Optional)"
          options={usernameTagOptions}
          value={selectedColorTagId}
          onChange={e => setSelectedColorTagId(e.target.value)}
          disabled={isLoading}
        />
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};
