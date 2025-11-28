# WonderTales 🪄📖

**WonderTales** is an AI-powered interactive storybook application designed for children. It uses Google's Gemini models to generate personalized stories, vivid illustrations, character voices, and ambient soundscapes in real-time.

## 🌟 Key Features

*   **Personalized Adventures:** Generates unique stories based on the child's name, age, selected avatar, and theme.
*   **Dynamic Storytelling:** Uses **Gemini 3 Pro** to create whimsical narratives with distinct characters (Hero, Sidekick, Narrator).
*   **Immersive Visuals:** Generates consistent, 3D-animated-movie style illustrations for every page using **Gemini 3 Pro Image**.
*   **Rich Audio Experience:**
    *   **Multi-Speaker TTS:** Distinct voices for the Narrator, Child, Sidekick, and Sound Effects using **Gemini 2.5 Flash TTS**.
    *   **Ambient Soundscapes:** Generates looping background music/sounds matching the scene mood using **Gemini Native Audio**.
*   **Voice Interactivity:** Children can guide the story by speaking their choices, powered by the Web Audio API and Gemini's multimodal understanding.
*   **Magical UX:** Features "swirling portal" transitions, typewriter text effects, and a child-friendly "Magic Tablet" interface.

## 🏗️ Architecture

The project follows a **Service-Orchestrator Pattern** to handle the complexity of parallel AI generation.

### 1. Service Layer (`/services`)
*   **`geminiService.ts` (Orchestrator):** The brain of the operation. It coordinates the parallel fetching of scripts, images, and audio. It handles error recovery (e.g., if audio fails, the story proceeds with just text/image).
*   **`geminiGenerators.ts` (Generators):** specialized functions handling the raw API calls to specific Gemini models.
*   **`prompts.ts` (Prompt Engineering):** Separates the AI instructions from the code logic. Contains the system instructions for persona, JSON schemas, and creative direction.
*   **`geminiClient.ts`:** Singleton instance of the Google GenAI SDK.

### 2. State Management (`/contexts`)
*   **`StoryContext.tsx`:** Manages the global state of the story (current page, history, user profile, loading status). It exposes the `startStory` and `makeChoice` actions.

### 3. UI Components (`/components`)
*   **`SetupWizard.tsx`:** A multi-step form for creating the child's profile (Name, Age, Theme).
*   **`StoryView.tsx`:** The main reading interface composed of:
    *   `StoryIllustration`: Handles image rendering and "Ken Burns" zoom effects.
    *   `StoryScript`: Renders dialogue with a typewriter animation.
    *   `StoryControls`: Handles choices and voice input.
    *   `VolumeControl`: Independent sliders for Music and Voices.
*   **`TransitionOverlay.tsx`:** Manages the magical portal animation between pages.

### 4. Custom Hooks (`/hooks`)
*   **`useStoryAudio.ts`:** Manages the `AudioContext`, handles the complex logic of looping ambient sound while playing one-shot dialogue, and ensures proper cleanup to prevent memory leaks.
*   **`useTypewriter.ts`:** Encapsulates the text reveal logic.

## 🛠️ Configuration

Key constants (Themes, Avatars, Page Presets) are centralized in `config/constants.ts` for easy updates without touching component code.

## 🚀 Technologies

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI:** Google Gemini API (`@google/genai`)
    *   Text/Logic: `gemini-3-pro-preview`
    *   Images: `gemini-3-pro-image-preview`
    *   Audio/Music: `gemini-2.5-flash-native-audio-preview-09-2025`
    *   Speech: `gemini-2.5-flash-preview-tts`
*   **Tooling:** Vite (via Replit/Lovable environment)
