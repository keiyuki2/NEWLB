
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Announcement, AnnouncementType } from '../../types';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';

const ANNOUNCEMENT_TYPE_OPTIONS: { value: AnnouncementType; label: string }[] = [
    { value: 'info', label: 'Info (Blue)' },
    { value: 'success', label: 'Success (Green)' },
    { value: 'warning', label: 'Warning (Yellow)' },
    { value: 'error', label: 'Error (Red)' },
];

export const AnnouncementsSection: React.FC = () => {
  const { announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement, publishAnnouncement, dismissGlobalAnnouncement } = useAppContext();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AnnouncementType>('info');
  const [isDismissible, setIsDismissible] = useState(true);
  const [publishDuration, setPublishDuration] = useState<number | undefined>(60); // Default 60 minutes

  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle(''); setMessage(''); setType('info'); setIsDismissible(true); setPublishDuration(60);
    setEditingAnnouncement(null); setIsCreating(false); setFormError(null);
  };

  const handleEdit = (ann: Announcement) => {
    setIsCreating(true); // Re-use form
    setEditingAnnouncement(ann);
    setTitle(ann.title);
    setMessage(ann.message);
    setType(ann.type);
    setIsDismissible(ann.isDismissible);
    setPublishDuration(ann.displayUntil ? (new Date(ann.displayUntil).getTime() - Date.now()) / 60000 : undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title || !message) {
      setFormError("Title and message are required.");
      return;
    }

    if (editingAnnouncement) {
      updateAnnouncement({ ...editingAnnouncement, title, message, type, isDismissible });
    } else {
      createAnnouncement({ title, message, type, isDismissible });
    }
    resetForm();
  };
  
  const handleTogglePublish = (ann: Announcement) => {
    if (ann.isActive) {
        dismissGlobalAnnouncement(ann.id);
    } else {
        publishAnnouncement(ann.id, publishDuration); // Use state for duration or a fixed one
    }
  };

  const durationOptions = [
    { value: "5", label: "5 Minutes" },
    { value: "30", label: "30 Minutes" },
    { value: "60", label: "1 Hour" },
    { value: "1440", label: "1 Day (24 Hours)" },
    { value: "0", label: "Until Manually Dismissed" }, // 0 or undefined for no expiry
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-100">Site Announcements</h2>
        {!isCreating && <Button onClick={() => setIsCreating(true)} leftIcon={<i className="fas fa-plus"/>}>Create New</Button>}
      </div>

      {isCreating && (
        <Card title={editingAnnouncement ? "Edit Announcement" : "Create New Announcement"} titleIcon={<i className="fas fa-bullhorn"/>}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <Alert type="error" onClose={() => setFormError(null)}>{formError}</Alert>}
            <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <TextArea label="Message (Markdown supported)" value={message} onChange={e => setMessage(e.target.value)} rows={4} required />
            <Select label="Type / Color" options={ANNOUNCEMENT_TYPE_OPTIONS} value={type} onChange={e => setType(e.target.value as AnnouncementType)} />
            <div className="flex items-center space-x-3">
                <label htmlFor="isDismissible" className="text-sm text-gray-300">User Dismissible:</label>
                <input type="checkbox" id="isDismissible" checked={isDismissible} onChange={e => setIsDismissible(e.target.checked)} className="h-4 w-4 text-brand-primary bg-dark-bg border-dark-border rounded focus:ring-brand-primary"/>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button type="submit" variant="primary">{editingAnnouncement ? "Save Changes" : "Create Announcement"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Manage Announcements" titleIcon={<i className="fas fa-list-alt"/>}>
        {announcements.length === 0 && <p className="text-gray-400">No announcements created yet.</p>}
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id} className={`p-4 rounded-lg border flex flex-col md:flex-row justify-between md:items-center space-y-3 md:space-y-0
                ${ann.type === 'info' ? 'bg-sky-900/30 border-sky-700' : ''}
                ${ann.type === 'success' ? 'bg-green-900/30 border-green-700' : ''}
                ${ann.type === 'warning' ? 'bg-yellow-900/30 border-yellow-700' : ''}
                ${ann.type === 'error' ? 'bg-red-900/30 border-red-700' : ''}
            `}>
              <div>
                <h3 className="font-semibold text-gray-100">{ann.title} <span className="text-xs font-normal text-gray-400">({ann.type}, {ann.isDismissible ? "Dismissible" : "Not Dismissible"})</span></h3>
                <p className="text-sm text-gray-300 max-w-xl break-words">{ann.message.substring(0,100)}{ann.message.length > 100 ? '...' : ''}</p>
                <p className="text-xs text-gray-500 mt-1">Created: {new Date(ann.creationDate).toLocaleString()}</p>
                {ann.isActive && ann.displayUntil && <p className="text-xs text-yellow-400">Active until: {new Date(ann.displayUntil).toLocaleString()}</p>}
                {ann.isActive && !ann.displayUntil && <p className="text-xs text-yellow-400">Active (no expiry)</p>}

              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                 {!ann.isActive && (
                    <Select 
                        options={durationOptions}
                        value={publishDuration?.toString() || "60"}
                        onChange={e => setPublishDuration(e.target.value === "0" ? undefined : parseInt(e.target.value))}
                        wrapperClassName="w-auto text-xs"
                        className="py-1 text-xs"
                    />
                 )}
                <Button size="xs" variant={ann.isActive ? "outline" : "primary"} onClick={() => handleTogglePublish(ann)} leftIcon={ann.isActive ? <i className="fas fa-eye-slash"/> : <i className="fas fa-eye"/>}>
                  {ann.isActive ? "Unpublish" : "Publish"}
                </Button>
                <Button size="xs" variant="ghost" onClick={() => handleEdit(ann)}><i className="fas fa-edit"/></Button>
                <Button size="xs" variant="danger" onClick={() => window.confirm("Delete this announcement?") && deleteAnnouncement(ann.id)}><i className="fas fa-trash"/></Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};