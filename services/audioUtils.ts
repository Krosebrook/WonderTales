
// Global volume for system sounds
let sfxVolume = 0.5;

export const setSfxVolume = (v: number) => {
  sfxVolume = Math.max(0, Math.min(1, v));
};

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

// --- UI Sound Effects ---

// We keep this simple singleton for UI clicks, separate from the Story Audio Engine
let uiCtx: AudioContext | null = null;

export const playSystemSound = (type: 'click' | 'pop' | 'magic' | 'success' | 'error' | 'page-turn') => {
  try {
    if (!uiCtx) {
      uiCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (uiCtx.state === 'suspended') uiCtx.resume();

    const osc = uiCtx.createOscillator();
    const gain = uiCtx.createGain();
    const now = uiCtx.currentTime;

    osc.connect(gain);
    gain.connect(uiCtx.destination);
    
    // Apply global SFX volume
    const vol = sfxVolume;

    switch (type) {
      case 'click':
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.05 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001 * vol, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'pop':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.05 * vol, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'magic':
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        gain.gain.setValueAtTime(0.05 * vol, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.05 * vol, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'page-turn':
        // Synthesize a paper shuffle sound using white noise
        const bufferSize = uiCtx.sampleRate * 0.3;
        const buffer = uiCtx.createBuffer(1, bufferSize, uiCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = uiCtx.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = uiCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(800, now);
        noiseFilter.frequency.linearRampToValueAtTime(0, now + 0.3);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(gain);
        
        gain.gain.setValueAtTime(0.15 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001 * vol, now + 0.25);
        
        noise.start(now);
        // Don't need to stop OSC as we used noise buffer source
        break;
    }
  } catch (e) {
    // Ignore
  }
};