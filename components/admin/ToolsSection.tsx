


import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { BadgeCategory } from '../../types';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { UsernameColorTagManagementSection } from './UsernameColorTagManagementSection'; // Import the section

const BADGE_CATEGORY_OPTIONS: { value: BadgeCategory; label: string }[] = [
    { value: "Achievement", label: "Achievement" }, { value: "Role", label: "Role" },
    { value: "Verification", label: "Verification" }, { value: "Event", label: "Event" },
    { value: "General", label: "General" },
];

const BadgeDesignerPanel: React.FC = () => {
    const { createBadge, usernameColorTags } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [iconClass, setIconClass] = useState('fas fa-star');
    const [colorClass, setColorClass] = useState('text-yellow-400');
    const [unlockCriteria, setUnlockCriteria] = useState('');
    const [value, setValue] = useState(0);
    const [category, setCategory] = useState<BadgeCategory>('General');
    const [isVisible, setIsVisible] = useState(true); 
    const [selectedColorTagId, setSelectedColorTagId] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !iconClass || !colorClass || !category) {
            alert("Name, icon, color, and category are required for a badge.");
            return;
        }
        
        if (value < 0) { 
            alert("Badge value must be a non-negative number.");
            return;
        }
        createBadge({ 
            name, description, iconClass, colorClass, unlockCriteria, 
            value: value, // Explicitly pass, can be 0
            category, 
            isVisible, // Pass visibility state
            colorTagId: selectedColorTagId || undefined, 
        });
        setName(''); setDescription(''); setIconClass('fas fa-star'); setColorClass('text-yellow-400'); 
        setUnlockCriteria(''); setValue(0); setCategory('General'); setIsVisible(true); setSelectedColorTagId('');
        alert("Badge created successfully!");
    };

    const usernameTagOptions = [
        { value: "", label: "None (No Username Style)" },
        ...usernameColorTags.map(tag => ({ value: tag.id, label: `${tag.name} (${tag.id})`}))
    ];
    
    return (
        <Card title="Create New Badge" titleIcon={<i className="fas fa-id-badge"/>}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Badge Name" value={name} onChange={e => setName(e.target.value)} required />
                <Select 
                    label="Category"
                    options={BADGE_CATEGORY_OPTIONS}
                    value={category}
                    onChange={e => setCategory(e.target.value as BadgeCategory)}
                    required
                />
                <TextArea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <Input label="Font Awesome Icon Class (e.g., fas fa-star)" value={iconClass} onChange={e => setIconClass(e.target.value)} required />
                <Input label="Tailwind Color Class (e.g., text-yellow-400)" value={colorClass} onChange={e => setColorClass(e.target.value)} required />
                <TextArea label="Unlock Criteria" value={unlockCriteria} onChange={e => setUnlockCriteria(e.target.value)} />
                <Input label="Badge Value (Points, 0 for no points)" type="number" value={value.toString()} onChange={e => setValue(parseInt(e.target.value, 10) || 0)} min="0" required />
                
                <div className="flex items-center space-x-3">
                    <label htmlFor="badgeIsVisible" className="text-sm text-gray-300">Publicly Visible:</label>
                    <input
                        type="checkbox"
                        id="badgeIsVisible"
                        checked={isVisible}
                        onChange={(e) => setIsVisible(e.target.checked)}
                        className="h-4 w-4 text-brand-primary bg-dark-bg border-dark-border rounded focus:ring-brand-primary"
                        aria-describedby="isVisibleHelp"
                    />
                     <span id="isVisibleHelp" className="text-xs text-gray-500">
                        (Uncheck for staff/hidden badges)
                    </span>
                </div>

                <Select
                    label="Link Username Color Tag (Optional)"
                    options={usernameTagOptions}
                    value={selectedColorTagId}
                    onChange={e => setSelectedColorTagId(e.target.value)}
                />
                
                <Button type="submit" variant="primary">Create Badge</Button>
            </form>
        </Card>
    );
};

export const ToolsSection: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-100">Admin Tools</h2>
      
      <BadgeDesignerPanel />

      <Card title="Username Color Tags" titleIcon={<i className="fas fa-palette"/>}>
        <UsernameColorTagManagementSection />
      </Card>

      <Card title="Rank Editor (Conceptual)" titleIcon={<i className="fas fa-sitemap"/>}>
        <p className="text-gray-400">
          This section would allow editing tier requirements, names, and icons. (Not yet implemented)
        </p>
      </Card>

      <Card title="Scheduled Tasks (Conceptual)" titleIcon={<i className="fas fa-calendar-alt"/>}>
        <p className="text-gray-400">
          This section would manage automated tasks like daily rank recalculations or leaderboard resets. (Not yet implemented)
        </p>
      </Card>
    </div>
  );
};
