import React from 'react';

interface StoryIllustrationProps {
  imageUrl?: string;
  imagePrompt: string;
  soundCue?: string;
  pageNumber: number;
  isLoading: boolean;
}

const StoryIllustration: React.FC<StoryIllustrationProps> = ({ 
  imageUrl, 
  imagePrompt, 
  soundCue, 
  pageNumber, 
  isLoading 
}) => {
  return (
    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-gray-200 group">
       {/* Page Badge */}
       <div className="absolute top-4 left-4 z-10">
           <span className="bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-full shadow-lg">
               Page {pageNumber}
           </span>
       </div>
       
       <img 
         src={imageUrl} 
         alt={imagePrompt}
         className={`w-full h-full object-cover transition-transform duration-[10s] ease-in-out ${isLoading ? 'scale-100 blur-sm' : 'scale-110'}`}
       />

       {/* Sound Cue Visual */}
       {soundCue && (
           <div className="absolute bottom-4 right-4 z-10 animate-bounce">
                <span className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold border border-white/30 flex items-center gap-2 shadow-lg">
                    🔊 {soundCue}
                </span>
           </div>
       )}
       
       {isLoading && (
           <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm z-20">
               <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
           </div>
       )}
    </div>
  );
};

export default StoryIllustration;
