
export interface StoryLine {
  speaker: string;
  text: string;
}

export interface StoryPage {
  pageNumber: number;
  lines: StoryLine[];
  imagePrompt: string;
  choices: string[];
  imageUrl?: string;
  soundCue?: string; // Text description of a specific sound effect (visual badge)
  ambientSound?: string; // Description for the background audio loop
  ambientAudioData?: string; // Base64 encoded audio for background loop
  audioBuffer?: AudioBuffer;
}

export interface UserProfile {
  name: string;
  favoriteThing: string; // e.g., "Dinosaurs", "Space", "Unicorns"
  companion: string; // Sidekick name
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

export interface AudioPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}
