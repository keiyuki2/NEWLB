
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { WorldRecordType, Region, LeaderboardCategory } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { WORLD_RECORD_TYPE_OPTIONS, REGION_OPTIONS, MAP_NAME_OPTIONS } from '../../constants';
import { Alert } from '../ui/Alert';

interface RecordSubmissionFormProps {
  onClose: () => void;
}

export const RecordSubmissionForm: React.FC<RecordSubmissionFormProps> = ({ onClose }) => {
  const { currentUser, submitRecord } = useAppContext();
  const [type, setType] = useState<WorldRecordType | ''>('');
  // mapName is now part of the WorldRecordType for speed records, so we might not need a separate state
  // However, for a user-friendly form, it's better to select map for speed records.
  const [mapName, setMapName] = useState(''); 
  const [value, setValue] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [region, setRegion] = useState<Region | ''>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isSpeedRecord = useMemo(() => type.startsWith(LeaderboardCategory.SPEED), [type]);

  // Filter WORLD_RECORD_TYPE_OPTIONS to match selection logic for speed + map
  const recordTypeOptions = useMemo(() => {
    return WORLD_RECORD_TYPE_OPTIONS.map(opt => {
        // For user display, remove map from type if it exists, we'll handle map selection separately
        const label = opt.label.includes(" - ") ? opt.label.substring(0, opt.label.lastIndexOf(" - ")) : opt.label;
        return {...opt, label: label};
    }).filter((opt, index, self) => 
        index === self.findIndex((t) => t.label === opt.label) // Unique labels
    );
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentUser) {
      setError("You must be logged in to submit a record.");
      return;
    }
    if (!type || !value || !proofUrl) {
      setError("Record Type, Value, and Proof URL are required.");
      return;
    }
    
    let finalRecordType = type as WorldRecordType; // Base type selected by user
    if (isSpeedRecord) {
        if (!mapName) {
            setError("Map Name is required for speed records.");
            return;
        }
        // Construct the full WorldRecordType enum string
        const typePrefix = type.substring(0, type.lastIndexOf(" - ") > 0 ? type.lastIndexOf(" - ") : type.length);
        const fullTypeString = `${typePrefix} - ${mapName}`;
        
        // Validate if this constructed string is a valid WorldRecordType
        if (!Object.values(WorldRecordType).includes(fullTypeString as WorldRecordType)) {
            setError(`Invalid combination of speed record type and map: ${fullTypeString}. Please select a valid map for the chosen speed category.`);
            return;
        }
        finalRecordType = fullTypeString as WorldRecordType;
    }


    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
        setError("Record value must be a positive number.");
        return;
    }

    submitRecord({
      playerId: currentUser.id,
      type: finalRecordType,
      value: numericValue,
      proofUrl,
      region: region || undefined,
    });

    setSuccess(`Record submission for "${finalRecordType.replace(/-/g, ' ')}" submitted! It will be reviewed by moderators.`);
    setTimeout(() => {
        onClose();
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <Select 
        label="Record Category" 
        options={recordTypeOptions} 
        value={type} 
        onChange={e => setType(e.target.value as WorldRecordType | '')} 
        required 
      />
      
      {isSpeedRecord && (
        <Select 
            label="Map Name (for Speed Records)" 
            options={[{value: '', label: 'Select Map'}, ...MAP_NAME_OPTIONS]}
            value={mapName} 
            onChange={e => setMapName(e.target.value)} 
            required={isSpeedRecord} 
        />
      )}

      <Input label="Record Value (e.g., time in seconds, count)" type="number" value={value} onChange={e => setValue(e.target.value)} required />
      <Input label="Proof URL (YouTube, Streamable, etc.)" type="url" value={proofUrl} onChange={e => setProofUrl(e.target.value)} required placeholder="https://youtube.com/watch?v=..."/>
      <Select label="Region (Optional)" options={[{value: '', label: 'Select Region'}, ...REGION_OPTIONS]} value={region} onChange={e => setRegion(e.target.value as Region | '')} />
      
      <p className="text-xs text-gray-400">
        Note: For time-based records (Speed, Longest Survival), enter value in total seconds.
      </p>

      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={!!success}>Submit Record</Button>
      </div>
    </form>
  );
};
