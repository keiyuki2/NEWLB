import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { WorldRecord, Player } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { WRPlayerCard } from './WRPlayerCard'; // New import
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { RecordSubmissionForm } from './RecordSubmissionForm'; 
import { Card } from '../ui/Card'; // Keep for info card

const WorldRecordsInfoCard: React.FC = () => (
    <Card className="mb-6 bg-dark-surface/80 backdrop-blur-sm border-dark-border">
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <h3 className="font-semibold text-gray-100 mb-1">World Record Showcase</h3>
                <p className="text-xs text-gray-400">Explore the most prestigious achievements in Evade! Each card represents a top-tier record. Use the arrows to navigate.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-100 mb-1">Submitting Records</h3>
                <p className="text-xs text-gray-400">Think you've set a new record? Click "Submit Record" to send your proof for verification by our admin team.</p>
            </div>
        </div>
    </Card>
);

export const WorldRecordsPage: React.FC = () => {
  const { worldRecords: allRecords, players: allPlayers, loading, currentUser } = useAppContext();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [direction, setDirection] = useState<'initial' | 'next' | 'prev'>('initial');

  const recordsWithPlayers = useMemo(() => {
    return allRecords
      .filter(record => record.isVerified) 
      .map(record => ({
        record,
        player: allPlayers.find(p => p.id === record.playerId),
      }))
      .filter(item => item.player) 
      .sort((a,b) => new Date(b.record.timestamp).getTime() - new Date(a.record.timestamp).getTime());
  }, [allRecords, allPlayers]);

  const prevRecord = useCallback(() => {
    if (recordsWithPlayers.length === 0) return;
    setDirection('prev');
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : recordsWithPlayers.length - 1));
    setAnimationKey(prev => prev + 1);
  }, [recordsWithPlayers.length, setCurrentIndex, setAnimationKey, setDirection]);

  const nextRecord = useCallback(() => {
    if (recordsWithPlayers.length === 0) return;
    setDirection('next');
    setCurrentIndex((prevIndex) => (prevIndex < recordsWithPlayers.length - 1 ? prevIndex + 1 : 0));
    setAnimationKey(prev => prev + 1);
  }, [recordsWithPlayers.length, setCurrentIndex, setAnimationKey, setDirection]);
  

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevRecord();
      } else if (event.key === 'ArrowRight') {
        nextRecord();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [prevRecord, nextRecord]);
  
  // Reset direction after animation key changes to allow re-triggering same direction
  useEffect(() => {
    if (direction !== 'initial') {
        const timer = setTimeout(() => setDirection('initial'), 700); 
        return () => clearTimeout(timer);
    }
  }, [animationKey, direction]);


  if (loading && !recordsWithPlayers.length) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <LoadingSpinner size="lg" text="Loading World Records..." />
      </div>
    );
  }
  
  const getAnimationClass = (
    slot: 'active' | 'left-preview' | 'right-preview',
    currentDirection: 'initial' | 'next' | 'prev'
    ): string => {
    if (currentDirection === 'initial') {
        if (slot === 'active') return 'animate-carousel-card-active-enter';
        if (slot === 'left-preview') return 'animate-carousel-card-preview-enter-left';
        if (slot === 'right-preview') return 'animate-carousel-card-preview-enter-right';
        return '';
    }

    if (slot === 'active') {
        return currentDirection === 'next' ? 'animate-right-preview-to-active' : 'animate-left-preview-to-active';
    }
    if (slot === 'left-preview') {
        return currentDirection === 'next' ? 'animate-active-to-left-preview' : 'animate-carousel-card-preview-enter-left'; 
    }
    if (slot === 'right-preview') {
        return currentDirection === 'prev' ? 'animate-active-to-right-preview' : 'animate-carousel-card-preview-enter-right'; 
    }
    return '';
  };


  const activeCardData = recordsWithPlayers[currentIndex];
  const leftPreviewIndex = (currentIndex - 1 + recordsWithPlayers.length) % recordsWithPlayers.length;
  const rightPreviewIndex = (currentIndex + 1) % recordsWithPlayers.length;

  const leftPreviewData = recordsWithPlayers.length > 1 ? recordsWithPlayers[leftPreviewIndex] : null;
  const actualLeftPreviewData = recordsWithPlayers.length === 2 && leftPreviewData?.record.id === activeCardData?.record.id ? null : leftPreviewData;
  
  const rightPreviewData = recordsWithPlayers.length > 1 ? recordsWithPlayers[rightPreviewIndex] : null;
  const actualRightPreviewData = recordsWithPlayers.length === 2 && rightPreviewData?.record.id === activeCardData?.record.id ? null : rightPreviewData;


  return (
    <div className="world-records-page-container relative min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-10rem)] flex flex-col items-center justify-start pt-6 pb-12 px-2 z-0">
      <div className="relative z-10 w-full max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-0 text-center md:text-left">
            World Record Holders
          </h1>
          {currentUser && (
              <Button 
                onClick={() => setShowSubmitModal(true)} 
                variant="secondary" 
                size="md" 
                leftIcon={<i className="fas fa-upload"/>}
                className="shadow-lg hover:shadow-pink-500/50 transition-shadow"
              >
                  Submit Your Record
              </Button>
          )}
        </div>
        <WorldRecordsInfoCard />
      </div>
      
      {recordsWithPlayers.length === 0 && !loading && (
        <div className="relative z-10 text-center text-gray-300 py-20">
          <i className="fas fa-trophy text-6xl text-gray-500 mb-4"></i>
          <p className="text-xl">No Verified World Records Yet!</p>
          <p className="text-sm text-gray-400">Be the first to set a legendary record.</p>
        </div>
      )}

      {recordsWithPlayers.length > 0 && (
        <div className="relative w-full h-[70vh] sm:h-[75vh] flex items-center justify-center mt-4 z-10 perspective-1000">
          
          {actualLeftPreviewData && currentIndex !== leftPreviewIndex && (
            <div 
              key={`left-${leftPreviewIndex}-${animationKey}`}
              className={`hidden md:block absolute left-[0%] lg:left-[5%] top-1/2 w-auto h-[80%] 
                          ${getAnimationClass('left-preview', direction)}`}
              style={{transformOrigin: 'center right'}} 
            >
              <WRPlayerCard 
                record={actualLeftPreviewData.record} 
                player={actualLeftPreviewData.player!} 
                isActive={false}
                isPreview={true}
                index={leftPreviewIndex} 
              />
            </div>
          )}

          {activeCardData && (
            <div 
              key={`active-${currentIndex}-${animationKey}`}
              className={`relative z-20 w-auto h-full max-h-[560px] sm:max-h-[640px] flex justify-center items-center
                          ${getAnimationClass('active', direction)}`}
              style={{transformOrigin: 'center center'}}
            >
              <WRPlayerCard 
                record={activeCardData.record} 
                player={activeCardData.player!} 
                isActive={true} 
                index={currentIndex}
              />
            </div>
          )}

           {actualRightPreviewData && currentIndex !== rightPreviewIndex && (
            <div 
              key={`right-${rightPreviewIndex}-${animationKey}`}
              className={`hidden md:block absolute right-[0%] lg:right-[5%] top-1/2 w-auto h-[80%]
                          ${getAnimationClass('right-preview', direction)}`}
              style={{transformOrigin: 'center left'}} 
            >
              <WRPlayerCard 
                record={actualRightPreviewData.record} 
                player={actualRightPreviewData.player!} 
                isActive={false}
                isPreview={true}
                index={rightPreviewIndex}
              />
            </div>
          )}
        </div>
      )}

       {recordsWithPlayers.length > 1 && (
        <>
          <Button 
            onClick={prevRecord} 
            variant="ghost" 
            className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all"
            aria-label="Previous Record"
          >
            <i className="fas fa-chevron-left text-lg md:text-xl"></i>
          </Button>
          <Button 
            onClick={nextRecord} 
            variant="ghost" 
            className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all"
            aria-label="Next Record"
          >
            <i className="fas fa-chevron-right text-lg md:text-xl"></i>
          </Button>
        </>
      )}

      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit a New World Record" size="lg">
        <RecordSubmissionForm onClose={() => setShowSubmitModal(false)} />
      </Modal>
    </div>
  );
};