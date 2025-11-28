
import React, { useState, useEffect } from 'react';
import { useStory } from '../contexts/StoryContext';
import { useStoryAudio } from '../hooks/useStoryAudio';
import StoryIllustration from './StoryIllustration';
import StoryScript from './StoryScript';
import StoryControls from './StoryControls';
import VolumeControl from './VolumeControl';
import TransitionOverlay from './TransitionOverlay';

const StoryView: React.FC = () => {
  const { pages, currentPageIndex, profile, makeChoice, status } = useStory();
  const page = pages[currentPageIndex];
  
  // Audio Hook manages AudioContext, Dialogue, Ambient, and Volume
  const { ambientVolume, setAmbientVolume, dialogueVolume, setDialogueVolume } = useStoryAudio(page, profile);
  
  // Track if text has finished typing to reveal controls
  const [textFinished, setTextFinished] = useState(false);

  // When page changes, reset text finished
  useEffect(() => {
    setTextFinished(false);
  }, [page]);

  const isLoading = status === 'loading';

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-6 p-4 max-w-7xl mx-auto relative">
      
      <TransitionOverlay status={status} />

      {/* Volume Controls */}
      {page && (
        <VolumeControl 
          ambientVolume={ambientVolume}
          onAmbientVolumeChange={setAmbientVolume}
          dialogueVolume={dialogueVolume}
          onDialogueVolumeChange={setDialogueVolume}
        />
      )}

      {/* Left Column: Visuals */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {page && (
            <StoryIllustration 
              key={page.pageNumber}
              imageUrl={page.imageUrl}
              imagePrompt={page.imagePrompt}
              soundCue={page.soundCue}
              pageNumber={page.pageNumber}
              isLoading={isLoading}
            />
        )}
      </div>

      {/* Right Column: Narrative & Interaction */}
      <div className="flex-1 flex flex-col justify-between bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-4 border-indigo-100 h-[600px] overflow-hidden relative z-0">
        
        {page && (
            <StoryScript 
              key={page.pageNumber}
              lines={page.lines} 
              onFinished={() => setTextFinished(true)} 
            />
        )}

        {page && (
            <StoryControls 
              choices={page.choices} 
              onChoice={makeChoice} 
              isLoading={isLoading}
              show={textFinished} 
            />
        )}
      </div>
    </div>
  );
};

export default StoryView;
