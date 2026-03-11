import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for voice command functionality
 * Manages speech recognition and command processing
 */
export const useVoiceCommands = (onCommand) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState(null);
  const [availableCommands, setAvailableCommands] = useState([]);
  
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);
      
      if (event.results[last].isFinal) {
        processCommand(text);
      }
    };

    // Load available commands
    loadCommands();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Load available voice commands from constants
  const loadCommands = async () => {
    try {
      const { VOICE } = await import('../utils/constants');
      setAvailableCommands(Object.entries(VOICE.COMMANDS).map(([phrase, action]) => ({
        phrase,
        action
      })));
    } catch (error) {
      console.error('Failed to load commands:', error);
    }
  };

  // Process voice command
  const processCommand = useCallback((text) => {
    const command = text.toLowerCase().trim();
    
    // Check against known commands
    const matched = availableCommands.find(cmd => 
      command.includes(cmd.phrase)
    );

    if (matched) {
      speak(`Executing ${matched.phrase}`);
      onCommand?.(matched.action);
    } else {
      // Unknown command, pass to AI
      onCommand?.({ type: 'voice:unknown', text: command });
    }
  }, [availableCommands, onCommand]);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      // Check permission first
      if (!permission) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermission('granted');
      }

      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start();
      }
    } catch (err) {
      setPermission('denied');
      setError('Microphone access denied');
    }
  }, [isListening, permission]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Speak text
  const speak = useCallback((text) => {
    if (!synthesisRef.current) return;

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current.speak(utterance);
  }, []);

  // Cancel speaking
  const cancelSpeak = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    permission,
    availableCommands,
    startListening,
    stopListening,
    toggleListening,
    speak,
    cancelSpeak
  };
};