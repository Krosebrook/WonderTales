import React, { useEffect, useState } from 'react';

interface TransitionOverlayProps {
  status: 'loading' | 'reading' | 'setup' | 'error';
}

const TransitionOverlay: React.FC<TransitionOverlayProps> = ({ status }) => {
  const [visualState, setVisualState] = useState<'idle' | 'entering' | 'exiting'>('idle');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (status === 'loading') {
      setVisualState('entering');
    } else if (status === 'reading' && visualState === 'entering') {
      setVisualState('exiting');
      timer = setTimeout(() => {
        setVisualState('idle');
      }, 800); // Matches the CSS transition duration
    }

    return () => clearTimeout(timer);
  }, [status, visualState]);

  if (visualState === 'idle') return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center pointer-events-none 
        transition-opacity duration-700 ease-in-out
        ${visualState === 'exiting' ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Backdrop Blur */}
      <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-md"></div>
      
      {/* Swirling Portal */}
      <div 
        className={`
          relative w-[150vmax] h-[150vmax] flex items-center justify-center 
          transition-transform duration-1000 ease-in-out
          ${visualState === 'entering' ? 'scale-100 rotate-180' : 'scale-0 rotate-0'}
        `}
      >
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow opacity-80 blur-3xl"></div>
        <div className="absolute inset-[10%] rounded-full bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-yellow-400 via-orange-500 to-red-500 animate-spin-reverse-slow opacity-60 blur-2xl mix-blend-overlay"></div>
      </div>

      {/* Loading Content */}
      <div className="absolute z-60 flex flex-col items-center animate-bounce">
        <div className="text-6xl filter drop-shadow-lg">✨</div>
        <p className="text-white font-bold text-xl mt-4 shadow-black drop-shadow-md tracking-widest uppercase">
          Making Magic...
        </p>
      </div>

      <style>{`
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse-slow {
            animation: spin-reverse-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TransitionOverlay;