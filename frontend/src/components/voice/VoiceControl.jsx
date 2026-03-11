import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Command,
  List,
  Settings,
  X
} from 'lucide-react';
import VoiceWave from './VoiceWave';
import CommandList from './CommandList';

/**
 * Voice Control Component
 * Handles voice commands and speech recognition
 */
const VoiceControl = ({ onCommand, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [permission, setPermission] = useState(null);

  // Check for microphone permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermission('granted');
      } catch (err) {
        setPermission('denied');
      }
    };
    checkPermission();
  }, []);

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);
      
      if (event.results[last].isFinal) {
        processCommand(text);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    return recognition;
  };

  const [recognition, setRecognition] = useState(null);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      const newRecognition = initSpeechRecognition();
      if (newRecognition) {
        setRecognition(newRecognition);
        newRecognition.start();
      }
    }
  };

  const processCommand = (text) => {
    const command = text.toLowerCase().trim();
    
    // Handle common commands
    if (command.includes('show cpu')) {
      onCommand?.('system:cpu');
      speak('Showing CPU usage');
    } else if (command.includes('show memory')) {
      onCommand?.('system:memory');
      speak('Showing memory usage');
    } else if (command.includes('show disk')) {
      onCommand?.('system:disk');
      speak('Showing disk usage');
    } else if (command.includes('show network')) {
      onCommand?.('system:network');
      speak('Showing network stats');
    } else if (command.includes('open terminal')) {
      onCommand?.('terminal:open');
      speak('Opening terminal');
    } else if (command.includes('clear terminal')) {
      onCommand?.('terminal:clear');
      speak('Clearing terminal');
    } else if (command.includes('start capture')) {
      onCommand?.('network:start');
      speak('Starting network capture');
    } else if (command.includes('stop capture')) {
      onCommand?.('network:stop');
      speak('Stopping network capture');
    } else if (command.includes('help')) {
      setShowCommands(true);
      speak('Available commands: show system stats, open terminal, clear screen, start capture');
    } else {
      // Unknown command, pass through to AI
      onCommand?.({ type: 'voice:unknown', text: command });
    }
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Control Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        className={`relative p-4 rounded-full transition-all ${
          isListening 
            ? 'bg-cyber-primary text-cyber-dark shadow-glow' 
            : 'bg-cyber-panel border border-cyber-border text-cyber-primary/60 hover:text-cyber-primary'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice control'}
      >
        {isListening ? (
          <Mic className="w-6 h-6" />
        ) : (
          <MicOff className="w-6 h-6" />
        )}

        {/* Ripple Effect when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-cyber-primary/30" />
            <span className="absolute inset-0 rounded-full animate-pulse bg-cyber-primary/20" />
          </>
        )}
      </motion.button>

      {/* Voice Wave Animation */}
      {isListening && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-64">
          <VoiceWave isActive={isListening} />
        </div>
      )}

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 
                     bg-cyber-panel border border-cyber-border rounded-lg 
                     p-3 mt-8 min-w-[200px] text-center"
          >
            <p className="text-sm font-mono text-cyber-primary">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="absolute -top-2 -right-2">
          <Volume2 className="w-4 h-4 text-cyber-primary animate-pulse" />
        </div>
      )}

      {/* Control Panel */}
      <div className="absolute top-0 right-0 flex space-x-2">
        <button
          onClick={() => setShowCommands(!showCommands)}
          className="p-2 bg-cyber-panel border border-cyber-border rounded
                   text-cyber-primary/60 hover:text-cyber-primary transition-colors"
          title="Show commands"
        >
          <List className="w-4 h-4" />
        </button>
        
        <button
          className="p-2 bg-cyber-panel border border-cyber-border rounded
                   text-cyber-primary/60 hover:text-cyber-primary transition-colors"
          title="Voice settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Commands List Modal */}
      <AnimatePresence>
        {showCommands && (
          <CommandList onClose={() => setShowCommands(false)} />
        )}
      </AnimatePresence>

      {/* Permission Warning */}
      {permission === 'denied' && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 
                      bg-red-500/20 border border-red-500 rounded-lg p-3 
                      whitespace-nowrap">
          <p className="text-xs text-red-500 font-mono">
            Microphone access denied. Please enable in settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceControl;