import React from 'react';
import VoiceInput from './VoiceInput';

interface StoryControlsProps {
  choices: string[];
  onChoice: (choice: string, audioBase64?: string) => void;
  isLoading: boolean;
  show: boolean;
}

const StoryControls: React.FC<StoryControlsProps> = ({ choices, onChoice, isLoading, show }) => {
  return (
    <div className={`mt-6 transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
        <h3 className="text-center text-lg text-indigo-400 font-bold uppercase tracking-widest mb-4">
            What should we do?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {choices.map((choice, idx) => (
                <button
                    key={idx}
                    onClick={() => onChoice(choice)}
                    disabled={isLoading}
                    className="p-3 rounded-xl bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold text-base transform transition hover:scale-105 active:scale-95 shadow-md border-b-4 border-yellow-500 text-left"
                >
                    {choice}
                </button>
            ))}
        </div>

        <div className="border-t-2 border-indigo-100 pt-4 flex justify-center">
             <VoiceInput 
                disabled={isLoading}
                onInputComplete={(audio) => onChoice("Voice Input", audio)}
             />
        </div>
    </div>
  );
};

export default StoryControls;
