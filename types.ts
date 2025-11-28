
export interface ScriptLine {
  speaker: string;
  text: string;
}

export interface StoryPage {
  pageNumber: number;
  title: string;
  lines: ScriptLine[];
  choices: string[];
  imagePrompt: string;
  imageUrl?: string;
  soundCue?: string; // Visual badge text
  ambientSound?: string; // Description for audio generator
  ambientAudioData?: string; // Base64 encoded audio
}

export interface UserProfile {
  name: string;
  age: number;
  avatar: string;
  theme: string;
  format: 'single-pages' | 'printable-book' | 'digital';
}

export interface StoryState {
  status: 'setup' | 'loading' | 'reading' | 'error';
  pages: StoryPage[];
  currentPageIndex: number;
  profile: UserProfile;
  error?: string;
}

export interface StoryContextType extends StoryState {
  setProfile: (profile: UserProfile) => void;
  startStory: () => Promise<void>;
  makeChoice: (choice: string, audioInput?: string) => Promise<void>;
}
