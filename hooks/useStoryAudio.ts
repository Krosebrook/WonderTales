import { useEffect, useRef, useState } from 'react';
import { StoryPage, UserProfile } from '../types';
import { generateSpeechForPage } from '../services/geminiService';
import { getAudioContext, decodeAudioData } from '../services/audioUtils';

export const useStoryAudio = (page: StoryPage | undefined, profile: UserProfile) => {
  const [isPlayingDialogue, setIsPlayingDialogue] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.2);
  const [dialogueVolume, setDialogueVolume] = useState(1.0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientGainNodeRef = useRef<GainNode | null>(null);
  
  const dialogueSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const dialogueGainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const initAudio = async () => {
       if (!page) return; // Guard against undefined page during transitions

       if (!audioContextRef.current) {
          audioContextRef.current = getAudioContext();
       }
       const ctx = audioContextRef.current;
       if (ctx.state === 'suspended') await ctx.resume();

       // Stop previous sounds
       if (ambientSourceRef.current) {
         try { ambientSourceRef.current.stop(); } catch(e){}
         ambientSourceRef.current = null;
       }
       if (dialogueSourceRef.current) {
         try { dialogueSourceRef.current.stop(); } catch(e){}
         dialogueSourceRef.current = null;
       }

       // 1. Ambient Sound (Loop)
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
           } catch(e) {
               console.error("Ambient audio error", e);
           }
       }

       // 2. Dialogue (One-shot)
       setIsPlayingDialogue(true);
       const base64Dialogue = await generateSpeechForPage(page.lines, profile);
       if (base64Dialogue) {
        try {
            const buffer = await decodeAudioData(base64Dialogue, ctx);
            const source = ctx.createBufferSource();
            const gainNode = ctx.createGain();
            
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            gainNode.gain.value = dialogueVolume;
            source.start(0);
            
            dialogueSourceRef.current = source;
            dialogueGainNodeRef.current = gainNode;
            
            source.onended = () => {
                setIsPlayingDialogue(false);
            };
        } catch (e) {
            console.error("Audio playback error", e);
            setIsPlayingDialogue(false);
        }
       } else {
         setIsPlayingDialogue(false);
       }
    };
    
    initAudio();

    return () => {
        if (ambientSourceRef.current) {
            try { ambientSourceRef.current.stop(); } catch(e){}
        }
        if (dialogueSourceRef.current) {
            try { dialogueSourceRef.current.stop(); } catch(e){}
        }
    };
  }, [page, profile]); // Re-run when page changes

  // Update volume: Ambient
  useEffect(() => {
      if (ambientGainNodeRef.current && audioContextRef.current) {
          ambientGainNodeRef.current.gain.setTargetAtTime(ambientVolume, audioContextRef.current.currentTime, 0.1);
      }
  }, [ambientVolume]);

  // Update volume: Dialogue
  useEffect(() => {
      if (dialogueGainNodeRef.current && audioContextRef.current) {
          dialogueGainNodeRef.current.gain.setTargetAtTime(dialogueVolume, audioContextRef.current.currentTime, 0.1);
      }
  }, [dialogueVolume]);

  return { isPlayingDialogue, ambientVolume, setAmbientVolume, dialogueVolume, setDialogueVolume };
};