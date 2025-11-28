/**
 * Gemini Service Orchestrator
 * 
 * This service is responsible for coordinating the generation of all story assets.
 * It implements the "Orchestrator Pattern" to:
 * 1. Call the Script Generator (Blocker) - Determines the story direction.
 * 2. Parallelize Media Generation - Fetches Illustration and Ambient Audio simultaneously.
 * 3. Handle Partial Failures - Returns a usable page even if one media asset fails.
 */

import { UserProfile, StoryPage } from "../types";
import { 
  generateStoryScript, 
  generateIllustration, 
  generateAmbientLoop, 
  generateSpeechForPage 
} from "./geminiGenerators";

// Re-export the TTS function for the Audio Hook
export { generateSpeechForPage };

export const generateNextStorySegment = async (
  profile: UserProfile,
  history: StoryPage[],
  userChoiceOrInput?: string,
  audioInputBase64?: string
): Promise<StoryPage> => {
  
  // 1. Generate the Script (Blocker) - We need the script to know what image/sound to generate
  // This is the "Brain" of the operation.
  const scriptData = await generateStoryScript(profile, history, userChoiceOrInput, audioInputBase64);
  
  // 2. Generate Media Assets in Parallel (Image + Ambient Audio)
  // We use Promise.allSettled to ensure that if audio fails, we still get an image (and vice versa).
  const [imageResult, audioResult] = await Promise.allSettled([
    generateIllustration(scriptData.imagePrompt, profile),
    generateAmbientLoop(scriptData.ambientSound)
  ]);

  // Extract results or use fallbacks/undefined
  const imageUrl = imageResult.status === 'fulfilled' ? imageResult.value : undefined;
  const ambientAudioData = audioResult.status === 'fulfilled' ? audioResult.value : undefined;

  return {
    pageNumber: history.length + 1,
    title: scriptData.title,
    lines: scriptData.lines,
    choices: scriptData.choices,
    imagePrompt: scriptData.imagePrompt,
    soundCue: scriptData.soundCue,
    ambientSound: scriptData.ambientSound,
    imageUrl, // Can be undefined if failed, UI handles loading/error
    ambientAudioData // Can be undefined if failed
  };
};