
import React from 'react';
import { StoryProvider, useStory } from './contexts/StoryContext';
import StoryView from './components/StoryView';
import SetupWizard from './components/SetupWizard';
import { UserProfile } from './types';

const MainContent: React.FC = () => {
  const { status, error, pages, setProfile, startStory } = useStory();

  const handleWizardComplete = (profile: UserProfile) => {
    setProfile(profile);
    startStory();
  };

  if (status === 'setup') {
    return <SetupWizard onGenerate={handleWizardComplete} />;
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col font-sans overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute -bottom-32 left-[20%] w-[50%] h-[50%] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>

      <header className="relative z-10 px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">W</div>
            <span className="font-bold text-xl text-indigo-900 tracking-tight">WonderTales</span>
        </div>
        {pages.length > 0 && (
            <div className="bg-white px-4 py-1 rounded-full text-indigo-600 font-bold shadow-sm">
                Page {pages.length} / 10
            </div>
        )}
      </header>

      <main className="flex-1 relative z-10 flex items-center justify-center p-4">
        {status === 'error' ? (
             <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                 <div className="text-6xl mb-4">🙈</div>
                 <h2 className="text-2xl font-bold text-red-500 mb-2">Uh oh!</h2>
                 <p className="text-gray-600 mb-6">{error}</p>
                 <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold">Try Again</button>
             </div>
        ) : (
            <StoryView />
        )}
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <StoryProvider>
      <MainContent />
    </StoryProvider>
  );
};

export default App;
