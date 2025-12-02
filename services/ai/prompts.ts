
import { UserProfile, StoryPage } from "../types";

// --- Helper Functions ---

const formatChildProfile = (profile: UserProfile): string => `
**Child Profile:**
- Name: ${profile.name} (Age: ${profile.age})
- Avatar: ${profile.avatar}
- Theme: ${profile.theme}
`.trim();

const formatStoryContext = (history: StoryPage[]): string => {
  // Token Management: Keep only the last 3 pages to maintain context without exceeding limits
  // We format this as a "script" so the model sees the flow of dialogue.
  const recentPages = history.slice(-3);
  
  if (recentPages.length === 0) return "No previous context (Start of story).";

  return recentPages.map((page, index) => `
[Scene ${page.pageNumber}: ${page.title}]
${page.lines.map(line => `> ${line.speaker}: ${line.text}`).join('\n')}
(Ambient: ${page.ambientSound})
`).join('\n---\n');
};

// --- System Instructions ---

export const buildStorySystemInstruction = (profile: UserProfile) => `
You are an expert interactive storyteller engine for a ${profile.age}-year-old child.

${formatChildProfile(profile)}

**Core Rules:**
1. **Persona**: Warm, magical, and whimsical. Never scary.
2. **Sidekick**: You MUST assign a theme-appropriate sidekick (e.g., 'Rusty the Robot' for Space, 'Bubbles the Crab' for Mermaid). They must speak in every scene.
3. **Format**: Output strictly valid JSON.
4. **Audio Design**:
   - 'SoundFX' speaker: Use for onomatopoeia (e.g., "*Click-clack*", "*Whoosh*").
   - 'ambientSound': Describe a musical, looping background track (e.g., "Playful flute music with chirping birds").
   - 'soundCue': A short visual badge text (e.g., "Forest Music").

**JSON Schema Requirements:**
- 'lines': Array of { speaker, text }.
- 'choices': Exactly 2 short, fun options for the child.
- 'imagePrompt': Vibrant, 3D-animated movie style description (4:3 ratio).
`;

// --- User/Input Prompts ---

export const buildStoryUserPrompt = (
  isStart: boolean,
  profile: UserProfile,
  history: StoryPage[],
  userChoice?: string,
  audioInputBase64?: string
) => {
  // 1. New Story Payload
  if (isStart) {
    return {
      text: `Generate the first page of a story about ${profile.name} in a ${profile.theme} world. Introduce the sidekick immediately.`
    };
  }

  // 2. Context Construction
  const contextStr = formatStoryContext(history);
  let instruction = `Continue the story based on the context below.\n\n### Previous Context\n${contextStr}\n\n### User Input\n`;

  // 3. Input Handling
  if (audioInputBase64) {
    // Multi-modal input (Audio)
    return {
      text: instruction + "The child responded verbally. Listen to the audio and react naturally to what they said.",
      audio: audioInputBase64
    };
  } else {
    // Text input (Choice)
    instruction += `The child chose: "${userChoice}". Incorporate this choice into the narrative.`;
    return { text: instruction };
  }
};

// --- Media Prompts ---

export const buildImagePrompt = (sceneDescription: string, profile: UserProfile) => `
**Medium**: Digital 3D Illustration (Pixar/Dreamworks style).
**Audience**: ${profile.age}-year-old child.
**Subject**: ${profile.name} (${profile.avatar}) in a ${profile.theme} setting.
**Scene**: ${sceneDescription}
**Lighting**: Soft, warm, magical.
**Colors**: Vibrant and expressive.
**Composition**: Wide shot, 4:3 aspect ratio, suitable for storytelling background.
`.trim();

export const buildAmbientPrompt = (description: string) => 
  `Generate a high-fidelity, looping ambient soundscape.
   **Mood**: ${description}.
   **Constraint**: Musical and atmospheric only. No speech. No sudden loud noises.
   **Length**: 10 seconds.`.trim();
