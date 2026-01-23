import { UserProfile, StoryPage } from "../types";
import { generateStoryScript } from "./ai/story";
import { generateIllustration, generateAmbientLoop } from "./ai/media";

/**
 * Orchestrates the generation of a complete story segment.
 * Implements parallel execution and fallback strategies.
 */
export const generateNextStorySegment = async (
  profile: UserProfile,
  history: StoryPage[],
  userChoiceOrInput?: string,
  audioInputBase64?: string
): Promise<StoryPage> => {
  
  // 1. Script Generation (Blocking)
  // We need the script first to know WHAT image and sound to generate.
  const scriptData = await generateStoryScript(profile, history, userChoiceOrInput, audioInputBase64);
  
  // 2. Parallel Media Generation (Non-blocking between each other)
  // We launch both Image and Ambient Sound generation simultaneously to reduce wait time.
  const [imageResult, audioResult] = await Promise.allSettled([
    generateIllustration(scriptData.imagePrompt, profile),
    generateAmbientLoop(scriptData.ambientSound)
  ]);

  // 3. Result Aggregation
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
    sidekick: scriptData.sidekick, // Ensure sidekick data is propagated to the page object
    imageUrl, 
    ambientAudioData 
  };
};

export { generateSpeechForPage } from "./ai/media";