
import React, { useState, useEffect } from 'react';
import { SiteSettings, BadgeCategory } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';

const BADGE_CATEGORY_OPTIONS: { value: BadgeCategory; label: string }[] = [
    { value: "Achievement", label: "Achievement" },
    { value: "Role", label: "Role" },
    { value: "Verification", label: "Verification" },
    { value: "Event", label: "Event" },
    { value: "General", label: "General" },
];

// Placeholder for Badge Creator Panel - conceptual
const BadgeCreatorPanel: React.FC = () => {
    const { badges, createBadge } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [iconClass, setIconClass] = useState('fas fa-star');
    const [colorClass, setColorClass] = useState('text-yellow-400');
    const [unlockCriteria, setUnlockCriteria] = useState('');
    const [value, setValue] = useState(0);
    const [category, setCategory] = useState<BadgeCategory>('General');


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !iconClass || !colorClass || !category) {
            alert("Name, icon, color, and category are required for a badge.");
            return;
        }
        if (value <= 0) {
            alert("Badge value must be a positive number.");
            return;
        }
        createBadge({ name, description, iconClass, colorClass, unlockCriteria, value, category });
        setName(''); setDescription(''); setIconClass('fas fa-star'); setColorClass('text-yellow-400'); setUnlockCriteria(''); setValue(0); setCategory('General');
        alert("Badge created!");
    };
    
    return (
        <Card title="Badge Creator" titleIcon={<i className="fas fa-id-badge"/>}>
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
                <Input label="Badge Value (Points)" type="number" value={value.toString()} onChange={e => setValue(parseInt(e.target.value, 10) || 0)} required />
                <Button type="submit" variant="primary">Create Badge</Button>
            </form>
            <div className="mt-6">
                <h4 className="text-md font-semibold mb-2">Existing Badges ({badges.length})</h4>
                <ul className="list-disc list-inside text-sm text-gray-300 max-h-40 overflow-y-auto">
                    {badges.map(b => <li key={b.id}><i className={`${b.iconClass} ${b.colorClass} mr-1`}></i> {b.name} ({b.category}, +{b.value})</li>)}
                </ul>
            </div>
        </Card>
    );
};


export const SiteSettingsSection: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useAppContext();
  const [currentSettings, setCurrentSettings] = useState<SiteSettings>(siteSettings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setCurrentSettings(siteSettings);
  }, [siteSettings]);

  const handleChange = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setCurrentSettings(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    updateSiteSettings(currentSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const themeOptions = [
    { value: 'dark', label: 'Dark Theme' },
    { value: 'light', label: 'Light Theme (Conceptual)' },
  ];

  const borderRadiusOptions = [
    { value: 'rounded-none', label: 'None (Sharp Edges)'},
    { value: 'rounded-md', label: 'Medium'},
    { value: 'rounded-lg', label: 'Large'},
    { value: 'rounded-xl', label: 'Extra Large'},
    { value: 'rounded-full', label: 'Full (Pills)'}
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-100">Site Settings</h2>
      
      <Card title="Appearance" titleIcon={<i className="fas fa-paint-brush"/>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Theme"
            options={themeOptions}
            value={currentSettings.theme}
            onChange={(e) => handleChange('theme', e.target.value as 'dark' | 'light')}
          />
          <Input
            label="Banner Image URL"
            value={currentSettings.bannerImageUrl || ''}
            onChange={(e) => handleChange('bannerImageUrl', e.target.value)}
            placeholder="https://example.com/banner.jpg"
          />
          <Input
            label="Primary Button Color (Hex)"
            type="color" // Allows color picker
            value={currentSettings.primaryButtonColor}
            onChange={(e) => handleChange('primaryButtonColor', e.target.value)}
            className="h-12" // Make color input taller
          />
          <Select
            label="Card Border Radius"
            options={borderRadiusOptions}
            value={currentSettings.cardBorderRadius}
            onChange={(e) => handleChange('cardBorderRadius', e.target.value)}
          />
        </div>
      </Card>

      <Card title="Content Management" titleIcon={<i className="fas fa-file-alt"/>}>
        <div className="space-y-6">
          <TextArea
            label="Rules Page Content (Markdown)"
            value={currentSettings.rulesPageContent}
            onChange={(e) => handleChange('rulesPageContent', e.target.value)}
            rows={8}
            placeholder="Enter game and community rules here..."
          />
          <TextArea
            label="FAQ Page Content (Markdown)"
            value={currentSettings.faqPageContent}
            onChange={(e) => handleChange('faqPageContent', e.target.value)}
            rows={8}
            placeholder="Enter frequently asked questions and answers..."
          />
        </div>
      </Card>

      <BadgeCreatorPanel />

      <div className="flex justify-end items-center mt-8 space-x-3">
        {isSaved && <p className="text-green-400 text-sm">Settings saved successfully!</p>}
        <Button onClick={handleSave} variant="primary" size="lg" leftIcon={<i className="fas fa-save"/>}>
          Save All Settings
        </Button>
      </div>
    </div>
  );
};
