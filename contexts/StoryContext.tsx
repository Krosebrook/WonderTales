
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { StoryState, UserProfile, StoryContextType } from '../types';
import { generateNextStorySegment } from '../services/geminiService';

const StoryContext = createContext<StoryContextType | undefined>(undefined);

const STORAGE_KEY = 'WONDERTALES_STATE_V1';

export const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: 7,
  avatar: '🧒',
  theme: '',
  format: 'digital',
  animationStyle: 'gentle'
};

const INITIAL_STATE: StoryState = {
  status: 'setup',
  pages: [],
  currentPageIndex: 0,
  profile: INITIAL_PROFILE
};

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from local storage if available
  const [state, setState] = useState<StoryState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation to ensure we don't load corrupt state
        if (parsed && parsed.profile) {
          // If we were mid-loading or error, revert to a safe reading state or setup
          if (parsed.status === 'loading' || parsed.status === 'error') {
             if (parsed.pages && parsed.pages.length > 0) {
               parsed.status = 'reading';
             } else {
               parsed.status = 'setup';
             }
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load story from storage", e);
    }
    return INITIAL_STATE;
  });

  // Persist state to local storage whenever it changes
  useEffect(() => {
    try {
      // Don't save errors or transient loading states if they have no pages
      const stateToSave = { ...state };
      if (stateToSave.status === 'error') stateToSave.error = undefined;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn("Failed to save story to storage (likely quota exceeded)", e);
    }
  }, [state]);

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
    // Clearing pages triggers a fresh start
    const newState: StoryState = { 
      ...state, 
      status: 'loading', 
      error: undefined, 
      pages: [],
      currentPageIndex: 0
    };
    setState(newState);
    await handlePageGeneration(state.profile, []);
  }, [state.profile]);

  const makeChoice = useCallback(async (choice: string, audioInput?: string) => {
    setState(prev => ({ ...prev, status: 'loading', error: undefined }));
    await handlePageGeneration(state.profile, state.pages, choice, audioInput);
  }, [state.profile, state.pages]);

  const resetStory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  }, []);

  return (
    <StoryContext.Provider value={{ ...state, setProfile, startStory, makeChoice, resetStory }}>
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
