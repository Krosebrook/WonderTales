import React, { useState, useRef } from 'react';
import { blobToBase64 } from '../services/audioUtils';

interface VoiceInputProps {
  onInputComplete: (base64Audio: string) => void;
  disabled: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onInputComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' }); // or 'audio/webm' depending on browser
        const base64 = await blobToBase64(audioBlob);
        onInputComplete(base64);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("We need microphone access to hear your magic words!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
          ${disabled ? 'bg-gray-300 opacity-50 cursor-not-allowed' : 
            isRecording ? 'bg-red-500 scale-110 shadow-xl ring-4 ring-red-200' : 'bg-indigo-500 hover:bg-indigo-600 shadow-lg'}
        `}
      >
        {isRecording ? (
          <div className="w-8 h-8 bg-white rounded-md animate-pulse" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
      <p className="mt-4 text-gray-600 font-bold text-lg">
        {isRecording ? "Listening..." : "Tap to Speak"}
      </p>
    </div>
  );
};

export default VoiceInput;
