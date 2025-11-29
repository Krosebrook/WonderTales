import { UserProfile, StoryPage } from "../../types";

export const buildStorySystemInstruction = (profile: UserProfile) => `
You are an expert multi-modal AI creating an interactive storybook for a ${profile.age}-year-old child.

**Child Profile:**
- Name: ${profile.name} (Age: ${profile.age})
- Avatar/Appearance: ${profile.avatar}
- Story Theme: ${profile.theme}

**Story Engine Rules:**
1. **Tone:** Lighthearted, whimsical, magical, and safe.
2. **Characters:** 
    - Main Character: ${profile.name}
    - Sidekick: You MUST assign a fun, theme-appropriate sidekick (e.g., a robot for space, a crab for mermaid theme) and include them in the dialogue.
3. **Structure:** 
    - Generate a title.
    - Dialogue lines with speakers (Narrator, ${profile.name}, Sidekick, SoundFX).
    - 'SoundFX' lines should be onomatopoeia (e.g. "*Pop*", "*Whoosh*") spoken by 'SoundFX'.
4. **Visuals:** Create a vivid 'imagePrompt' (4:3 aspect ratio style).
5. **Audio:** 
    - 'ambientSound': Describe a continuous, looping musical background soundscape to set the mood (e.g. "Upbeat synth music with space hums"). It must be musical, not just noise.
    - 'soundCue': A 2-3 word visual badge for the sound (e.g. "Space Music").
6. **Interactivity:** End with exactly 2 fun choices for the user.

**Output:** Strictly valid JSON matching the schema.
`;

export const buildStoryUserPrompt = (
  isStart: boolean,
  profile: UserProfile,
  history: StoryPage[],
  userChoice?: string,
  audioInputBase64?: string
) => {
  if (isStart) {
    return {
      text: `Start a new story about ${profile.name} set in a ${profile.theme} world. Introduce the sidekick immediately.`
    };
  }

  // Provide condensed context to save tokens but maintain continuity
  const recentHistory = history.slice(-3);
  const contextStr = recentHistory.map((p, i) => 
    `[Page ${p.pageNumber}: ${p.title}]\n${p.lines.map(l => `${l.speaker}: ${l.text}`).join('\n')}`
  ).join('\n\n');

  let promptText = `Continue the story.\n\nPrevious Context:\n${contextStr}\n\n`;

  if (audioInputBase64) {
    return {
      text: promptText + " The child spoke this input. React to it naturally in the story.",
      audio: audioInputBase64
    };
  } else {
    promptText += `The child chose: "${userChoice}".`;
    return { text: promptText };
  }
};

export const buildImagePrompt = (sceneDescription: string, profile: UserProfile) => `
Children's book illustration for a ${profile.age}-year-old.
Style: 3D animated movie style, vibrant colors, soft lighting, expressive characters, whimsical.
Scene: ${sceneDescription}
Main Character: ${profile.name} (wearing ${profile.theme} style clothes).
Avatar Reference: ${profile.avatar}
Aspect Ratio: 4:3.
`;

export const buildAmbientPrompt = (description: string) => 
  `Generate a high quality, looping ambient musical soundscape for a storybook scene: ${description}. No speech. Subtle background music and atmosphere.`;
