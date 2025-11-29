import { Type, Schema } from "@google/genai";
import { ai } from "../geminiClient";
import { UserProfile, StoryPage, ScriptResponse } from "../../types";
import { buildStorySystemInstruction, buildStoryUserPrompt } from "./prompts";

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
    console.error("StoryAI: Script Generation Error", e);
    // Graceful degradation
    return {
      title: "The Magic Paused",
      lines: [{ speaker: 'Narrator', text: "Hmm, the magic ink is replenishing. Let's try that again!" }],
      imagePrompt: `A magical pause in a ${profile.theme} world`,
      choices: ["Try Again"],
      soundCue: "Silence",
      ambientSound: "Quiet reflection"
    };
  }
}
