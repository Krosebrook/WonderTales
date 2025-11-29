import { useEffect, useRef, useState, useCallback } from 'react';
import { StoryPage, UserProfile } from '../types';
import { generateSpeechForPage } from '../services/orchestrator';
import { getAudioContext, decodeAudioData } from '../services/audioUtils';

/**
 * Audio Engine Hook
 * Separates concerns between "Ambient Loop" and "Dialogue Playback".
 * Handles AudioContext lifecycle securely.
 */
export const useAudioEngine = (page: StoryPage | undefined, profile: UserProfile) => {
  const [isPlayingDialogue, setIsPlayingDialogue] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.2);
  const [dialogueVolume, setDialogueVolume] = useState(1.0);
  
  const ctxRef = useRef<AudioContext | null>(null);
  
  // Tracks
  const ambientRef = useRef<{ source: AudioBufferSourceNode | null, gain: GainNode | null }>({ source: null, gain: null });
  const dialogueRef = useRef<{ source: AudioBufferSourceNode | null, gain: GainNode | null }>({ source: null, gain: null });
  
  const audioCache = useRef<Map<number, string>>(new Map()); // PageNumber -> Base64

  const initContext = async () => {
    if (!ctxRef.current) ctxRef.current = getAudioContext();
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
    return ctxRef.current;
  };

  const playAmbient = async (base64: string) => {
    const ctx = await initContext();
    
    // Stop previous
    if (ambientRef.current.source) {
      try { ambientRef.current.source.stop(); } catch(e){}
    }

    const buffer = await decodeAudioData(base64, ctx);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    gain.connect(ctx.destination);
    
    // Fade in
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(ambientVolume, ctx.currentTime + 2);
    
    source.start(0);
    ambientRef.current = { source, gain };
  };

  const playDialogue = useCallback(async () => {
    if (!page) return;
    const ctx = await initContext();

    // Stop existing
    if (dialogueRef.current.source) {
      try { dialogueRef.current.source.stop(); } catch(e){}
    }

    setIsPlayingDialogue(true);

    try {
      let base64 = audioCache.current.get(page.pageNumber);
      
      if (!base64) {
        base64 = await generateSpeechForPage(page.lines, profile) || undefined;
        if (base64) audioCache.current.set(page.pageNumber, base64);
      }

      if (base64) {
        const buffer = await decodeAudioData(base64, ctx);
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();

        source.buffer = buffer;
        source.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.value = dialogueVolume;

        source.start(0);
        dialogueRef.current = { source, gain };
        
        source.onended = () => setIsPlayingDialogue(false);
      } else {
        setIsPlayingDialogue(false);
      }
    } catch (e) {
      console.error("AudioEngine: Playback Error", e);
      setIsPlayingDialogue(false);
    }
  }, [page, profile, dialogueVolume]);

  // Page Transition Effect
  useEffect(() => {
    if (!page) return;
    
    // Handle Ambient
    if (page.ambientAudioData) {
        playAmbient(page.ambientAudioData);
    } else {
        // Design choice: Keep playing previous if undefined (continuity)
    }

    // Handle Dialogue Auto-play
    playDialogue();

    return () => {
        if (dialogueRef.current.source) try { dialogueRef.current.source.stop(); } catch(e){}
    };
  }, [page]); 

  // Volume Updates
  useEffect(() => {
    if (ambientRef.current.gain && ctxRef.current) {
      ambientRef.current.gain.gain.setTargetAtTime(ambientVolume, ctxRef.current.currentTime, 0.1);
    }
  }, [ambientVolume]);

  useEffect(() => {
    if (dialogueRef.current.gain && ctxRef.current) {
      dialogueRef.current.gain.gain.setTargetAtTime(dialogueVolume, ctxRef.current.currentTime, 0.1);
    }
  }, [dialogueVolume]);

  return {
    isPlayingDialogue,
    playDialogue,
    ambientVolume, setAmbientVolume,
    dialogueVolume, setDialogueVolume
  };
};
