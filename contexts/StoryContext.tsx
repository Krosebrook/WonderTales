
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { StoryState, UserProfile, StoryContextType } from '../types';
import { generateNextStorySegment } from '../services/geminiService';

const StoryContext = createContext<StoryContextType | undefined>(undefined);

const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: 7,
  avatar: '🧒',
  theme: '',
  format: 'digital'
};

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StoryState>({
    status: 'setup',
    pages: [],
    currentPageIndex: 0,
    profile: INITIAL_PROFILE
  });

  const setProfile = useCallback((profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  }, []);

  const handlePageGeneration = async (
    profile: UserProfile, 
    history: any[], 
    choice?: string, 
    audio?: string
  ) => {
    try {
      const nextPage = await generateNextStorySegment(profile, history, choice, audio);
      setState(prev => ({
        ...prev,
        status: 'reading',
        pages: [...prev.pages, nextPage],
        currentPageIndex: prev.pages.length // Point to new page (index is length because we appended)
      }));
    } catch (error) {
      console.error("Story Generation Failed:", error);
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: 'The story magic needs a moment. Please try again!' 
      }));
    }
  };

  const startStory = useCallback(async () => {
    if (!state.profile.name) return;
    setState(prev => ({ ...prev, status: 'loading', error: undefined, pages: [] }));
    await handlePageGeneration(state.profile, []);
  }, [state.profile]);

  const makeChoice = useCallback(async (choice: string, audioInput?: string) => {
    setState(prev => ({ ...prev, status: 'loading', error: undefined }));
    await handlePageGeneration(state.profile, state.pages, choice, audioInput);
  }, [state.profile, state.pages]);

  return (
    <StoryContext.Provider value={{ ...state, setProfile, startStory, makeChoice }}>
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};
