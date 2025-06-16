

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { WorldRecordType, Region, LeaderboardCategory, RecordVerificationData } from '../../types';
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
  const [mapName, setMapName] = useState(''); 
  const [value, setValue] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [region, setRegion] = useState<Region | ''>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isSpeedRecord = useMemo(() => type.startsWith(LeaderboardCategory.SPEED), [type]);

  const recordTypeOptions = useMemo(() => {
    // Filter out Economy-related types first
    const nonEconomyTypes = WORLD_RECORD_TYPE_OPTIONS.filter(opt => 
        !opt.value.startsWith("Economy") && opt.value !== WorldRecordType.LONGEST_SURVIVAL_ANY // Temporarily remove Longest Survival if not handled
    );

    // Then, process labels for display (grouping by map for speed, etc.)
    return nonEconomyTypes.map(opt => {
        // For Speed, we want to group by mode (Normal/Glitched) and then select map separately
        if (opt.value.startsWith(LeaderboardCategory.SPEED)) {
            const parts = opt.label.split(" - ");
            if (parts.length >= 2) { // Should be "Speed - Normal - Map" or "Speed - Glitched - Map"
                return {...opt, label: `${parts[0]} - ${parts[1]}`}; // Display as "Speed - Normal" or "Speed - Glitched"
            }
        }
        // For Cosmetics, display full type
        return opt;
    }).filter((opt, index, self) => 
        index === self.findIndex((t) => t.label === opt.label) // Deduplicate based on the new label
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
    
    let finalRecordType = type as WorldRecordType; 
    if (isSpeedRecord) {
        if (!mapName) {
            setError("Map Name is required for speed records.");
            return;
        }
        // Reconstruct the full WorldRecordType string for speed records
        // Type selected in dropdown is "Speed - Normal" or "Speed - Glitched"
        const fullTypeString = `${type} - ${mapName}`; 
        
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

    const recordDataToSubmit: Omit<RecordVerificationData, 'playerId'> = {
      type: finalRecordType,
      value: numericValue,
      proofUrl,
      region: region || undefined,
    };
    submitRecord(recordDataToSubmit);

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
        Note: For time-based records (Speed), enter value in total seconds.
        For other records (Cosmetics), enter the total count.
      </p>

      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={!!success}>Submit Record</Button>
      </div>
    </form>
  );
};