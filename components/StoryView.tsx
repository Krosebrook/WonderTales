import React, { useState, useEffect } from 'react';
import { useStory } from '../contexts/StoryContext';
import { useStoryAudio } from '../hooks/useStoryAudio';
import StoryIllustration from './StoryIllustration';
import StoryScript from './StoryScript';
import StoryControls from './StoryControls';
import VolumeControl from './VolumeControl';
import TransitionOverlay from './TransitionOverlay';

const StoryView: React.FC = () => {
  const { pages, currentPageIndex, profile, makeChoice, status, resetStory } = useStory();
  const page = pages[currentPageIndex];
  
  // Audio Hook manages AudioContext, Dialogue, Ambient, and Volume
  const { 
    ambientVolume, setAmbientVolume, 
    dialogueVolume, setDialogueVolume,
    isPlayingDialogue, playDialogue 
  } = useStoryAudio(page, profile);
  
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
              animationStyle={profile.animationStyle}
            />
        )}
      </div>

      {/* Right Column: Narrative & Interaction */}
      <div className="flex-1 flex flex-col justify-between bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-4 border-indigo-100 h-[600px] overflow-hidden relative z-0">
        
        {/* Header with Read Aloud & Home Button */}
        <div className="flex justify-between items-center mb-2 min-h-[32px]">
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Script</span>
               <button 
                  onClick={() => {
                    if (window.confirm("Start a new story? This one will be lost.")) {
                      resetStory();
                    }
                  }}
                  className="text-xs bg-indigo-50 text-indigo-400 px-2 py-1 rounded hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Start New Story"
               >
                 🏠 New
               </button>
            </div>

            {page && (
              <button 
                onClick={playDialogue}
                disabled={isPlayingDialogue}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                  ${isPlayingDialogue 
                    ? 'bg-indigo-100 text-indigo-400 cursor-default' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm hover:shadow-md cursor-pointer active:scale-95'}
                `}
              >
                {isPlayingDialogue ? (
                  <>
                    <span className="animate-pulse">🔊</span> Playing...
                  </>
                ) : (
                  <>
                    <span>🗣️</span> Read Aloud
                  </>
                )}
              </button>
            )}
        </div>

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