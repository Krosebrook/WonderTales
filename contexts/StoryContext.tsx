import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { StoryState, UserProfile, StoryContextType } from '../types';
import { generateNextStorySegment } from '../services/geminiService';

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StoryState>({
    status: 'setup',
    pages: [],
    currentPageIndex: 0,
    profile: {
      name: '',
      favoriteThing: '',
      companion: ''
    }
  });

  const setProfile = useCallback((profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  }, []);

  const startStory = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'loading', error: undefined }));
    try {
      const firstPage = await generateNextStorySegment(state.profile, []);
      setState(prev => ({
        ...prev,
        status: 'reading',
        pages: [firstPage],
        currentPageIndex: 0
      }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, status: 'error', error: 'Could not start the story.' }));
    }
  }, [state.profile]);

  const makeChoice = useCallback(async (choice: string, audioInput?: string) => {
    setState(prev => ({ ...prev, status: 'loading', error: undefined }));
    try {
      const nextPage = await generateNextStorySegment(
        state.profile,
        state.pages,
        choice,
        audioInput
      );
      
      setState(prev => ({
        ...prev,
        status: 'reading',
        pages: [...prev.pages, nextPage],
        currentPageIndex: prev.currentPageIndex + 1
      }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, status: 'error', error: 'Oops! The story magic paused.' }));
    }
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
