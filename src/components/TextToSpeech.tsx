'use client';

import { useState, useEffect } from 'react';
import { AacSymbol } from '@/data/aac-symbols';

interface TextToSpeechProps {
  symbols: AacSymbol[];
  disabled?: boolean;
}

export default function TextToSpeech({ symbols, disabled = false }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speakMessage = () => {
    if (!isSupported || symbols.length === 0 || isPlaying) return;

    setIsPlaying(true);
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create the message from symbols
    const message = symbols.map(symbol => symbol.text).join(' ');
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.8; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-center">
          Text-to-speech is not supported in your browser
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Speak Message</h3>
          {symbols.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              &quot;{symbols.map(s => s.text).join(' ')}&quot;
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={speakMessage}
            disabled={disabled || symbols.length === 0 || isPlaying}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              disabled || symbols.length === 0 || isPlaying
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95'
            }`}
          >
            {isPlaying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Speaking...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
                Play
              </>
            )}
          </button>
          
          {isPlaying && (
            <button
              onClick={stopSpeaking}
              className="px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          )}
        </div>
      </div>
      
      {symbols.length === 0 && (
        <p className="text-gray-500 text-center mt-4 text-sm">
          Add symbols to your board to create a message
        </p>
      )}
    </div>
  );
}