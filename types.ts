import React from 'react';

// --- Domain Models ---

export interface ScriptLine {
  speaker: string;
  text: string;
}

export interface SidekickData {
  name: string;
  emoji: string;
}

export interface ScriptResponse {
  title: string;
  lines: ScriptLine[];
  imagePrompt: string;
  choices: string[];
  soundCue: string;
  ambientSound: string;
  sidekick?: SidekickData;
}

export interface StoryPage extends ScriptResponse {
  pageNumber: number;
  imageUrl?: string;
  ambientAudioData?: string; // Base64 encoded audio
}

export interface UserProfile {
  name: string;
  age: number;
  avatar: string;
  theme: string;
  format: 'single-pages' | 'printable-book' | 'digital';
  animationStyle: 'gentle' | 'bouncy' | 'zoomy';
}

export interface StoryState {
  status: 'setup' | 'loading' | 'reading' | 'error';
  pages: StoryPage[];
  currentPageIndex: number;
  profile: UserProfile;
  error?: string;
}

// --- Reducer Actions ---

export type StoryAction =
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'START_LOADING' }
  | { type: 'ADD_PAGE'; payload: StoryPage }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STORY' }
  | { type: 'CONTINUE_STORY' }
  | { type: 'HYDRATE_STATE'; payload: StoryState };

// --- Context ---

export interface StoryContextType extends StoryState {
  dispatch: React.Dispatch<StoryAction>;
  startStory: () => Promise<void>;
  makeChoice: (choice: string, audioInput?: string) => Promise<void>;
  resetStory: () => void;
  continueStory: () => void;
  clearError: () => void;
  setProfile: (profile: UserProfile) => void;
}

// --- Configuration Types ---

export type ThemeCategory = "space" | "fantasy" | "animals" | "vehicles" | "mixed";

export interface ThemePreset {
  id: string;
  label: string;
  emoji: string;
  description: string;
  category: ThemeCategory;
  defaultAnimation: UserProfile['animationStyle'];
}

export interface PagePreset {
  id: string;
  label: string;
  pages: number;
}

export type BookFormat = UserProfile['format'];
export interface FormatOption {
  id: BookFormat;
  label: string;
  icon: string;
  description: string;
}