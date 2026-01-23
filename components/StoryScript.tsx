
import React, { useEffect, useRef } from 'react';
import { ScriptLine, SidekickData } from '../types';
import { useTypewriter } from '../hooks/useTypewriter';

interface StoryScriptProps {
  lines: ScriptLine[];
  userAvatar: string;
  sidekick?: SidekickData;
  onFinished: () => void;
}

const StoryScript: React.FC<StoryScriptProps> = ({ lines, userAvatar, sidekick, onFinished }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { displayedLineIndex, displayedText, allFinished } = useTypewriter({ lines, onFinished });

  // Scroll to bottom when new line appears
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedLineIndex, displayedText]);

  // Helper to determine speaker type
  const getSpeakerType = (speaker: string) => {
    if (speaker === 'Narrator') return 'narrator';
    if (speaker === 'SoundFX') return 'sfx';
    if (sidekick && speaker.includes(sidekick.name)) return 'sidekick';
    if (sidekick && speaker === 'Sidekick') return 'sidekick';
    // Assume user is the default fallback or specific name match if we passed name prop
    return 'hero';
  };

  const getAvatar = (type: string) => {
    switch (type) {
      case 'narrator': return '📖';
      case 'sfx': return '🔊';
      case 'sidekick': return sidekick?.emoji || '🤖';
      case 'hero': return userAvatar;
      default: return '👤';
    }
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-1 py-2 space-y-6 scroll-smooth">
        <style>{`
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-pop-in {
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}</style>
        {lines.map((line, idx) => {
            if (idx > displayedLineIndex) return null;
            
            const isCurrent = idx === displayedLineIndex;
            const textToShow = isCurrent && !allFinished ? displayedText : line.text;
            const type = getSpeakerType(line.speaker);
            const avatar = getAvatar(type);
            
            // Layout Logic
            const isHero = type === 'hero';
            const isNarrator = type === 'narrator';
            const isSfx = type === 'sfx';

            if (isNarrator) {
              return (
                 <div key={idx} className="flex flex-col items-center text-center animate-pop-in my-4 px-8 opacity-80">
                    <div className="text-2xl mb-1">{avatar}</div>
                    <div className="text-indigo-900 font-serif italic text-lg leading-relaxed">
                       {textToShow}
                    </div>
                 </div>
              );
            }

            if (isSfx) {
               return (
                 <div key={idx} className="flex justify-center animate-pop-in my-2">
                    <div className="bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full font-bold border-2 border-yellow-300 shadow-sm flex items-center gap-2 transform rotate-[-2deg]">
                       <span className="text-xl animate-bounce">{avatar}</span>
                       <span className="uppercase tracking-widest italic">{textToShow}</span>
                    </div>
                 </div>
               );
            }

            return (
                <div key={idx} className={`flex w-full gap-3 animate-pop-in ${isHero ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar Bubble */}
                    <div className={`
                        w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-2xl shadow-md border-2
                        ${isHero ? 'bg-indigo-100 border-indigo-200' : 'bg-emerald-100 border-emerald-200'}
                    `}>
                        {avatar}
                    </div>

                    {/* Speech Bubble */}
                    <div className={`
                        max-w-[80%] p-4 rounded-2xl text-lg relative shadow-sm border
                        ${isHero 
                            ? 'bg-indigo-500 text-white rounded-tr-none border-indigo-600' 
                            : 'bg-white text-gray-800 rounded-tl-none border-gray-100'
                        }
                    `}>
                        {!isHero && <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-50">{line.speaker}</div>}
                        <p className="leading-snug">{textToShow}</p>
                    </div>
                </div>
            );
        })}
    </div>
  );
};

export default StoryScript;