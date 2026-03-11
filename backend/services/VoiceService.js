const EventEmitter = require('events');
const log = require('../utils/logger');

/**
 * Voice Command Service
 * Handles voice recognition and command parsing
 * Note: This runs in renderer process with Web Speech API
 */
class VoiceService extends EventEmitter {
  constructor() {
    super();
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.commands = new Map();
    this.setupCommands();
  }

  /**
   * Initialize voice recognition
   */
  init() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.emit('error', 'Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.emit('started');
      log.info('Voice recognition started');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.emit('stopped');
      log.info('Voice recognition stopped');
    };

    this.recognition.onerror = (event) => {
      this.emit('error', event.error);
      log.error('Voice recognition error:', event.error);
    };

    this.recognition.onresult = (event) => {
      this.processResult(event);
    };

    return true;
  }

  /**
   * Setup available voice commands
   */
  setupCommands() {
    // System commands
    this.addCommand('show cpu usage', () => this.emit('command', 'system:cpu'));
    this.addCommand('show memory usage', () => this.emit('command', 'system:memory'));
    this.addCommand('show disk usage', () => this.emit('command', 'system:disk'));
    this.addCommand('show network stats', () => this.emit('command', 'system:network'));

    // Terminal commands
    this.addCommand('open terminal', () => this.emit('command', 'terminal:open'));
    this.addCommand('clear terminal', () => this.emit('command', 'terminal:clear'));
    this.addCommand('new tab', () => this.emit('command', 'terminal:new-tab'));
    this.addCommand('close tab', () => this.emit('command', 'terminal:close-tab'));

    // AI commands
    this.addCommand('analyze this', () => this.emit('command', 'ai:analyze-last'));
    this.addCommand('suggest command', () => this.emit('command', 'ai:suggest'));
    this.addCommand('fix error', () => this.emit('command', 'ai:fix-error'));

    // Network commands
    this.addCommand('start capture', () => this.emit('command', 'network:start'));
    this.addCommand('stop capture', () => this.emit('command', 'network:stop'));
    this.addCommand('show alerts', () => this.emit('command', 'network:alerts'));

    // Voice control commands
    this.addCommand('stop listening', () => this.stop());
    this.addCommand('help', () => this.speak('Available commands: show system stats, open terminal, clear screen, start capture'));
  }

  /**
   * Add a voice command
   */
  addCommand(phrase, callback) {
    this.commands.set(phrase.toLowerCase(), callback);
  }

  /**
   * Start listening
   */
  start() {
    if (!this.recognition) {
      if (!this.init()) {
        return false;
      }
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      log.error('Failed to start voice recognition:', error);
      return false;
    }
  }

  /**
   * Stop listening
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Process speech recognition result
   */
  processResult(event) {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript.toLowerCase().trim();
    const confidence = event.results[last][0].confidence;

    this.emit('transcript', { text: transcript, confidence });

    // Check for exact command matches
    if (event.results[last].isFinal) {
      this.matchCommand(transcript);
    }
  }

  /**
   * Match transcript to commands
   */
  matchCommand(transcript) {
    for (const [phrase, callback] of this.commands) {
      if (transcript.includes(phrase)) {
        log.info(`Voice command matched: ${phrase}`);
        callback();
        this.speak(`Executing ${phrase}`);
        return;
      }
    }

    // Check for partial matches
    for (const [phrase, callback] of this.commands) {
      const words = phrase.split(' ');
      const matches = words.filter(word => transcript.includes(word));
      
      if (matches.length >= words.length / 2) {
        log.info(`Voice command partial match: ${phrase}`);
        callback();
        this.speak(`Did you mean ${phrase}?`);
        return;
      }
    }

    log.debug(`No command matched for: ${transcript}`);
  }

  /**
   * Speak text
   */
  speak(text) {
    if (!this.synthesis) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.voice = this.synthesis.getVoices().find(v => v.lang === 'en-US');

    this.synthesis.speak(utterance);
    this.emit('speaking', text);
  }

  /**
   * Get available commands
   */
  getCommands() {
    return Array.from(this.commands.keys());
  }

  /**
   * Check if listening
   */
  getStatus() {
    return {
      isListening: this.isListening,
      supported: !!this.recognition,
      commandCount: this.commands.size
    };
  }
}

export default VoiceService;