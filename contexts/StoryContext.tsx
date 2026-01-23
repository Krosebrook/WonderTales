import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { StoryContextType, UserProfile } from '../types';
import { generateNextStorySegment } from '../services/orchestrator';
import { useStoryReducer } from '../hooks/useStoryReducer';
import { StorageService } from '../services/storage';

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state, dispatch } = useStoryReducer();

  const handlePageGeneration = async (
    profile: UserProfile, 
    history: any[], 
    choice?: string, 
    audio?: string
  ) => {
    dispatch({ type: 'START_LOADING' });
    try {
      const nextPage = await generateNextStorySegment(profile, history, choice, audio);
      dispatch({ type: 'ADD_PAGE', payload: nextPage });
    } catch (error) {
      console.error("StoryContext: Generation Failed", error);
      dispatch({ type: 'SET_ERROR', payload: "The magic interrupted. Let's try again!" });
    }
  };

  const setProfile = useCallback((profile: UserProfile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
  }, [dispatch]);

  const startStory = useCallback(async () => {
    if (!state.profile.name) return;
    
    dispatch({ type: 'START_LOADING' });
    try {
        // Reset storage for new story logic
        StorageService.clearState(); 
        
        // Force a fresh start from Orchestrator with empty history
        const firstPage = await generateNextStorySegment(state.profile, [], undefined, undefined);
        
        // We need to reset the state completely before adding the page to avoid appending
        dispatch({ type: 'RESET_STORY' });
        dispatch({ type: 'SET_PROFILE', payload: state.profile });
        dispatch({ type: 'ADD_PAGE', payload: firstPage });
        
    } catch (error) {
         dispatch({ type: 'SET_ERROR', payload: "Could not start story." });
    }
  }, [state.profile, dispatch]);

  const makeChoice = useCallback(async (choice: string, audioInput?: string) => {
    await handlePageGeneration(state.profile, state.pages, choice, audioInput);
  }, [state.profile, state.pages, dispatch]);

  const resetStory = useCallback(() => {
    dispatch({ type: 'RESET_STORY' });
  }, [dispatch]);

  const continueStory = useCallback(() => {
    dispatch({ type: 'CONTINUE_STORY' });
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  return (
    <StoryContext.Provider value={{ ...state, dispatch, setProfile, startStory, makeChoice, resetStory, continueStory, clearError }}>
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