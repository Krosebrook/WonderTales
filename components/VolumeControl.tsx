
import React from 'react';

interface VolumeControlProps {
  ambientVolume: number;
  onAmbientVolumeChange: (val: number) => void;
  dialogueVolume: number;
  onDialogueVolumeChange: (val: number) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  ambientVolume,
  onAmbientVolumeChange,
  dialogueVolume,
  onDialogueVolumeChange
}) => {
  return (
    <div className="absolute top-0 right-4 flex flex-col gap-2 bg-white/90 backdrop-blur rounded-2xl px-4 py-2 shadow-lg z-30 border border-white/50">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-12 text-right">Music</span>
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={ambientVolume}
            onChange={(e) => onAmbientVolumeChange(parseFloat(e.target.value))}
            className="w-20 accent-indigo-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-12 text-right">Voices</span>
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={dialogueVolume}
            onChange={(e) => onDialogueVolumeChange(parseFloat(e.target.value))}
            className="w-20 accent-indigo-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default VolumeControl;
