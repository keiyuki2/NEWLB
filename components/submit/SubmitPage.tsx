
import React, { useState, ChangeEvent, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { useAppContext } from '../../contexts/AppContext';
import ReactMarkdown from 'react-markdown';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { LeaderboardCategory, SpeedSubCategory, EconomySubCategory, CosmeticsSubCategory, StatUpdateProofData } from '../../types';
import { Alert } from '../ui/Alert';
import { STAT_UPDATE_CATEGORY_OPTIONS, STAT_UPDATE_SUBCATEGORY_OPTIONS, MAP_NAME_OPTIONS, STAT_METRIC_UNITS } from '../../constants';

const RulesTab: React.FC = () => {
  const { siteSettings } = useAppContext();
  return (
    <div className="prose prose-invert prose-sm max-w-none text-gray-300 p-1">
      <ReactMarkdown>{siteSettings.rulesPageContent}</ReactMarkdown>
    </div>
  );
};

const GuidelinesTab: React.FC = () => {
  const { siteSettings } = useAppContext();
  return (
    <div className="prose prose-invert prose-sm max-w-none text-gray-300 p-1">
      <ReactMarkdown>{siteSettings.submissionGuidelinesContent}</ReactMarkdown>
    </div>
  );
};

const SubmitProofForm: React.FC = () => {
  const { currentUser, submitStatUpdateProof } = useAppContext();
  
  const [category, setCategory] = useState<LeaderboardCategory>(LeaderboardCategory.SPEED);
  const [subCategory, setSubCategory] = useState<string>(SpeedSubCategory.NORMAL);
  const [mapName, setMapName] = useState<string>(MAP_NAME_OPTIONS[0]?.value || '');
  const [newValue, setNewValue] = useState('');
  const [videoProofUrl, setVideoProofUrl] = useState('');
  const [imageProof, setImageProof] = useState<File | null>(null);
  const [imageProofName, setImageProofName] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const subCategoryOptions = STAT_UPDATE_SUBCATEGORY_OPTIONS[category] || [];

  useEffect(() => { 
    const newSubCategoryOptions = STAT_UPDATE_SUBCATEGORY_OPTIONS[category] || [];
    setSubCategory(newSubCategoryOptions.length > 0 ? newSubCategoryOptions[0].value : '');
    if (category !== LeaderboardCategory.SPEED) {
      setMapName('');
    } else {
      setMapName(MAP_NAME_OPTIONS[0]?.value || '');
    }
  }, [category]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        setError("Image proof must be less than 2MB.");
        setImageProof(null);
        setImageProofName('');
        e.target.value = ''; // Reset file input
        return;
      }
      setError(null); // Clear previous error if new file is valid
      setImageProof(file);
      setImageProofName(file.name);
    } else {
      setImageProof(null);
      setImageProofName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentUser) {
      setError("You must be logged in to submit proof.");
      return;
    }
    if (!category || !subCategory || !newValue || !videoProofUrl) {
      setError("Category, Sub-Category, New Value, and Video Proof URL are required.");
      return;
    }
    if (category === LeaderboardCategory.SPEED && !mapName) {
        setError("Map Name is required for Speed category submissions.");
        return;
    }

    const numericValue = parseFloat(newValue);
    if (isNaN(numericValue) || numericValue < 0) { 
      setError("New value must be a non-negative number.");
      return;
    }

    setIsLoading(true);
    try {
      const submissionData: StatUpdateProofData = {
        playerId: currentUser.id,
        category,
        subCategory: subCategory as SpeedSubCategory | EconomySubCategory | CosmeticsSubCategory,
        mapName: category === LeaderboardCategory.SPEED ? mapName : undefined,
        newValue: numericValue,
        videoProofUrl,
        imageProofName: imageProof ? imageProof.name : undefined, // Store filename, actual upload handled by backend
        notes,
      };
      submitStatUpdateProof(submissionData); // This is a frontend mock, actual image upload needs backend
      setSuccess("Your proof has been submitted for review! You will be notified once it's processed.");
      setNewValue(''); setVideoProofUrl(''); setImageProof(null); setImageProofName(''); setNotes('');
      setCategory(LeaderboardCategory.SPEED); // Reset to default
    } catch (err) {
      setError("An error occurred during submission. Please try again.");
      console.error("Proof submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const valueUnits = STAT_METRIC_UNITS[category]?.[subCategory as keyof (typeof STAT_METRIC_UNITS)[LeaderboardCategory]] || "";
  let valuePlaceholder = `e.g., ${category === LeaderboardCategory.SPEED ? '120 (for 2m 0s)' : '50000'}`;
  if (valueUnits) {
    if (category === LeaderboardCategory.SPEED && valueUnits === "seconds") {
        valuePlaceholder = `e.g., 115 (total seconds for 1m 55s)`;
    } else if (category === LeaderboardCategory.ECONOMY && subCategory === EconomySubCategory.MONEY) {
        valuePlaceholder = `e.g., 75000 (for $75,000)`;
    } else if (category === LeaderboardCategory.ECONOMY && subCategory === EconomySubCategory.POINTS) {
        valuePlaceholder = `e.g., 1200 (for 1,200 points)`;
    } else if (category === LeaderboardCategory.COSMETICS) {
        valuePlaceholder = `e.g., 5 (for 5 items)`;
    } else {
        valuePlaceholder += ` in ${valueUnits}`;
    }
  }


  const getCategoryDescription = () => {
    switch(category) {
        case LeaderboardCategory.SPEED: return "For runs measuring completion time. 'Normal' for standard gameplay, 'Glitched' for runs using exploits/bugs.";
        case LeaderboardCategory.ECONOMY: return "For tracking in-game currency. Select 'Money' or 'Points' earned.";
        case LeaderboardCategory.COSMETICS: return "For the total number of 'Unusuals' or 'Accessories' owned.";
        default: return "";
    }
  };
  
  const getSubCategoryDescription = () => {
    if (category === LeaderboardCategory.SPEED) {
        if (subCategory === SpeedSubCategory.NORMAL) return "Standard gameplay, no major bugs or unintended exploits.";
        if (subCategory === SpeedSubCategory.GLITCHED) return "Runs where exploits, bugs, and unintended game mechanics are permitted.";
    }
    return "";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-1">
      <Alert type="info" title="Important Notice">
        Before submitting, please review the <strong>Submission Guidelines</strong> tab. Ensure your proof is clear and meets all requirements to expedite the review process.
      </Alert>
      
      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      {!currentUser && <Alert type="warning">Please log in to submit proof.</Alert>}

      <div>
        <Select
            label="Category"
            options={STAT_UPDATE_CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => setCategory(e.target.value as LeaderboardCategory)}
            disabled={!currentUser || isLoading}
        />
        {category && <p className="text-xs text-gray-400 mt-1 pl-1">{getCategoryDescription()}</p>}
      </div>

      {subCategoryOptions.length > 0 && (
        <div>
            <Select
                label="Sub-Category"
                options={subCategoryOptions}
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={!currentUser || isLoading}
            />
            {subCategory && <p className="text-xs text-gray-400 mt-1 pl-1">{getSubCategoryDescription()}</p>}
        </div>
      )}

      {category === LeaderboardCategory.SPEED && (
        <div>
            <Select
                label="Map Name"
                options={MAP_NAME_OPTIONS}
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                disabled={!currentUser || isLoading}
                required={category === LeaderboardCategory.SPEED}
            />
            <p className="text-xs text-gray-400 mt-1 pl-1">Select the map where the speed run took place. This is crucial for accurate record-keeping.</p>
        </div>
      )}
      
      <div>
        <Input
            label={`New Value ${valueUnits ? `(${valueUnits})` : ''}`}
            type="number"
            step="any"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={valuePlaceholder}
            required
            disabled={!currentUser || isLoading}
        />
         <p className="text-xs text-gray-400 mt-1 pl-1">Enter the exact value achieved (e.g., total seconds for time, total amount for currency/items).</p>
      </div>
      
      <div>
        <Input
            label="Video Proof URL (YouTube, Streamable, etc.)"
            type="url"
            value={videoProofUrl}
            onChange={(e) => setVideoProofUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://streamable.com/..."
            required
            disabled={!currentUser || isLoading}
        />
        <p className="text-xs text-gray-400 mt-1 pl-1">Video must be clear, unedited, and show your in-game username, the entire relevant gameplay, and the final result/score.</p>
      </div>

      <div>
        <label htmlFor="imageProof" className="block text-xs font-medium text-gray-400 mb-1">
          Image Proof (Optional - Screenshot)
        </label>
        <Input
          id="imageProof"
          type="file"
          accept="image/png, image/jpeg, image/gif"
          onChange={handleImageChange}
          className="file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-purple-600"
          disabled={!currentUser || isLoading}
        />
        {imageProofName && <p className="text-xs text-gray-500 mt-1">Selected: {imageProofName}</p>}
        <p className="text-xs text-gray-400 mt-1 pl-1">Optional, but helpful for quick verification (e.g., end-game scoreboard). Max 2MB, PNG/JPG/GIF.</p>
      </div>

      <div>
        <TextArea
            label="Additional Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Key moment at 1:32 in video, specific strategy used, any issues encountered."
            rows={3}
            disabled={!currentUser || isLoading}
        />
        <p className="text-xs text-gray-400 mt-1 pl-1">Include any details that might help moderators review your submission.</p>
      </div>
      
      <div className="pt-2 space-y-2">
        <p className="text-xs text-gray-400 text-center">
            Submissions are reviewed by moderators. Processing times may vary. You will be notified of the outcome.
        </p>
        <Button type="submit" variant="primary" className="w-full md:w-auto" isLoading={isLoading} disabled={!currentUser || isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Proof for Review'}
        </Button>
      </div>
    </form>
  );
};

export const SubmitPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const submitTabs = [
    { label: "Game Rules", icon: <i className="fas fa-book"></i>, content: <RulesTab /> },
    { label: "Submission Guidelines", icon: <i className="fas fa-info-circle"></i>, content: <GuidelinesTab /> },
    { label: "Submit Stat Proof", icon: <i className="fas fa-paper-plane"></i>, content: <SubmitProofForm /> },
  ];

  return (
    <Card title="Submissions Center" titleIcon={<i className="fas fa-upload opacity-80"/>}>
      <p className="text-sm text-gray-400 mb-6">
        Welcome to the Evade Submissions Center. Here you can find game rules, detailed guidelines for submitting proof, and forms to submit your achievements. 
        <strong>It is crucial to read the rules and guidelines carefully before submitting to ensure your submission is valid and can be processed efficiently.</strong>
      </p>
      <Tabs tabs={submitTabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills" />
    </Card>
  );
};
