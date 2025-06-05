
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface ClanCreationFormProps {
  onClose: () => void;
}

export const ClanCreationForm: React.FC<ClanCreationFormProps> = ({ onClose }) => {
  const { currentUser, submitClanApplication } = useAppContext();
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [discordLink, setDiscordLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentUser) {
      setError("You must be logged in to create a clan.");
      return;
    }
    if (!name || !tag || !description || !requirements) {
      setError("Please fill in all required fields (Name, Tag, Description, Requirements).");
      return;
    }
    if (tag.length > 4) {
        setError("Clan tag must be 4 characters or less.");
        return;
    }

    submitClanApplication(
      { name, tag, description, requirementsToJoin: requirements, discordLink },
      currentUser.id
    );
    setSuccess(`Clan application for "${name}" submitted! It will be reviewed by admins.`);
    // Optionally clear form or close modal after a delay
    setTimeout(() => {
        onClose();
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}
      
      <Input label="Clan Name" value={name} onChange={e => setName(e.target.value)} required />
      <Input label="Clan Tag (Max 4 chars)" value={tag} onChange={e => setTag(e.target.value)} maxLength={4} required />
      <TextArea label="Description (Markdown supported)" value={description} onChange={e => setDescription(e.target.value)} required rows={3} />
      <TextArea label="Requirements to Join" value={requirements} onChange={e => setRequirements(e.target.value)} required rows={2} />
      <Input label="Discord Link (Optional)" type="url" value={discordLink} onChange={e => setDiscordLink(e.target.value)} placeholder="https://discord.gg/yourclantag" />
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={!!success}>Submit Application</Button>
      </div>
    </form>
  );
};
    