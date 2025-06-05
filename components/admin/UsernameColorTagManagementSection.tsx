
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UsernameColorTag } from '../../types';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { USERNAME_TAG_EFFECTS } from '../../constants';

export const UsernameColorTagManagementSection: React.FC = () => {
  const { usernameColorTags, createUsernameColorTag, deleteUsernameColorTag } = useAppContext();

  const [tagName, setTagName] = useState('');
  const [cssClasses, setCssClasses] = useState('');
  const [effectClass, setEffectClass] = useState('');
  const [iconClass, setIconClass] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName || !cssClasses) {
      alert("Tag Name and CSS Classes are required.");
      return;
    }
    createUsernameColorTag({
      name: tagName,
      cssClasses: cssClasses.split(',').map(c => c.trim()).filter(Boolean),
      effectClass: effectClass || undefined,
      iconClass: iconClass || undefined,
      description: description || undefined,
    });
    setTagName('');
    setCssClasses('');
    setEffectClass('');
    setIconClass('');
    setDescription('');
  };

  const effectOptions = USERNAME_TAG_EFFECTS.map(effect => ({ value: effect.cssClass, label: effect.name }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-100">Manage Username Color Tags</h2>

      <Card title="Create New Username Color Tag" titleIcon={<i className="fas fa-paint-brush" />}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tag Name (e.g., 'Fiery Red', 'Cool Blue Gradient')"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            required
          />
          <Input
            label="CSS Color Classes (comma-separated, e.g., text-red-500, bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-600)"
            value={cssClasses}
            onChange={(e) => setCssClasses(e.target.value)}
            placeholder="text-red-500 OR bg-clip-text, text-transparent, bg-gradient-to-r, from-purple-400, to-pink-600"
            required
          />
          <Select
            label="Visual Effect (Optional)"
            options={[{ value: "", label: "None" }, ...effectOptions]}
            value={effectClass}
            onChange={(e) => setEffectClass(e.target.value)}
          />
          <Input
            label="Icon Class (Font Awesome, Optional, e.g., fas fa-fire)"
            value={iconClass}
            onChange={(e) => setIconClass(e.target.value)}
            placeholder="fas fa-star"
          />
           <TextArea
            label="Description (Optional - For admin reference or tooltips)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <Button type="submit" variant="primary">Create Tag</Button>
        </form>
      </Card>

      <Card title="Existing Username Color Tags" titleIcon={<i className="fas fa-list-alt" />}>
        {usernameColorTags.length === 0 ? (
          <p className="text-gray-400">No custom username color tags created yet.</p>
        ) : (
          <div className="space-y-3">
            {usernameColorTags.map(tag => (
              <div key={tag.id} className="p-3 bg-dark-bg rounded-lg border border-dark-border flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-100 flex items-center">
                    {tag.iconClass && <i className={`${tag.iconClass} mr-2 ${tag.cssClasses.join(' ')}`}></i>}
                    <span className={`${tag.cssClasses.join(' ')} ${tag.effectClass || ''}`}>{tag.name}</span>
                  </h3>
                  <p className="text-xs text-gray-400">ID: {tag.id}</p>
                  {tag.description && <p className="text-xs text-gray-500 mt-0.5">{tag.description}</p>}
                  <p className="text-xs text-gray-500 mt-0.5">Classes: <code className="text-pink-400 text-[10px]">{tag.cssClasses.join(', ')}</code> {tag.effectClass && `| Effect: ${tag.effectClass}`}</p>
                </div>
                <Button variant="danger" size="xs" onClick={() => {
                    if (window.confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
                        deleteUsernameColorTag(tag.id);
                    }
                }}>Delete</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
