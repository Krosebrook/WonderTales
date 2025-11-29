import { useEffect, useRef, useState, useCallback } from 'react';
import { StoryPage, UserProfile } from '../types';
import { generateSpeechForPage } from '../services/geminiService';
import { getAudioContext, decodeAudioData } from '../services/audioUtils';

export const useStoryAudio = (page: StoryPage | undefined, profile: UserProfile) => {
  const [isPlayingDialogue, setIsPlayingDialogue] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.2);
  const [dialogueVolume, setDialogueVolume] = useState(1.0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioCacheRef = useRef<string | null>(null); // Cache for current page dialogue
  
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientGainNodeRef = useRef<GainNode | null>(null);
  
  const dialogueSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const dialogueGainNodeRef = useRef<GainNode | null>(null);

  // Helper to init context
  const getContext = async () => {
    if (!audioContextRef.current) {
        audioContextRef.current = getAudioContext();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    return ctx;
  };

  const playDialogue = useCallback(async () => {
      if (!page) return;
      const ctx = await getContext();

      // Stop existing dialogue if any
      if (dialogueSourceRef.current) {
          try { dialogueSourceRef.current.stop(); } catch(e){}
          dialogueSourceRef.current = null;
      }

      setIsPlayingDialogue(true);

      try {
          let base64 = audioCacheRef.current;
          
          if (!base64) {
              // Fetch if not cached
              base64 = await generateSpeechForPage(page.lines, profile);
              // Cache it so we don't fetch again for this page
              if (base64) audioCacheRef.current = base64;
          }

          if (base64) {
              const buffer = await decodeAudioData(base64, ctx);
              const source = ctx.createBufferSource();
              const gainNode = ctx.createGain();

              source.buffer = buffer;
              source.connect(gainNode);
              gainNode.connect(ctx.destination);
              gainNode.gain.value = dialogueVolume; // Apply current volume
              
              source.start(0);
              dialogueSourceRef.current = source;
              dialogueGainNodeRef.current = gainNode;

              source.onended = () => setIsPlayingDialogue(false);
          } else {
              setIsPlayingDialogue(false);
          }
      } catch (e) {
          console.error("Dialogue playback failed", e);
          setIsPlayingDialogue(false);
      }
  }, [page, profile, dialogueVolume]);

  useEffect(() => {
    const initPageAudio = async () => {
       if (!page) return;

       const ctx = await getContext();

       // Cleanup previous page audio sources
       if (ambientSourceRef.current) {
         try { ambientSourceRef.current.stop(); } catch(e){}
         ambientSourceRef.current = null;
       }
       if (dialogueSourceRef.current) {
         try { dialogueSourceRef.current.stop(); } catch(e){}
         dialogueSourceRef.current = null;
       }

       // Clear cache for new page so playDialogue fetches new audio
       audioCacheRef.current = null;

       // 1. Ambient Sound
       if (page.ambientAudioData) {
           try {
               const buffer = await decodeAudioData(page.ambientAudioData, ctx);
               const source = ctx.createBufferSource();
               const gainNode = ctx.createGain();
               
               source.buffer = buffer;
               source.loop = true;
               source.connect(gainNode);
               gainNode.connect(ctx.destination);
               
               // Smooth fade in
               gainNode.gain.setValueAtTime(0, ctx.currentTime);
               gainNode.gain.linearRampToValueAtTime(ambientVolume, ctx.currentTime + 1.5);
               
               source.start(0);
               ambientSourceRef.current = source;
               ambientGainNodeRef.current = gainNode;
           } catch(e) { console.error("Ambient play error", e); }
       }

       // 2. Auto-play Dialogue
       playDialogue();
    };

    initPageAudio();

    return () => {
        if (ambientSourceRef.current) try { ambientSourceRef.current.stop(); } catch(e){}
        if (dialogueSourceRef.current) try { dialogueSourceRef.current.stop(); } catch(e){}
    };
  }, [page]); // Re-run when page object changes

  // Volume effects
  useEffect(() => {
      if (ambientGainNodeRef.current && audioContextRef.current) {
          ambientGainNodeRef.current.gain.setTargetAtTime(ambientVolume, audioContextRef.current.currentTime, 0.1);
      }
  }, [ambientVolume]);

  useEffect(() => {
      if (dialogueGainNodeRef.current && audioContextRef.current) {
          dialogueGainNodeRef.current.gain.setTargetAtTime(dialogueVolume, audioContextRef.current.currentTime, 0.1);
      }
  }, [dialogueVolume]);

  return { 
      isPlayingDialogue, 
      playDialogue, 
      ambientVolume, setAmbientVolume, 
      dialogueVolume, setDialogueVolume 
  };
};