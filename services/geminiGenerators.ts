
import { Type, Schema } from "@google/genai";
import { ai } from "./geminiClient";
import { UserProfile, StoryPage, ScriptResponse } from "../types";
import { 
  buildStorySystemInstruction, 
  buildStoryUserPrompt, 
  buildImagePrompt, 
  buildAmbientPrompt 
} from "./prompts";

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
    ambientSound: { type: Type.STRING, description: "Description of the background ambient sound loop (e.g. 'Soft wind in the trees')" }
  },
  required: ['title', 'lines', 'imagePrompt', 'choices', 'ambientSound', 'soundCue']
};

// --- Generators ---

/**
 * Generates the text script, choices, and prompt descriptions using Gemini 3 Pro.
 */
export async function generateStoryScript(
  profile: UserProfile, 
  history: StoryPage[], 
  userChoice?: string,
  audioInputBase64?: string
): Promise<ScriptResponse> {
  
  const isStart = history.length === 0;
  const systemInstruction = buildStorySystemInstruction(profile);
  const userPrompt = buildStoryUserPrompt(isStart, profile, history, userChoice, audioInputBase64);

  let contents: any[] = [];
  
  if (userPrompt.audio) {
    contents.push({
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'audio/wav', data: userPrompt.audio } },
        { text: userPrompt.text }
      ]
    });
  } else {
    contents.push({ role: 'user', parts: [{ text: userPrompt.text }] });
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
    return JSON.parse(text) as ScriptResponse;
  } catch (e) {
    console.error("Story Gen Error", e);
    // Fallback object
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
 * Generates the illustration using Gemini 3 Pro Image.
 */
export async function generateIllustration(prompt: string, profile: UserProfile): Promise<string> {
  try {
    const fullPrompt = buildImagePrompt(prompt, profile);

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
 * Generates the ambient background loop using Native Audio.
 */
export async function generateAmbientLoop(description: string): Promise<string | undefined> {
  if (!description) return undefined;
  try {
    const promptText = buildAmbientPrompt(description);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: { 
        parts: [{ text: promptText }] 
      },
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
 * Generates TTS audio for dialogue.
 */
export async function generateSpeechForPage(lines: any[], profile: UserProfile): Promise<string | null> {
  try {
    const promptText = lines.map((l: any) => `${l.speaker}: ${l.text}`).join('\n');
    
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
}
