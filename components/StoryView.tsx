import React, { useState, useEffect } from 'react';
import { useStory } from '../contexts/StoryContext';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { playSystemSound, setSfxVolume } from '../services/audioUtils';
import StoryIllustration from './StoryIllustration';
import StoryScript from './StoryScript';
import StoryControls from './StoryControls';
import VolumeControl from './VolumeControl';
import TransitionOverlay from './TransitionOverlay';
import FullStoryView from './FullStoryView';

const StoryView: React.FC = () => {
  const { pages, currentPageIndex, profile, makeChoice, status, error, resetStory, clearError } = useStory();
  const page = pages && pages.length > 0 ? pages[currentPageIndex] : undefined;
  
  // Audio Engine Hook
  const { 
    ambientVolume, setAmbientVolume, 
    dialogueVolume, setDialogueVolume,
    isPlayingDialogue, playDialogue 
  } = useAudioEngine(page, profile);
  
  // SFX Volume State
  const [sfxVolumeState, setSfxVolumeState] = useState(0.5);
  
  const [textFinished, setTextFinished] = useState(false);
  const [showFullBook, setShowFullBook] = useState(false);

  // Update global SFX volume when slider changes
  const handleSfxChange = (v: number) => {
    setSfxVolumeState(v);
    setSfxVolume(v);
  };

  // Play page turn sound when page changes (subtle, non-conflicting)
  useEffect(() => {
    if (page && page.pageNumber > 1) {
      playSystemSound('page-turn');
    }
  }, [page?.pageNumber]);

  // Reset text finished state on new page
  useEffect(() => {
    setTextFinished(false);
  }, [page]);

  const isLoading = status === 'loading';

  // --- Refactored Error View ---
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-2xl mx-auto p-4 animate-pop-in">
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 text-center border-4 border-red-100 relative overflow-hidden w-full">
           {/* Decorative Background Elements */}
           <div className="absolute top-0 left-0 w-full h-3 bg-[repeating-linear-gradient(45deg,#fee2e2,#fee2e2_10px,#fff_10px,#fff_20px)]"></div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>

           <div className="relative z-10 flex flex-col items-center">
              <div className="text-8xl mb-6 transform hover:scale-110 transition-transform cursor-pointer" onClick={() => playSystemSound('pop')}>
                🙈
              </div>
              
              <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Oops!</h2>
              <p className="text-indigo-900/60 font-bold uppercase tracking-widest text-xs mb-6">The magic hiccuped</p>

              <p className="text-slate-600 text-lg mb-8 max-w-md leading-relaxed">
                {error || "It seems our story has hit a little bump in the road. Don't worry, even wizards make mistakes!"}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                 <button 
                   onClick={() => { playSystemSound('click'); clearError(); }} 
                   className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
                 >
                   <span>🔄</span> Try Again
                 </button>
                 <button 
                   onClick={() => { playSystemSound('click'); resetStory(); }} 
                   className="px-8 py-3 bg-white text-slate-600 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                   <span>🏠</span> Start Over
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Fallback for empty state while loading first page
  if (!page && isLoading) {
    return (
        <div className="h-full w-full relative">
            <TransitionOverlay status={status} />
        </div>
    );
  }

  if (!page) return null;

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-6 p-4 max-w-7xl mx-auto relative">
      <TransitionOverlay status={status} />

      {/* Book Overlay */}
      {showFullBook && (
        <FullStoryView 
          pages={pages} 
          profile={profile} 
          onClose={() => setShowFullBook(false)} 
        />
      )}

      {/* Volume Controls */}
      <VolumeControl 
        ambientVolume={ambientVolume}
        onAmbientVolumeChange={setAmbientVolume}
        dialogueVolume={dialogueVolume}
        onDialogueVolumeChange={setDialogueVolume}
        sfxVolume={sfxVolumeState}
        onSfxVolumeChange={handleSfxChange}
      />

      {/* Left: Visuals */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <StoryIllustration 
          key={page.pageNumber}
          imageUrl={page.imageUrl}
          imagePrompt={page.imagePrompt}
          soundCue={page.soundCue}
          pageNumber={page.pageNumber}
          isLoading={isLoading}
          animationStyle={profile.animationStyle}
        />
      </div>

      {/* Right: Narrative */}
      <div className="flex-1 flex flex-col justify-between bg-white/90 backdrop-blur-md rounded-[2rem] p-6 md:p-8 shadow-xl border-4 border-indigo-50 h-[600px] overflow-hidden relative z-0">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-2 min-h-[32px]">
            <div className="flex items-center gap-2">
               <button onClick={() => { if (window.confirm("Start a new story?")) resetStory(); }} className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                 🏠 Exit
               </button>
               {pages.length > 1 && (
                 <button onClick={() => setShowFullBook(true)} className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1">
                    📖 Read Book
                 </button>
               )}
            </div>
            
            <button 
              onClick={playDialogue} 
              disabled={isPlayingDialogue} 
              className={`
                px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1
                ${isPlayingDialogue 
                  ? 'bg-indigo-100 text-indigo-400 cursor-default' 
                  : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-105 active:scale-95'
                }
              `}
            >
              {isPlayingDialogue ? "🔊 Playing..." : "🗣️ Read Aloud"}
            </button>
        </div>

        {/* Script Display */}
        <StoryScript 
          key={page.pageNumber} 
          lines={page.lines} 
          userAvatar={profile.avatar}
          sidekick={page.sidekick}
          onFinished={() => setTextFinished(true)} 
        />
        
        {/* Interactive Controls */}
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