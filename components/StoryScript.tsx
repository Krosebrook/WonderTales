
import React, { useEffect, useRef } from 'react';
import { ScriptLine } from '../types';
import { useTypewriter } from '../hooks/useTypewriter';

interface StoryScriptProps {
  lines: ScriptLine[];
  onFinished: () => void;
}

const StoryScript: React.FC<StoryScriptProps> = ({ lines, onFinished }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { displayedLineIndex, displayedText, allFinished } = useTypewriter({ lines, onFinished });

  // Scroll to bottom when new line appears
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedLineIndex, displayedText]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto pr-2 space-y-4 scroll-smooth">
        <style>{`
          @keyframes slideUpFade {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}</style>
        {lines.map((line, idx) => {
            if (idx > displayedLineIndex) return null;
            
            const isCurrent = idx === displayedLineIndex;
            const textToShow = isCurrent && !allFinished ? displayedText : line.text;
            
            const isNarrator = line.speaker === 'Narrator';
            const isSoundFX = line.speaker === 'SoundFX';
            
            return (
                <div key={idx} className={`flex flex-col ${isNarrator ? 'items-start' : 'items-start'} animate-slide-up`}>
                    {!isNarrator && !isSoundFX && (
                        <span className="text-xs font-bold text-indigo-400 uppercase mb-1 ml-1 tracking-wider">{line.speaker}</span>
                    )}
                    
                    <div className={`
                        p-3 rounded-2xl text-lg leading-relaxed max-w-full transition-all
                        ${isNarrator ? 'bg-transparent text-indigo-900 px-0 font-medium' : 
                          isSoundFX ? 'bg-yellow-100 text-yellow-800 italic border-l-4 border-yellow-400 font-bold shadow-sm' :
                          'bg-indigo-50 text-indigo-800 shadow-sm border border-indigo-100'}
                    `}>
                        {textToShow}
                        {isCurrent && !allFinished && <span className="animate-pulse inline-block w-2 h-5 bg-indigo-400 ml-1 align-middle rounded-full"></span>}
                    </div>
                </div>
            );
        })}
    </div>
  );
};

export default StoryScript;
