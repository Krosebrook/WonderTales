import { useReducer, useEffect } from "react";
import { StoryState, StoryAction } from "../types";
import { StorageService, INITIAL_STATE } from "../services/storage";

const storyReducer = (state: StoryState, action: StoryAction): StoryState => {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return { 
        ...action.payload,
        // Ensure we don't load into a stuck loading state
        status: action.payload.status === 'loading' ? 'setup' : 'setup' 
      };
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    
    case 'START_LOADING':
      return { ...state, status: 'loading', error: undefined };
    
    case 'ADD_PAGE':
      return {
        ...state,
        status: 'reading',
        pages: [...state.pages, action.payload],
        currentPageIndex: state.pages.length // Point to the new page
      };
    
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, status: 'reading', error: undefined };
    
    case 'RESET_STORY':
      StorageService.clearState();
      return { ...INITIAL_STATE, status: 'setup' };

    case 'CONTINUE_STORY':
      return { ...state, status: 'reading', currentPageIndex: state.pages.length > 0 ? state.pages.length - 1 : 0 };
      
    default:
      return state;
  }
};

export const useStoryReducer = () => {
  const [state, dispatch] = useReducer(storyReducer, INITIAL_STATE);

  // Persistence Middleware: Save state whenever it changes
  useEffect(() => {
    StorageService.saveState(state);
  }, [state]);

  // Initial Load
  useEffect(() => {
    const saved = StorageService.loadState();
    if (saved && saved.profile.name) {
      dispatch({ type: 'HYDRATE_STATE', payload: saved });
    }
  }, []);

  return { state, dispatch };
};