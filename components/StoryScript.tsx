import React, { useEffect, useState } from 'react';
import { StoryLine } from '../types';

interface StoryScriptProps {
  lines: StoryLine[];
  onFinished: () => void;
}

const StoryScript: React.FC<StoryScriptProps> = ({ lines, onFinished }) => {
  const [displayedLineIndex, setDisplayedLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [allFinished, setAllFinished] = useState(false);

  useEffect(() => {
    // Reset when lines change (new page)
    setDisplayedLineIndex(0);
    setDisplayedText('');
    setAllFinished(false);
  }, [lines]);

  useEffect(() => {
    if (allFinished) return;

    if (displayedLineIndex < lines.length) {
       const currentLine = lines[displayedLineIndex];
       
       let charIndex = 0;
       const typeInterval = setInterval(() => {
         setDisplayedText(currentLine.text.slice(0, charIndex));
         charIndex++;
         if (charIndex > currentLine.text.length) {
            clearInterval(typeInterval);
            setTimeout(() => {
                setDisplayedLineIndex(prev => prev + 1);
            }, 500); // Pause between lines
         }
       }, 30); // Typing speed
       
       return () => clearInterval(typeInterval);
    } else {
        setAllFinished(true);
        onFinished();
    }
  }, [displayedLineIndex, lines, allFinished, onFinished]);

  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {lines.map((line, idx) => {
            if (idx > displayedLineIndex) return null;
            
            const isCurrent = idx === displayedLineIndex;
            const textToShow = isCurrent && !allFinished ? displayedText : line.text;
            
            const isNarrator = line.speaker === 'Narrator';
            const isSoundFX = line.speaker === 'SoundFX';
            
            return (
                <div key={idx} className={`flex flex-col ${isNarrator ? 'items-start' : 'items-start'}`}>
                    {!isNarrator && !isSoundFX && (
                        <span className="text-xs font-bold text-indigo-400 uppercase mb-1 ml-1">{line.speaker}</span>
                    )}
                    
                    <div className={`
                        p-3 rounded-2xl text-lg leading-relaxed max-w-full
                        ${isNarrator ? 'bg-transparent text-indigo-900 px-0' : 
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
