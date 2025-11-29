import React, { useState, useEffect } from 'react';
import { useStory } from '../contexts/StoryContext';
import { useAudioEngine } from '../hooks/useAudioEngine';
import StoryIllustration from './StoryIllustration';
import StoryScript from './StoryScript';
import StoryControls from './StoryControls';
import VolumeControl from './VolumeControl';
import TransitionOverlay from './TransitionOverlay';

const StoryView: React.FC = () => {
  const { pages, currentPageIndex, profile, makeChoice, status, resetStory } = useStory();
  const page = pages[currentPageIndex];
  
  // New Audio Engine Hook
  const { 
    ambientVolume, setAmbientVolume, 
    dialogueVolume, setDialogueVolume,
    isPlayingDialogue, playDialogue 
  } = useAudioEngine(page, profile);
  
  const [textFinished, setTextFinished] = useState(false);

  useEffect(() => {
    setTextFinished(false);
  }, [page]);

  const isLoading = status === 'loading';

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-6 p-4 max-w-7xl mx-auto relative">
      <TransitionOverlay status={status} />

      {page && (
        <VolumeControl 
          ambientVolume={ambientVolume}
          onAmbientVolumeChange={setAmbientVolume}
          dialogueVolume={dialogueVolume}
          onDialogueVolumeChange={setDialogueVolume}
        />
      )}

      {/* Visuals */}
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

      {/* Narrative */}
      <div className="flex-1 flex flex-col justify-between bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-4 border-indigo-100 h-[600px] overflow-hidden relative z-0">
        <div className="flex justify-between items-center mb-2 min-h-[32px]">
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Script</span>
               <button onClick={() => { if (window.confirm("Start a new story?")) resetStory(); }} className="text-xs bg-indigo-50 text-indigo-400 px-2 py-1 rounded hover:bg-red-50 hover:text-red-500 transition-colors">🏠 New</button>
            </div>
            {page && (
              <button onClick={playDialogue} disabled={isPlayingDialogue} className={isPlayingDialogue ? 'bg-indigo-100 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-bold' : 'bg-indigo-500 text-white hover:bg-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm'}>
                {isPlayingDialogue ? "🔊 Playing..." : "🗣️ Read Aloud"}
              </button>
            )}
        </div>

        {page && <StoryScript key={page.pageNumber} lines={page.lines} onFinished={() => setTextFinished(true)} />}
        {page && <StoryControls choices={page.choices} onChoice={makeChoice} isLoading={isLoading} show={textFinished} />}
      </div>
    </div>
  );
};

export default StoryView;
