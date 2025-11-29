import { ai } from "../geminiClient";
import { UserProfile } from "../../types";
import { buildImagePrompt, buildAmbientPrompt } from "./prompts";

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
    console.error("MediaAI: Image Gen Error", e);
  }
  return `https://picsum.photos/800/600?random=${Math.random()}`; // Fallback
}

export async function generateAmbientLoop(description: string): Promise<string | undefined> {
  if (!description) return undefined;
  try {
    const promptText = buildAmbientPrompt(description);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: { parts: [{ text: promptText }] },
      config: { responseModalities: ['AUDIO'] }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || undefined;
  } catch (e) {
    console.error("MediaAI: Ambient Gen Error", e);
    return undefined;
  }
}

export async function generateSpeechForPage(lines: any[], profile: UserProfile): Promise<string | null> {
  try {
    const promptText = lines.map((l: any) => `${l.speaker}: ${l.text}`).join('\n');
    
    // Assign specific voices to roles
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
    console.error("MediaAI: TTS Error", e);
    return null;
  }
}
