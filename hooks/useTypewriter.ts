
import { useState, useEffect } from 'react';
import { ScriptLine } from '../types';

interface UseTypewriterProps {
  lines: ScriptLine[];
  onFinished: () => void;
}

export const useTypewriter = ({ lines, onFinished }: UseTypewriterProps) => {
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
            }, 600); // Pause between lines
         }
       }, 30); // Typing speed
       
       return () => clearInterval(typeInterval);
    } else {
        setAllFinished(true);
        onFinished();
    }
  }, [displayedLineIndex, lines, allFinished, onFinished]);

  return { displayedLineIndex, displayedText, allFinished };
};
