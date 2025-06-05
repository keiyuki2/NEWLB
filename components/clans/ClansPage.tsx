import React, { useState, useMemo } from 'react';
import { Clan } from '../../types';
import { ClanCard } from './ClanCard';
import { Input } from '../ui/Input';
import { useAppContext } from '../../contexts/AppContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ClanCreationForm } from './ClanCreationForm'; 
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { CLAN_STATUS_OPTIONS } from '../../constants';

const ClanInfoCard: React.FC = () => (
    <Card className="mb-6">
        <div className="grid md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
                <h3 className="font-semibold text-gray-100 mb-1">Creating a Clan</h3>
                <p className="text-xs text-gray-400">To create a clan, submit an application with your clan name, tag, and description. Once approved, you can invite members to join.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-100 mb-1">Verification</h3>
                <p className="text-xs text-gray-400">Verified clans have proven their legitimacy through Discord validation and external community presence. Verification brings additional benefits.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-100 mb-1">Clan Rankings</h3>
                <p className="text-xs text-gray-400">Clans are ranked based on the combined performance of their members across all game modes and metrics.</p>
            </div>
        </div>
    </Card>
);


export const ClansPage: React.FC = () => {
  const { clans: allClans, loading, currentUser } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredClans = useMemo(() => {
    return allClans.filter(clan =>
      (clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clan.tag.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === '' || clan.activityStatus === statusFilter)
    );
  }, [allClans, searchQuery, statusFilter]);

  if (loading && !allClans.length) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-100 mb-4 md:mb-0">
          Clans
        </h1>
        {currentUser && (
          <Button onClick={() => setShowCreateModal(true)} variant="primary" size="sm" leftIcon={<i className="fas fa-plus"></i>}>
            Create Clan
          </Button>
        )}
      </div>

      <Card title="EVADE Competitive Clans" titleIcon={<i className="fas fa-shield-alt opacity-80"/>}>
         <ClanInfoCard />
      </Card>
      
      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-5 p-1 items-end">
            <Input
                wrapperClassName="flex-grow"
                placeholder="Search by clan name or tag"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<i className="fas fa-search text-xs opacity-50"></i>}
            />
            <Select
                wrapperClassName="md:max-w-xs w-full"
                options={CLAN_STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            />
        </div>

        {loading && <div className="py-10"><LoadingSpinner text="Loading clans..." /></div>}
        {!loading && filteredClans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClans.map(clan => (
                <ClanCard key={clan.id} clan={clan} />
            ))}
            </div>
        ) : !loading && (
            <p className="text-center text-gray-500 text-md py-12">No clans found matching your search criteria.</p>
        )}
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create a New Clan">
        <ClanCreationForm onClose={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};