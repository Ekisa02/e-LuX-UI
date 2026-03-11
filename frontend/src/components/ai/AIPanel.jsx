import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Zap, 
  Terminal, 
  AlertCircle, 
  CheckCircle,
  MessageSquare,
  History,
  X,
  Send
} from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import SuggestionCard from './SuggestionCard';
import CommandFixer from './CommandFixer';

/**
 * AI Assistant Panel Component
 * Displays AI suggestions and command analysis
 */
const AIPanel = ({ className = '', onCommandSelect }) => {
  const {
    suggestions,
    isProcessing,
    error,
    analyzeCommand,
    getSuggestion,
    markSuggestionUsed,
    clearSuggestions,
    naturalLanguageToCommand
  } = useAI();

  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const panelRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle command analysis
  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    // Add to chat
    setChatHistory(prev => [...prev, { type: 'user', content: input }]);
    
    // Check if it's natural language
    if (!input.includes(' ') && !input.match(/[`~!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)) {
      // Likely a command, analyze directly
      const result = await analyzeCommand(input);
      setAnalysisResult(result);
      setChatHistory(prev => [...prev, { type: 'ai', content: result }]);
    } else {
      // Natural language, convert to command first
      const command = await naturalLanguageToCommand(input);
      if (command) {
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          content: `I'll help you with that. Try this command:\n\`${command}\`` 
        }]);
        if (onCommandSelect) {
          onCommandSelect(command);
        }
      }
    }
    
    setInput('');
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (onCommandSelect) {
      onCommandSelect(suggestion.suggestion);
    }
    markSuggestionUsed(suggestion.id);
    setChatHistory(prev => [...prev, { 
      type: 'system', 
      content: `Applied suggestion: ${suggestion.suggestion}` 
    }]);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -left-10 top-4 p-2 bg-cyber-panel border border-cyber-border 
                   rounded-l-lg hover:bg-cyber-primary/10 transition-colors"
      >
        {isExpanded ? (
          <X className="w-4 h-4 text-cyber-primary" />
        ) : (
          <Cpu className="w-4 h-4 text-cyber-primary" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-cyber-panel border border-cyber-border rounded-lg flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-4 border-b border-cyber-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-cyber-primary" />
                  <h2 className="text-cyber-primary font-cyber text-lg tracking-wider">
                    AI_ASSISTANT
                  </h2>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-cyber-primary'
                  }`} />
                  <span className="text-xs text-cyber-primary/60 font-mono">
                    {isProcessing ? 'PROCESSING' : 'ACTIVE'}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2">
                {[
                  { id: 'chat', label: 'CHAT', icon: MessageSquare },
                  { id: 'suggestions', label: 'SUGGESTIONS', icon: Zap },
                  { id: 'analyzer', label: 'ANALYZER', icon: Terminal },
                  { id: 'history', label: 'HISTORY', icon: History }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 px-3 rounded text-sm font-mono 
                               flex items-center justify-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-cyber-primary/20 border border-cyber-primary text-cyber-primary'
                        : 'bg-cyber-dark/50 border border-cyber-border text-cyber-primary/60 hover:bg-cyber-primary/10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div ref={panelRef} className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                      {chatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.type === 'user'
                              ? 'bg-cyber-primary/20 border border-cyber-primary'
                              : msg.type === 'ai'
                              ? 'bg-cyber-dark border border-cyber-border'
                              : 'bg-yellow-500/10 border border-yellow-500/30'
                          }`}>
                            <pre className="text-sm font-mono text-cyber-primary whitespace-pre-wrap">
                              {msg.content}
                            </pre>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                        placeholder="Ask me anything or enter a command..."
                        className="flex-1 bg-cyber-dark border border-cyber-border rounded 
                                 px-3 py-2 text-cyber-primary font-mono text-sm
                                 focus:border-cyber-primary focus:outline-none"
                      />
                      <button
                        onClick={handleAnalyze}
                        disabled={isProcessing || !input.trim()}
                        className="px-4 py-2 bg-cyber-primary/20 border border-cyber-primary 
                                 rounded text-cyber-primary hover:bg-cyber-primary/30
                                 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Suggestions Tab */}
                {activeTab === 'suggestions' && (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {suggestions.length === 0 ? (
                      <div className="text-center py-8">
                        <Zap className="w-12 h-12 text-cyber-primary/20 mx-auto mb-3" />
                        <p className="text-cyber-primary/40 font-mono text-sm">
                          No suggestions yet. Run some commands!
                        </p>
                      </div>
                    ) : (
                      suggestions.map((suggestion) => (
                        <SuggestionCard
                          key={suggestion.id}
                          suggestion={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                        />
                      ))
                    )}
                  </motion.div>
                )}

                {/* Analyzer Tab */}
                {activeTab === 'analyzer' && (
                  <motion.div
                    key="analyzer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <CommandFixer onCommandSelect={onCommandSelect} />
                  </motion.div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="space-y-2">
                      {suggestions.slice(0, 10).map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="p-2 bg-cyber-dark/50 border border-cyber-border 
                                   rounded text-sm font-mono cursor-pointer
                                   hover:bg-cyber-primary/10 transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-cyber-primary/40">
                              {new Date(suggestion.timestamp).toLocaleString()}
                            </span>
                            <span className={`text-xs ${
                              suggestion.confidence > 0.7 ? 'text-green-500' : 'text-yellow-500'
                            }`}>
                              {(suggestion.confidence * 100).toFixed(0)}% match
                            </span>
                          </div>
                          <p className="text-cyber-primary truncate">
                            {suggestion.originalCommand}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-cyber-border bg-cyber-dark/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyber-primary/40 font-mono">
                  Model: codellama
                </span>
                <button
                  onClick={clearSuggestions}
                  className="text-cyber-primary/40 hover:text-cyber-primary font-mono transition-colors"
                >
                  CLEAR ALL
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIPanel;