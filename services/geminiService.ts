
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, StoryPage, StoryLine } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to parse the JSON response from the text model
const parseStoryResponse = (text: string): Omit<StoryPage, 'pageNumber'> => {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON", text);
    throw new Error("Oops! The story got a little tangled. Let's try again!");
  }
};

export const generateAmbientSound = async (description: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: { parts: [{ text: `Generate a looping ambient background sound for: ${description}. Duration: 10 seconds. No speech, only atmospheric sound effects.` }] },
      config: {
        responseModalities: ['AUDIO'],
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (e) {
    console.error("Ambient sound generation failed", e);
    return null;
  }
};

export const generateNextStorySegment = async (
  profile: UserProfile,
  history: StoryPage[],
  userChoiceOrInput?: string,
  audioInputBase64?: string
): Promise<StoryPage> => {
  
  const isStart = history.length === 0;
  const pageNumber = history.length + 1;

  // 1. Story Generation (Gemini 3 Pro)
  const systemInstruction = `You are a professional children's book author for 7-year-olds. 
  Create a fun, interactive, whimsical story.
  The child's name is ${profile.name}.
  They love ${profile.favoriteThing}.
  They have a sidekick named ${profile.companion}.
  
  Structure the story page by page in a SCRIPT format.
  Each page should have:
  - Dialogue split into lines with identified speakers. 
    - Speakers can be: 'Narrator', '${profile.name}', '${profile.companion}', or 'SoundFX'.
    - For 'SoundFX', use onomatopoeia (e.g., "*Whoosh*", "Splash!", "Roar!").
  - A vivid visual description for an illustration (bold colors, cartoon style) that captures the ACTION.
  - 2 distinct choices for the child to make next.
  - A 'soundCue' for a specific sound effect visual badge (e.g., "Thunder clap").
  - An 'ambientSound' description for the continuous background atmosphere (e.g., "Rainy forest with gentle wind").
  
  Tone: Exciting, safe, funny, magical.
  
  IMPORTANT: You must return PURE JSON matching this schema:
  {
    "lines": [
      {"speaker": "Narrator", "text": "The story text..."},
      {"speaker": "${profile.name}", "text": "I love this!"},
      {"speaker": "SoundFX", "text": "*Poof*"}
    ],
    "imagePrompt": "A detailed description...",
    "choices": ["Option 1", "Option 2"],
    "soundCue": "Magical sparkles",
    "ambientSound": "Enchanted forest ambience"
  }
  `;

  let contents: any[] = [];
  
  if (isStart) {
    contents.push({ text: `Start a new story about ${profile.name} and ${profile.companion} involving ${profile.favoriteThing}.` });
  } else {
    // Build context from history (last 3 pages to keep context but save tokens)
    const context = history.slice(-3).map(p => 
      `Page ${p.pageNumber}:\n${p.lines.map(l => `${l.speaker}: ${l.text}`).join('\n')}`
    ).join('\n---\n');
    
    let prompt = `Continue the story. Previous context:\n${context}\n.`;
    
    if (audioInputBase64) {
      contents.push({
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: audioInputBase64 } },
          { text: prompt + " The user responded with the attached audio. Incorporate their choice or reaction." }
        ]
      });
    } else {
      prompt += ` The user chose: "${userChoiceOrInput}".`;
      contents.push({ text: prompt });
    }
  }

  const storyModel = 'gemini-3-pro-preview'; 

  const storyResponse = await ai.models.generateContent({
    model: storyModel,
    contents: contents.length > 0 && contents[0].role ? contents : [{ role: 'user', parts: [{ text: contents[0].text }] }], 
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING }
              }
            }
          },
          imagePrompt: { type: Type.STRING },
          choices: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          soundCue: { type: Type.STRING },
          ambientSound: { type: Type.STRING }
        },
        required: ['lines', 'imagePrompt', 'choices', 'ambientSound']
      }
    }
  });

  const storyData = parseStoryResponse(storyResponse.text || '{}');

  // 2. Parallel Generation (Image & Ambient Sound)
  
  // Image Generation
  const imagePromise = (async () => {
    try {
        const contextImagePrompt = `Scene Description: ${storyData.imagePrompt}. 
        Characters: ${profile.name} is a happy young child. ${profile.companion} is a distinct, cute magical sidekick character. 
        Style: 3D Pixar-style animation, vibrant colors, expressive faces, high quality 4:3.`;

        const imageResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [{ text: contextImagePrompt }]
        }
        });

        for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    } catch (err) {
        console.error("Image generation failed", err);
    }
    return `https://picsum.photos/800/600?random=${Math.random()}`;
  })();

  // Ambient Sound Generation
  const soundPromise = (async () => {
      if (storyData.ambientSound) {
          return await generateAmbientSound(storyData.ambientSound);
      }
      return null;
  })();

  const [imageUrl, ambientAudioData] = await Promise.all([imagePromise, soundPromise]);

  return {
    pageNumber,
    lines: storyData.lines || [],
    imagePrompt: storyData.imagePrompt,
    choices: storyData.choices,
    imageUrl: imageUrl,
    soundCue: storyData.soundCue,
    ambientSound: storyData.ambientSound,
    ambientAudioData: ambientAudioData || undefined
  };
};

export const generateSpeechForPage = async (lines: StoryLine[], profile: UserProfile): Promise<string | null> => {
  try {
    // Construct the multi-speaker transcript
    const promptText = lines.map(l => `${l.speaker}: ${l.text}`).join('\n');
    
    // Define speakers
    // We map: Narrator, User, Companion, SoundFX
    // Voices: Kore (Narrator), Puck (Child), Fenrir (Companion), Charon (SFX)
    
    const speakerVoiceConfigs = [
      { speaker: 'Narrator', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      { speaker: profile.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
      { speaker: profile.companion, voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
      { speaker: 'SoundFX', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } }
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: { parts: [{ text: promptText }] },
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs
                }
            }
        }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (e) {
    console.error("Multi-speaker TTS failed", e);
    // Fallback to single speaker if multi fails (sometimes happens with too many speakers in preview)
    try {
        const simpleText = lines.map(l => l.text).join(' ');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: { parts: [{ text: simpleText }] },
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                }
            }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (fallbackError) {
        console.error("Fallback TTS failed", fallbackError);
        return null;
    }
  }
};
