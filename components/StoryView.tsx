import React, { useState } from 'react';
import { useStory } from '../contexts/StoryContext';
import { useStoryAudio } from '../hooks/useStoryAudio';
import StoryIllustration from './StoryIllustration';
import StoryScript from './StoryScript';
import StoryControls from './StoryControls';

const StoryView: React.FC = () => {
  const { pages, currentPageIndex, profile, makeChoice, status } = useStory();
  const page = pages[currentPageIndex];
  
  // Audio Hook manages AudioContext, Dialogue, Ambient, and Volume
  const { ambientVolume, setAmbientVolume } = useStoryAudio(page, profile);
  
  // Track if text has finished typing to reveal controls
  const [textFinished, setTextFinished] = useState(false);

  // When page changes, reset text finished
  React.useEffect(() => {
    setTextFinished(false);
  }, [page]);

  const isLoading = status === 'loading';

  if (!page) return null;

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-6 p-4 max-w-7xl mx-auto relative">
      {/* Volume Control */}
      <div className="absolute top-0 right-4 flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-3 py-1 shadow-sm z-30">
        <span className="text-xs font-bold text-gray-500 uppercase">Ambience</span>
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={ambientVolume}
            onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
            className="w-20 accent-indigo-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Left Column: Visuals */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <StoryIllustration 
          key={page.pageNumber}
          imageUrl={page.imageUrl}
          imagePrompt={page.imagePrompt}
          soundCue={page.soundCue}
          pageNumber={page.pageNumber}
          isLoading={isLoading}
        />
      </div>

      {/* Right Column: Narrative & Interaction */}
      <div className="flex-1 flex flex-col justify-between bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-4 border-indigo-100 h-[600px] overflow-hidden">
        
        <StoryScript 
          key={page.pageNumber}
          lines={page.lines} 
          onFinished={() => setTextFinished(true)} 
        />

        <StoryControls 
          choices={page.choices} 
          onChoice={makeChoice} 
          isLoading={isLoading}
          show={textFinished} 
        />

      </div>
    </div>
  );
};

export default StoryView;