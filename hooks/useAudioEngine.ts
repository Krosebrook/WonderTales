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
    try {
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
    } catch (e) {
      console.warn("AudioEngine: Failed to play ambient", e);
    }
  };

  const playDialogue = useCallback(async () => {
    if (!page) return;
    try {
      const ctx = await initContext();

      // Stop existing
      if (dialogueRef.current.source) {
        try { dialogueRef.current.source.stop(); } catch(e){}
      }

      setIsPlayingDialogue(true);

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

  // Handle New Story Reset
  useEffect(() => {
    if (page?.pageNumber === 1) {
      audioCache.current.clear();
      // Also stop ambient if it's running from a previous session and we are starting fresh
      // Although usually we want ambient to transition, a page 1 reset implies a new context.
    }
  }, [page?.pageNumber]);

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
    // We add a small delay to ensure the UI transition has settled before speaking
    const timer = setTimeout(() => {
        playDialogue();
    }, 500);

    return () => {
        clearTimeout(timer);
        if (dialogueRef.current.source) try { dialogueRef.current.source.stop(); } catch(e){}
    };
  }, [page, playDialogue]); 

  // Volume Updates
  useEffect(() => {
    if (ambientRef.current.gain && ctxRef.current) {
      try {
        ambientRef.current.gain.gain.setTargetAtTime(ambientVolume, ctxRef.current.currentTime, 0.1);
      } catch (e) {}
    }
  }, [ambientVolume]);

  useEffect(() => {
    if (dialogueRef.current.gain && ctxRef.current) {
      try {
        dialogueRef.current.gain.gain.setTargetAtTime(dialogueVolume, ctxRef.current.currentTime, 0.1);
      } catch (e) {}
    }
  }, [dialogueVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
       if (ambientRef.current.source) try { ambientRef.current.source.stop(); } catch(e){}
       if (dialogueRef.current.source) try { dialogueRef.current.source.stop(); } catch(e){}
    };
  }, []);

  return {
    isPlayingDialogue,
    playDialogue,
    ambientVolume, setAmbientVolume,
    dialogueVolume, setDialogueVolume
  };
};