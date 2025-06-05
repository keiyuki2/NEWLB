
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { Input } from '../ui/Input'; 
import { LeaderboardCategory, LeaderboardWeights } from '../../types';
import { LEADERBOARD_CATEGORIES } from '../../constants';

export const LeaderboardManagementSection: React.FC = () => {
  const { 
    resetLeaderboardForSeason, 
    refreshLeaderboard, 
    loading: contextLoading, 
    leaderboardWeights: currentGlobalWeights,
    updateLeaderboardWeights
  } = useAppContext();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  const [editableWeights, setEditableWeights] = useState<LeaderboardWeights>({
    [LeaderboardCategory.SPEED]: 60,
    [LeaderboardCategory.COSMETICS]: 40,
  });
  const [weightsError, setWeightsError] = useState<string | null>(null);
  const [weightsSuccess, setWeightsSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with current global weights for Speed and Cosmetics, or default
    const initialSpeed = currentGlobalWeights[LeaderboardCategory.SPEED];
    const initialCosmetics = currentGlobalWeights[LeaderboardCategory.COSMETICS];

    let speedWeight = 60;
    let cosmeticsWeight = 40;

    if (typeof initialSpeed === 'number' && typeof initialCosmetics === 'number') {
        if (initialSpeed + initialCosmetics === 100) {
            speedWeight = initialSpeed;
            cosmeticsWeight = initialCosmetics;
        } else if (initialSpeed + initialCosmetics > 0) { // Normalize if sum is not 100 but > 0
            const sum = initialSpeed + initialCosmetics;
            speedWeight = Math.round((initialSpeed / sum) * 100);
            cosmeticsWeight = 100 - speedWeight;
        }
        // If sum is 0, defaults (60/40) will be used.
    } else if (typeof initialSpeed === 'number') { // Only speed is defined
        speedWeight = Math.max(0, Math.min(100, initialSpeed));
        cosmeticsWeight = 100 - speedWeight;
    } else if (typeof initialCosmetics === 'number') { // Only cosmetics is defined
        cosmeticsWeight = Math.max(0, Math.min(100, initialCosmetics));
        speedWeight = 100 - cosmeticsWeight;
    }
    // Else, defaults (60/40) are used.
    
    setEditableWeights({
        [LeaderboardCategory.SPEED]: speedWeight,
        [LeaderboardCategory.COSMETICS]: cosmeticsWeight,
    });
  }, [currentGlobalWeights]);

  const CONFIRMATION_PHRASE = "RESET ALL DATA";

  const handleOpenResetModal = () => {
    setResetError(null);
    setResetConfirmationText('');
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = async () => {
    if (resetConfirmationText !== CONFIRMATION_PHRASE) {
      setResetError(`Incorrect confirmation phrase. Please type "${CONFIRMATION_PHRASE}".`);
      return;
    }
    setResetError(null);
    await resetLeaderboardForSeason();
    setIsResetModalOpen(false);
  };

  const handleRefreshLeaderboards = async () => {
    alert("Simulating leaderboard refresh. Check console for details.");
    await refreshLeaderboard();
  };

  const handleWeightChange = (category: LeaderboardCategory.SPEED | LeaderboardCategory.COSMETICS, value: string) => {
    setWeightsSuccess(null);
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        setWeightsError("Weights must be numbers between 0 and 100.");
        setEditableWeights(prev => ({
            ...prev,
            [category]: isNaN(numValue) ? (prev[category] || 0) : Math.max(0, Math.min(100, numValue))
        }));
        return;
    }
    setWeightsError(null);
    setEditableWeights(prev => ({
        ...prev,
        [category]: numValue
    }));
  };

  const totalWeight = (editableWeights[LeaderboardCategory.SPEED] || 0) + (editableWeights[LeaderboardCategory.COSMETICS] || 0);


  const handleSaveWeights = () => {
    setWeightsError(null);
    setWeightsSuccess(null);
    if (totalWeight !== 100) {
        setWeightsError("Total weight for Speed and Cosmetics must sum to 100%.");
        return;
    }
    const weightsToSave: LeaderboardWeights = {
        [LeaderboardCategory.SPEED]: editableWeights[LeaderboardCategory.SPEED] || 0,
        [LeaderboardCategory.COSMETICS]: editableWeights[LeaderboardCategory.COSMETICS] || 0,
    };
    updateLeaderboardWeights(weightsToSave);
    setWeightsSuccess("Leaderboard weights saved successfully!");
  };

  const displayCategories = LEADERBOARD_CATEGORIES.filter(
    cat => cat.value === LeaderboardCategory.SPEED || cat.value === LeaderboardCategory.COSMETICS
  );


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-100">Leaderboard Management</h2>

      <Card title="Season Management" titleIcon={<i className="fas fa-calendar-alt" />}>
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Resetting for a new season is a critical operation. This will clear all current World Records 
            and reset player Speed stats to zero. Cosmetics and Time Alive stats will be preserved. 
            This action cannot be undone.
          </p>
          <Alert type="warning" title="Critical Action Notice">
            Proceed with extreme caution. It's recommended to backup data or announce to users before performing a season reset.
          </Alert>
          <Button 
            variant="danger" 
            size="lg" 
            onClick={handleOpenResetModal}
            leftIcon={<i className="fas fa-exclamation-triangle"/>}
            isLoading={contextLoading} 
            disabled={contextLoading}
          >
            Reset All Leaderboards & Stats for New Season
          </Button>
        </div>
      </Card>

      <Card title="Overall Leaderboard Weights" titleIcon={<i className="fas fa-balance-scale"/>}>
        <div className="space-y-4">
            <p className="text-sm text-gray-300 mb-2">
                Define the percentage weight Speed and Cosmetics contribute to the Overall Player Rankings. 
                The total weight must sum to 100%.
            </p>
            {weightsError && <Alert type="error" onClose={() => setWeightsError(null)}>{weightsError}</Alert>}
            {weightsSuccess && <Alert type="success" onClose={() => setWeightsSuccess(null)}>{weightsSuccess}</Alert>}

            {displayCategories.map(categoryInfo => (
                 <div key={categoryInfo.value} className="flex items-center space-x-3">
                    <label htmlFor={`weight-${categoryInfo.value}`} className="w-1/3 text-sm font-medium text-gray-300">
                        <i className={`${categoryInfo.icon} mr-2 opacity-70`}></i>{categoryInfo.label} Weight (%):
                    </label>
                    <Input
                        id={`weight-${categoryInfo.value}`}
                        type="number"
                        min="0"
                        max="100"
                        value={editableWeights[categoryInfo.value as LeaderboardCategory.SPEED | LeaderboardCategory.COSMETICS]?.toString() || '0'}
                        onChange={(e) => handleWeightChange(categoryInfo.value as LeaderboardCategory.SPEED | LeaderboardCategory.COSMETICS, e.target.value)}
                        className="w-24 text-center"
                        disabled={contextLoading}
                    />
                </div>
            ))}
            <div className="pt-2 border-t border-dark-border">
                <p className={`text-md font-semibold ${totalWeight === 100 ? 'text-green-400' : 'text-red-400'}`}>
                    Total Weight: {totalWeight}%
                </p>
            </div>
            <Button 
                variant="primary" 
                onClick={handleSaveWeights} 
                disabled={totalWeight !== 100 || contextLoading}
                isLoading={contextLoading && totalWeight === 100}
                leftIcon={<i className="fas fa-save"/>}
            >
                Save Weights
            </Button>
        </div>
      </Card>


      <Card title="General Leaderboard Tools" titleIcon={<i className="fas fa-tools"/>}>
         <div className="space-y-4">
            <p className="text-sm text-gray-300">
                Use these tools for general leaderboard maintenance.
            </p>
            <Button 
                variant="outline" 
                size="md" 
                onClick={handleRefreshLeaderboards}
                leftIcon={<i className="fas fa-sync-alt"/>}
                isLoading={contextLoading}
                disabled={contextLoading}
            >
                Refresh Leaderboard Data (Simulated)
            </Button>
            <p className="text-xs text-gray-500">
                This currently simulates a refresh. In a live environment, this would re-fetch or re-calculate rankings.
            </p>
         </div>
      </Card>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Confirm Season Reset" size="md">
        <div className="space-y-4">
          <p className="text-red-400 font-semibold">
            WARNING: This will delete all World Records and reset key player statistics (Speed). 
            Cosmetics and Time Alive will be preserved. This action is irreversible.
          </p>
          {resetError && <Alert type="error">{resetError}</Alert>}
          <label htmlFor="resetConfirmInput" className="block text-sm font-medium text-gray-300">
            To confirm, please type: <strong className="text-red-300">{CONFIRMATION_PHRASE}</strong>
          </label>
          <Input
            id="resetConfirmInput"
            type="text"
            value={resetConfirmationText}
            onChange={(e) => setResetConfirmationText(e.target.value)}
            className="border-red-500 focus:ring-red-500"
            autoFocus
            disabled={contextLoading}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsResetModalOpen(false)} disabled={contextLoading}>Cancel</Button>
            <Button 
                variant="danger" 
                onClick={handleConfirmReset} 
                disabled={resetConfirmationText !== CONFIRMATION_PHRASE || contextLoading}
                isLoading={contextLoading && resetConfirmationText === CONFIRMATION_PHRASE}
            >
                Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};