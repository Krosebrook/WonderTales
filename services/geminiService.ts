
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, StoryPage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Schemas ---

const scriptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A fun, short title for this scene" },
    lines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: { type: Type.STRING, description: "Speaker name. Use 'SoundFX' for sound effects." },
          text: { type: Type.STRING, description: "Dialogue or sound effect description (e.g. 'WHOOSH!')" }
        },
        required: ['speaker', 'text']
      }
    },
    imagePrompt: { type: Type.STRING, description: "Detailed visual description for the illustration" },
    choices: { 
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Two distinct, engaging choices for the child"
    },
    soundCue: { type: Type.STRING, description: "Short text for a visual sound badge (e.g. 'Magical Sparkles')" },
    ambientSound: { type: Type.STRING, description: "Description of the background ambient sound loop" }
  },
  required: ['title', 'lines', 'imagePrompt', 'choices', 'ambientSound', 'soundCue']
};

// --- Specialized Generators ---

/**
 * 1. Story Logic (Gemini 3 Pro)
 * Handles the narrative flow, reasoning, and multi-modal script generation.
 */
async function generateStoryScript(
  profile: UserProfile, 
  history: StoryPage[], 
  userChoice?: string,
  audioInputBase64?: string
): Promise<any> {
  
  const isStart = history.length === 0;

  const systemInstruction = `
    You are an expert multi-modal AI creating an interactive storybook for a ${profile.age}-year-old child.
    
    **Child Profile:**
    - Name: ${profile.name} (Age: ${profile.age})
    - Avatar/Appearance: ${profile.avatar}
    - Story Theme: ${profile.theme}

    **Story Engine Rules:**
    1. **Tone:** Lighthearted, whimsical, magical, and safe.
    2. **Characters:** 
       - Main Character: ${profile.name}
       - Sidekick: Assign a fun, theme-appropriate sidekick (e.g., a robot for space, a crab for mermaid theme).
    3. **Structure:** 
       - Generate a title.
       - Dialogue lines with speakers (Narrator, ${profile.name}, Sidekick, SoundFX).
       - 'SoundFX' lines should be onomatopoeia (e.g. "*Pop*", "*Whoosh*").
    4. **Visuals:** Create a vivid 'imagePrompt' (4:3 aspect ratio style).
    5. **Audio:** 
       - 'ambientSound': Describe a continuous background loop (e.g. "Windy forest with chirping birds").
       - 'soundCue': A 2-3 word visual badge for the sound.
    6. **Interactivity:** End with exactly 2 fun choices.

    **Grounding:**
    - If explaining real-world animals or places, be factually accurate but fun.
    
    **Output:** Strictly valid JSON matching the schema.
  `;

  let contents: any[] = [];

  if (isStart) {
    contents.push({ 
      role: 'user', 
      parts: [{ text: `Start a new story about ${profile.name} set in a ${profile.theme} world. Introduce the sidekick immediately.` }] 
    });
  } else {
    // Provide condensed context
    const recentHistory = history.slice(-2);
    const contextStr = recentHistory.map((p, i) => 
      `[Page ${p.pageNumber}: ${p.title}]\n${p.lines.map(l => `${l.speaker}: ${l.text}`).join('\n')}`
    ).join('\n\n');

    let userPrompt = `Continue the story.\n\nContext:\n${contextStr}\n\n`;

    if (audioInputBase64) {
      contents.push({
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: audioInputBase64 } },
          { text: userPrompt + " The child spoke this input. React to it naturally in the story." }
        ]
      });
    } else {
      userPrompt += `The child chose: "${userChoice}".`;
      contents.push({ role: 'user', parts: [{ text: userPrompt }] });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: scriptSchema,
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (e) {
    console.error("Story Gen Error", e);
    return {
      title: "A Magical Glitch",
      lines: [{ speaker: 'Narrator', text: "The magic book stuck together! Let's try that again." }],
      imagePrompt: `A magical confusion with ${profile.theme}`,
      choices: ["Try Again", "Go Back"],
      soundCue: "Glitch",
      ambientSound: "Quiet confusion"
    };
  }
}

/**
 * 2. Visual Generation (Gemini 3 Pro Image)
 */
async function generateIllustration(prompt: string, profile: UserProfile): Promise<string> {
  try {
    const fullPrompt = `
      Children's book illustration for a ${profile.age}-year-old.
      Style: 3D animated movie style, vibrant colors, soft lighting, expressive characters.
      Scene: ${prompt}
      Main Character: ${profile.name} (wearing ${profile.theme} style clothes).
      Avatar Reference: ${profile.avatar}
      Aspect Ratio: 4:3.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: fullPrompt }] }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Image Gen Error", e);
  }
  return `https://picsum.photos/800/600?random=${Math.random()}`;
}

/**
 * 3. Ambient Audio (Gemini Native Audio)
 */
async function generateAmbientLoop(description: string): Promise<string | undefined> {
  if (!description) return undefined;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: { parts: [{ text: `Generate a soundscape: ${description}` }] },
      config: { 
        responseModalities: ['AUDIO'],
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || undefined;
  } catch (e) {
    console.error("Ambient Gen Error", e);
    return undefined;
  }
}

/**
 * 4. Dialogue Speech (Gemini TTS)
 */
export const generateSpeechForPage = async (lines: any[], profile: UserProfile): Promise<string | null> => {
  try {
    const promptText = lines.map(l => `${l.speaker}: ${l.text}`).join('\n');
    
    // We map generic 'Sidekick' to a voice, or if the story generates a specific name, 
    // we hope it maps to 'Fenrir' if we list it here, or we use a fallback.
    // Ideally we'd parse the script to find the sidekick name.
    // For now, we assume standard roles.
    
    const speakerVoiceConfigs = [
      { speaker: 'Narrator', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      { speaker: profile.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
      { speaker: 'Sidekick', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } }, 
      { speaker: 'SoundFX', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text: promptText }] },
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: { speakerVoiceConfigs }
        }
      }
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
};

/**
 * Orchestrator
 */
export const generateNextStorySegment = async (
  profile: UserProfile,
  history: StoryPage[],
  userChoiceOrInput?: string,
  audioInputBase64?: string
): Promise<StoryPage> => {
  
  const scriptData = await generateStoryScript(profile, history, userChoiceOrInput, audioInputBase64);
  
  const [imageUrl, ambientAudioData] = await Promise.all([
    generateIllustration(scriptData.imagePrompt, profile),
    generateAmbientLoop(scriptData.ambientSound)
  ]);

  return {
    pageNumber: history.length + 1,
    title: scriptData.title,
    lines: scriptData.lines,
    choices: scriptData.choices,
    imagePrompt: scriptData.imagePrompt,
    soundCue: scriptData.soundCue,
    ambientSound: scriptData.ambientSound,
    imageUrl,
    ambientAudioData
  };
};
