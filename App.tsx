import React, { useState } from 'react';
import { StoryProvider, useStory } from './contexts/StoryContext';
import StoryView from './components/StoryView';

const SetupScreen: React.FC = () => {
  const { profile, setProfile, startStory } = useStory();
  const [localName, setLocalName] = useState(profile.name);
  const [localFav, setLocalFav] = useState(profile.favoriteThing);
  const [localComp, setLocalComp] = useState(profile.companion);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ name: localName, favoriteThing: localFav, companion: localComp });
    startStory();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border-8 border-yellow-300">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">WonderTales</h1>
          <p className="text-gray-500">Create your own magical adventure!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">What is your name?</label>
            <input required type="text" className="w-full p-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 outline-none bg-indigo-50 text-xl text-indigo-900"
              placeholder="e.g. Charlie" value={localName} onChange={e => setLocalName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">What do you love most?</label>
            <input required type="text" className="w-full p-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 outline-none bg-indigo-50 text-xl text-indigo-900"
              placeholder="e.g. Dinosaurs, Space" value={localFav} onChange={e => setLocalFav(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Name your sidekick!</label>
            <input required type="text" className="w-full p-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 outline-none bg-indigo-50 text-xl text-indigo-900"
              placeholder="e.g. Mr. Fluff" value={localComp} onChange={e => setLocalComp(e.target.value)} />
          </div>
          <button type="submit" className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-xl font-black text-2xl shadow-lg transform transition active:scale-95">
            Start Adventure! 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { status, error, pages } = useStory();

  if (status === 'setup') return <SetupScreen />;

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
