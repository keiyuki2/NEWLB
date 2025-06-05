
import React from 'react';
import { LeaderboardCategory, SpeedSubCategory, CosmeticsSubCategory } from '../../types';
import { LEADERBOARD_CATEGORIES, SPEED_SUB_CATEGORIES_OPTIONS, COSMETICS_SUB_CATEGORIES_OPTIONS, MAP_FILTER_OPTIONS } from '../../constants';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Select } from '../ui/Select';

export interface LeaderboardFiltersState {
  category: LeaderboardCategory;
  subCategory: SpeedSubCategory | CosmeticsSubCategory | null; 
  searchQuery: string;
  selectedMap?: string; 
}

interface LeaderboardFiltersProps {
  filters: LeaderboardFiltersState;
  onFilterChange: <K extends keyof LeaderboardFiltersState>(key: K, value: LeaderboardFiltersState[K]) => void;
  onApplyFilters: () => void;
  onRefresh: () => void;
}

export const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onRefresh,
}) => {

  const handleCategoryChange = (category: LeaderboardCategory) => {
    onFilterChange('category', category);
    if (category === LeaderboardCategory.SPEED) {
        onFilterChange('subCategory', SPEED_SUB_CATEGORIES_OPTIONS[0].value);
        // Keep existing map filter or default to all maps if not already set for speed
        onFilterChange('selectedMap', filters.selectedMap && filters.category === LeaderboardCategory.SPEED ? filters.selectedMap : MAP_FILTER_OPTIONS[0].value);
    } else if (category === LeaderboardCategory.COSMETICS) {
        onFilterChange('subCategory', COSMETICS_SUB_CATEGORIES_OPTIONS[0].value);
        onFilterChange('selectedMap', ''); // Clear map for non-speed
    } else { 
        onFilterChange('subCategory', null);
        onFilterChange('selectedMap', ''); // Clear map for non-speed
    }
  };

  const handleSubCategoryChange = (subCategory: SpeedSubCategory | CosmeticsSubCategory) => {
    onFilterChange('subCategory', subCategory);
  };
  
  const getSubCategoryOptions = () => {
    switch (filters.category) {
      case LeaderboardCategory.SPEED: return SPEED_SUB_CATEGORIES_OPTIONS;
      case LeaderboardCategory.COSMETICS: return COSMETICS_SUB_CATEGORIES_OPTIONS;
      default: return [];
    }
  };

  const subCategoryOptions = getSubCategoryOptions();
  const selectedMapObject = filters.selectedMap ? MAP_FILTER_OPTIONS.find(opt => opt.value === filters.selectedMap) : null;

  return (
    <Card className="!bg-transparent border-none shadow-none p-0 mb-4">
        <div className="flex flex-col space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                <div className="flex flex-wrap gap-2">
                    {LEADERBOARD_CATEGORIES.map(cat => (
                    <Button
                        key={cat.value}
                        variant="filter"
                        size="md"
                        isActive={filters.category === cat.value}
                        onClick={() => handleCategoryChange(cat.value)}
                        leftIcon={<i className={`${cat.icon} text-xs`}></i>}
                    >
                        {cat.label}
                    </Button>
                    ))}
                </div>
            </div>

            {subCategoryOptions.length > 0 && (
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">{filters.category} Sub-Category</label>
                    <div className="flex flex-wrap gap-2">
                        {subCategoryOptions.map(subCat => (
                        <Button
                            key={subCat.value}
                            variant="filter"
                            size="sm" 
                            isActive={filters.subCategory === subCat.value}
                            onClick={() => handleSubCategoryChange(subCat.value as SpeedSubCategory | CosmeticsSubCategory)}
                        >
                            {subCat.label}
                        </Button>
                        ))}
                    </div>
                </div>
            )}

            {filters.category === LeaderboardCategory.SPEED && (
                <div className="mt-3 pt-3 border-t border-dark-border/50 space-y-3">
                    <Alert type="info" title="Speed Mode Definitions">
                        <p className="text-xs">
                            In Speed mode, 'Glitched' runs allow any movement or physics exploits, 
                            while 'Normal' runs must follow standard game mechanics without using bugs or unintended shortcuts.
                        </p>
                    </Alert>
                    <div>
                        <label htmlFor="map-filter" className="block text-xs font-medium text-gray-400 mb-1">
                            Filter by Map (Speed)
                        </label>
                        <div className="flex items-center space-x-3">
                            <Select
                                id="map-filter"
                                options={MAP_FILTER_OPTIONS}
                                value={filters.selectedMap || ''}
                                onChange={(e) => onFilterChange('selectedMap', e.target.value)}
                                className="bg-dark-surface border-dark-border focus:border-brand-primary flex-grow"
                                wrapperClassName="bg-dark-surface rounded-md flex-grow"
                                placeholder="Select a map..."
                            />
                            {selectedMapObject && selectedMapObject.imageUrl && (
                                <img 
                                    src={selectedMapObject.imageUrl} 
                                    alt={`Preview of ${selectedMapObject.label}`}
                                    className="w-24 h-14 object-cover rounded-md border border-dark-border" 
                                    title={selectedMapObject.label}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex flex-col md:flex-row md:items-end md:space-x-3 pt-2 space-y-3 md:space-y-0">
                <div className="flex-grow">
                    <label htmlFor="leaderboard-search" className="block text-xs font-medium text-gray-400 mb-1">Search Players</label>
                    <Input
                        id="leaderboard-search"
                        placeholder="Username or Roblox ID"
                        value={filters.searchQuery}
                        onChange={(e) => onFilterChange('searchQuery', e.target.value)}
                        icon={<i className="fas fa-search text-xs opacity-50"></i>}
                        className="bg-dark-surface border-dark-border focus:border-brand-primary"
                        wrapperClassName="bg-dark-surface rounded-md"
                    />
                </div>
                
                <div className="flex items-end space-x-2">
                    <Button onClick={onRefresh} variant="outline" size="md" leftIcon={<i className="fas fa-sync-alt"></i>}>
                        Refresh
                    </Button>
                </div>
            </div>
        </div>
    </Card>
  );
};