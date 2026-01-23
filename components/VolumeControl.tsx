import React from 'react';

interface VolumeControlProps {
  ambientVolume: number;
  onAmbientVolumeChange: (val: number) => void;
  dialogueVolume: number;
  onDialogueVolumeChange: (val: number) => void;
  sfxVolume: number;
  onSfxVolumeChange: (val: number) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  ambientVolume,
  onAmbientVolumeChange,
  dialogueVolume,
  onDialogueVolumeChange,
  sfxVolume,
  onSfxVolumeChange
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-3 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg z-30 border border-white/50 transition-opacity hover:opacity-100 opacity-80">
      
      {/* Music Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider w-12 text-right">Music</span>
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={ambientVolume}
            onChange={(e) => onAmbientVolumeChange(parseFloat(e.target.value))}
            className="w-24 accent-indigo-500 h-1.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Voice Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider w-12 text-right">Voice</span>
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={dialogueVolume}
            onChange={(e) => onDialogueVolumeChange(parseFloat(e.target.value))}
            className="w-24 accent-indigo-500 h-1.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* SFX Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider w-12 text-right">SFX</span>
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={sfxVolume}
            onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
            className="w-24 accent-yellow-500 h-1.5 bg-yellow-100 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default VolumeControl;