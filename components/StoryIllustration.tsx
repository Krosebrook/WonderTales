import React, { useState, useEffect } from 'react';

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
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset loaded state when image URL changes
  useEffect(() => {
    setIsLoaded(false);
  }, [imageUrl]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-gray-200 group">
       {/* Page Badge */}
       <div className="absolute top-4 left-4 z-10">
           <span className="bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-full shadow-lg border border-yellow-200">
               Page {pageNumber}
           </span>
       </div>
       
       <img 
         key={imageUrl} 
         src={imageUrl} 
         alt={imagePrompt}
         onLoad={() => setIsLoaded(true)}
         className={`
            w-full h-full object-cover 
            transition-all ease-out will-change-transform
            ${isLoaded ? 'duration-[10000ms] scale-110 opacity-100' : 'duration-700 scale-100 opacity-0'}
            ${isLoading ? 'blur-sm' : 'blur-0'}
         `}
       />

       {/* Sound Cue Visual */}
       {soundCue && isLoaded && (
           <div className="absolute bottom-4 right-4 z-10 animate-bounce">
                <span className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold border border-white/30 flex items-center gap-2 shadow-lg animate-fade-in-up">
                    🔊 {soundCue}
                </span>
           </div>
       )}
       
       {/* Loading Spinner */}
       {(isLoading || !isLoaded) && (
           <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-500"></div>
           </div>
       )}
       
       <style>{`
         @keyframes fadeInUp {
           from { opacity: 0; transform: translateY(10px); }
           to { opacity: 1; transform: translateY(0); }
         }
         .animate-fade-in-up {
           animation: fadeInUp 0.5s ease-out forwards;
         }
       `}</style>
    </div>
  );
};

export default StoryIllustration;