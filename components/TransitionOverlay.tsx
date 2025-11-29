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
      // Add a small delay before exiting to ensure the user perceives the transition
      timer = setTimeout(() => {
        setVisualState('exiting');
      }, 500); 
    } else if (status === 'error') {
       setVisualState('exiting');
    }

    if (visualState === 'exiting') {
        timer = setTimeout(() => {
            setVisualState('idle');
        }, 1000); // Wait for opacity transition
    }

    return () => clearTimeout(timer);
  }, [status, visualState]);

  if (visualState === 'idle') return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center pointer-events-none 
        transition-all duration-1000 ease-in-out
        ${visualState === 'exiting' ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
      `}
    >
      {/* Deep Backdrop Blur */}
      <div className="absolute inset-0 bg-indigo-950/90 backdrop-blur-xl"></div>
      
      {/* Main Portal Container - Scales up to cover screen */}
      <div 
        className={`
          relative w-[120vmax] h-[120vmax] flex items-center justify-center 
          transition-transform duration-[1.5s] cubic-bezier(0.4, 0, 0.2, 1)
          ${visualState === 'entering' ? 'scale-100 rotate-180' : 'scale-0 rotate-0'}
        `}
      >
        {/* Layer 1: Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900 opacity-60 blur-[100px] animate-pulse-slow"></div>

        {/* Layer 2: Primary Conic Swirl */}
        <div className="absolute inset-[15%] rounded-full bg-[conic-gradient(at_center,var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow opacity-80 blur-3xl"></div>
        
        {/* Layer 3: Secondary High-Contrast Swirl (Counter-rotating) */}
        <div className="absolute inset-[25%] rounded-full bg-[conic-gradient(at_center,var(--tw-gradient-stops))] from-yellow-300 via-amber-500 to-red-500 animate-spin-reverse-slow opacity-60 blur-2xl mix-blend-overlay"></div>

        {/* Layer 4: Magical Core */}
        <div className="absolute inset-[40%] rounded-full bg-white opacity-20 blur-2xl animate-pulse-fast"></div>
        
        {/* Sparkle Ring */}
        {[...Array(12)].map((_, i) => (
             <div 
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] animate-twinkle"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 30}deg) translateY(-35vmin)`,
                    animationDelay: `${Math.random() * 2}s`
                }}
             />
        ))}
      </div>

      {/* Center Content (Static relative to screen) */}
      <div className="absolute z-60 flex flex-col items-center">
        <div className="relative group">
            <div className="text-8xl filter drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] animate-bounce-gentle">✨</div>
            
            {/* Orbiting particles around the emoji */}
            <div className="absolute inset-0 animate-spin-slow">
                 <div className="absolute -top-4 left-1/2 w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_10px_yellow]"></div>
            </div>
             <div className="absolute inset-0 animate-spin-reverse-slow" style={{ animationDuration: '3s' }}>
                 <div className="absolute -bottom-2 left-1/2 w-1.5 h-1.5 bg-pink-300 rounded-full shadow-[0_0_10px_pink]"></div>
            </div>
        </div>
        
        <p className="mt-8 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white tracking-[0.3em] uppercase drop-shadow-sm animate-pulse">
          Making Magic
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
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes pulse-fast {
            0%, 100% { opacity: 0.2; transform: scale(0.95); }
            50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes twinkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(var(--tw-rotate)) translateY(-35vmin); }
            50% { opacity: 1; transform: scale(1.5) rotate(var(--tw-rotate)) translateY(-35vmin); }
        }
        @keyframes bounce-gentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse-slow {
            animation: spin-reverse-slow 12s linear infinite;
        }
        .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-fast {
            animation: pulse-fast 2s ease-in-out infinite;
        }
        .animate-twinkle {
            animation: twinkle 3s ease-in-out infinite;
        }
        .animate-bounce-gentle {
            animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TransitionOverlay;