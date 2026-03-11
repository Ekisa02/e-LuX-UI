import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, Check, Zap, AlertCircle } from 'lucide-react';

/**
 * AI Suggestion Card Component
 * Displays individual AI suggestions with expandable details
 */
const SuggestionCard = ({ suggestion, onClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(suggestion.suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.7) return 'text-green-500';
    if (confidence > 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getIcon = () => {
    if (suggestion.confidence > 0.7) return <Zap className="w-4 h-4 text-green-500" />;
    if (suggestion.confidence > 0.4) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-cyber-dark/50 border border-cyber-border rounded-lg overflow-hidden
                 hover:border-cyber-primary/50 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="p-3 flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getIcon()}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-cyber-primary font-mono text-sm">
                {suggestion.originalCommand}
              </span>
              <span className={`text-xs font-mono ${getConfidenceColor(suggestion.confidence)}`}>
                {(suggestion.confidence * 100).toFixed(0)}% match
              </span>
            </div>
            <p className="text-cyber-primary/80 text-sm line-clamp-2">
              {suggestion.suggestion}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-cyber-primary/10 rounded transition-colors"
            title="Copy suggestion"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-cyber-primary/60" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-1 hover:bg-cyber-primary/10 rounded transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-cyber-primary/60" />
            ) : (
              <ChevronDown className="w-4 h-4 text-cyber-primary/60" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-3 pb-3 pt-1 border-t border-cyber-border/50"
        >
          <div className="space-y-2">
            <div>
              <span className="text-xs text-cyber-primary/40 font-mono block mb-1">
                ERROR:
              </span>
              <p className="text-xs text-red-400/80 font-mono bg-red-900/10 p-2 rounded">
                {suggestion.error}
              </p>
            </div>
            
            <div>
              <span className="text-xs text-cyber-primary/40 font-mono block mb-1">
                SUGGESTED COMMAND:
              </span>
              <pre className="text-xs text-cyber-primary bg-cyber-dark p-2 rounded font-mono overflow-x-auto">
                {suggestion.suggestion}
              </pre>
            </div>

            {suggestion.fallback && (
              <div className="flex items-center space-x-2 text-yellow-500/80 text-xs">
                <AlertCircle className="w-3 h-3" />
                <span>AI offline - using pattern matching</span>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="w-full mt-2 py-2 bg-cyber-primary/20 border border-cyber-primary rounded
                       text-cyber-primary font-mono text-sm hover:bg-cyber-primary/30
                       transition-colors"
            >
              APPLY SUGGESTION
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SuggestionCard;