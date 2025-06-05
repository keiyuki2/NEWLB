
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Badge, BadgeCategory } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { EditBadgeModal } from './EditBadgeModal'; 
import { Tooltip } from '../ui/Tooltip';

export const ManageBadgesSection: React.FC = () => {
  const { badges, deleteBadge, usernameColorTags } = useAppContext();
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredBadges = useMemo(() => {
    return badges.filter(badge => 
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [badges, searchTerm]);

  const handleDeleteBadge = (badgeId: string) => {
    const badgeToDelete = badges.find(b => b.id === badgeId);
    if (badgeToDelete && window.confirm(`Are you sure you want to delete the badge "${badgeToDelete.name}"? This action cannot be undone and will remove it from all players.`)) {
      deleteBadge(badgeId);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }).catch(err => console.error("Failed to copy ID:", err));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-100">Manage Existing Badges ({filteredBadges.length})</h2>
      </div>
      <Input
        placeholder="Search badges by name, ID, category, or description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={<i className="fas fa-search"></i>}
      />

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Icon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Visible</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Color Tag</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredBadges.map(badge => {
                const linkedTag = badge.colorTagId ? usernameColorTags.find(t => t.id === badge.colorTagId) : null;
                return (
                    <tr key={badge.id} className={`hover:bg-gray-700/30 transition-colors ${!badge.isVisible ? 'opacity-60 bg-gray-800/50' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap text-lg">
                        <i className={`${badge.iconClass} ${badge.colorClass}`}></i>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400 font-mono">
                      <Tooltip text={copiedId === badge.id ? "Copied!" : "Copy ID"} position="top">
                        <span onClick={() => handleCopyId(badge.id)} className="cursor-pointer hover:text-brand-accent">
                          {badge.id.substring(0, 15)}{badge.id.length > 15 ? '...' : ''}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">{badge.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{badge.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{badge.value ?? 0}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {badge.isVisible ? 
                            <span className="text-green-400"><i className="fas fa-check-circle mr-1"></i>Yes</span> : 
                            <span className="text-red-400"><i className="fas fa-times-circle mr-1"></i>No</span>
                        }
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {linkedTag ? (
                            <span className="text-xs bg-purple-600/50 text-purple-300 px-1.5 py-0.5 rounded">
                                <i className={`${linkedTag.iconClass || 'fas fa-palette'} mr-1`}></i>{linkedTag.name}
                            </span>
                        ) : badge.usernameColorUnlock ? (
                            <span className="text-xs bg-yellow-600/50 text-yellow-300 px-1.5 py-0.5 rounded">Direct Style</span>
                        ): (
                            <span className="text-xs text-gray-500">None</span>
                        )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button size="xs" variant="outline" onClick={() => setEditingBadge(badge)}>Edit</Button>
                        <Button size="xs" variant="danger" onClick={() => handleDeleteBadge(badge.id)}>Delete</Button>
                    </td>
                    </tr>
                );
            })}
              {filteredBadges.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-400">No badges found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingBadge && (
        <EditBadgeModal
          isOpen={!!editingBadge}
          onClose={() => setEditingBadge(null)}
          badge={editingBadge}
        />
      )}
    </div>
  );
};
