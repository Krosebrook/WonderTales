
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

// --- UI Sound Effects (Synthesized) ---

let uiAudioCtx: AudioContext | null = null;

export const playSystemSound = (type: 'click' | 'pop' | 'magic' | 'success' | 'error') => {
  try {
    if (!uiAudioCtx) {
      uiAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (uiAudioCtx.state === 'suspended') {
      uiAudioCtx.resume();
    }

    const osc = uiAudioCtx.createOscillator();
    const gain = uiAudioCtx.createGain();
    const now = uiAudioCtx.currentTime;

    osc.connect(gain);
    gain.connect(uiAudioCtx.destination);

    switch (type) {
      case 'click':
        // Gentle tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'pop':
        // Pleasant selection bubble
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'magic':
        // Shimmering sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'success':
        // Major chord arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
        notes.forEach((freq, i) => {
          const oscN = uiAudioCtx!.createOscillator();
          const gainN = uiAudioCtx!.createGain();
          oscN.connect(gainN);
          gainN.connect(uiAudioCtx!.destination);
          
          const start = now + (i * 0.05);
          oscN.type = 'sine';
          oscN.frequency.value = freq;
          gainN.gain.setValueAtTime(0.05, start);
          gainN.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
          oscN.start(start);
          oscN.stop(start + 0.3);
        });
        break;
        
      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  } catch (e) {
    // Fail silently if audio is blocked or unsupported
  }
};
