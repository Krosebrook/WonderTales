export const getAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 24000,
  });
};

export const decodeAudioData = async (
  base64String: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create buffer from raw PCM if headerless, but Gemini TTS usually sends standard formats wrapped or raw PCM.
  // The Gemini TTS preview sends raw PCM 24kHz mono usually.
  // We need to implement manual decoding for raw PCM if the standard decodeAudioData fails,
  // but for the prompt specific instructions, we use the manual PCM decoding logic provided.

  const dataInt16 = new Int16Array(bytes.buffer);
  const numChannels = 1;
  const sampleRate = 24000;
  
  const frameCount = dataInt16.length / numChannels;
  const buffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};