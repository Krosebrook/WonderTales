import { StoryState, UserProfile } from "../types";

const STORAGE_KEY = 'WONDERTALES_STATE_V3';

export const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: 7,
  avatar: '🧒',
  theme: '',
  format: 'digital',
  animationStyle: 'gentle'
};

export const INITIAL_STATE: StoryState = {
  status: 'setup',
  pages: [],
  currentPageIndex: 0,
  profile: INITIAL_PROFILE
};

export class StorageService {
  static saveState(state: StoryState): void {
    try {
      // Don't save transient errors
      const stateToSave = { ...state };
      if (stateToSave.status === 'error') stateToSave.error = undefined;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn("StorageService: Failed to save state", e);
    }
  }

  static loadState(): StoryState | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Recovery logic:
        // 1. If stuck in loading, reset to reading or setup
        // 2. If stuck in error (from previous save), reset to reading so user can retry
        if (parsed.status === 'loading' || parsed.status === 'error') {
           parsed.status = parsed.pages.length > 0 ? 'reading' : 'setup';
        }
        return { ...INITIAL_STATE, ...parsed };
      }
    } catch (e) {
      console.warn("StorageService: Failed to load state", e);
    }
    return null;
  }

  static clearState(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}