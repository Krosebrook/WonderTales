import React from 'react';
import { StoryPage, UserProfile } from '../types';

interface FullStoryViewProps {
  pages: StoryPage[];
  profile: UserProfile;
  onClose: () => void;
}

const FullStoryView: React.FC<FullStoryViewProps> = ({ pages, profile, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @media print {
          @page { margin: 2cm; }
          .no-print { display: none !important; }
          .print-break { break-after: page; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          /* Reset app layout styles that interfere with printing */
          .fixed { position: static !important; }
          .overflow-y-auto { overflow: visible !important; }
          .h-full { height: auto !important; }
        }
      `}</style>

      {/* Header / Controls (Hidden on Print) */}
      <div className="sticky top-0 z-10 p-4 bg-white/90 backdrop-blur border-b border-indigo-100 flex justify-between items-center shadow-sm no-print">
        <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <h2 className="text-xl font-bold text-indigo-900">My Storybook</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save
          </button>
        </div>
      </div>

      {/* Book Content */}
      <div className="max-w-4xl mx-auto p-8 md:p-16 min-h-screen bg-white">
        
        {/* Cover Page */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center border-8 border-double border-indigo-100 rounded-3xl p-12 mb-20 print-break shadow-sm">
          <div className="text-sm font-bold tracking-[0.3em] text-indigo-300 uppercase mb-8">A WonderTales Original</div>
          <h1 className="text-5xl md:text-7xl font-black text-indigo-900 mb-8 leading-tight">
            The Adventures of<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{profile.name}</span>
          </h1>
          <div className="w-40 h-40 bg-indigo-50 rounded-full flex items-center justify-center text-8xl mb-12 shadow-inner">
             {profile.avatar}
          </div>
          <p className="text-2xl text-gray-500 font-serif italic max-w-lg">
            A magical journey set in a {profile.theme} world, featuring {profile.name} and their trusty sidekick.
          </p>
          <div className="mt-auto pt-12 text-sm text-gray-400 font-medium">
             {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Story Pages */}
        <div className="space-y-24">
            {pages.map((page, index) => (
              <div key={index} className="print-break scroll-mt-20">
                <div className="flex flex-col gap-8">
                  {/* Visual */}
                  {page.imageUrl && (
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-100 print:shadow-none print:border-2 print:border-gray-200">
                      <img 
                        src={page.imageUrl} 
                        className="w-full h-full object-cover" 
                        alt={page.imagePrompt} 
                      />
                      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm print:hidden">
                        Page {index + 1}
                      </div>
                    </div>
                  )}
                  
                  {/* Narrative Script */}
                  <div className="px-4 md:px-12">
                     <div className="flex items-center gap-4 mb-6">
                        <span className="h-px flex-1 bg-indigo-100"></span>
                        <h3 className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Page {index + 1}</h3>
                        <span className="h-px flex-1 bg-indigo-100"></span>
                     </div>
                     
                     <div className="space-y-6 font-serif text-lg md:text-xl leading-relaxed text-gray-800">
                       {page.lines.map((line, lIdx) => {
                         const isSoundFX = line.speaker === 'SoundFX';
                         const isNarrator = line.speaker === 'Narrator';
                         
                         if (isSoundFX) return null; // Skip sound FX in book view for cleaner reading

                         return (
                           <div key={lIdx} className={`flex gap-4 ${isNarrator ? 'italic text-gray-600 pl-4 border-l-4 border-gray-200' : ''}`}>
                             {!isNarrator && (
                               <span className="flex-shrink-0 font-bold text-indigo-900 text-sm uppercase pt-1 w-20 text-right">
                                 {line.speaker}
                               </span>
                             )}
                             <p className="flex-1">{line.text}</p>
                           </div>
                         );
                       })}
                     </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* End Page */}
        <div className="mt-32 text-center py-20 border-t border-indigo-50">
           <h2 className="text-3xl font-bold text-indigo-200 mb-4">The End</h2>
           <p className="text-gray-400">Read again on WonderTales</p>
        </div>

      </div>
    </div>
  );
};

export default FullStoryView;