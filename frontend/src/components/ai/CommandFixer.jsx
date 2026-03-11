import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  Copy, 
  Check, 
  AlertCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAI } from '../../hooks/useAI';

/**
 * Command Fixer Component
 * Analyzes and fixes failed commands
 */
const CommandFixer = ({ onCommandSelect }) => {
  const [command, setCommand] = useState('');
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { analyzeCommand } = useAI();

  const handleAnalyze = async () => {
    if (!command.trim()) return;
    
    setIsAnalyzing(true);
    const result = await analyzeCommand(command, error);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseCommand = () => {
    if (analysis?.suggestion && onCommandSelect) {
      onCommandSelect(analysis.suggestion);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-cyber-primary/60 font-mono mb-1">
            FAILED COMMAND
          </label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g., git psh"
            className="w-full bg-cyber-dark border border-cyber-border rounded 
                     px-3 py-2 text-cyber-primary font-mono text-sm
                     focus:border-cyber-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-cyber-primary/60 font-mono mb-1">
            ERROR MESSAGE (optional)
          </label>
          <textarea
            value={error}
            onChange={(e) => setError(e.target.value)}
            placeholder="Paste the error message here..."
            rows="3"
            className="w-full bg-cyber-dark border border-cyber-border rounded 
                     px-3 py-2 text-cyber-primary font-mono text-sm
                     focus:border-cyber-primary focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !command.trim()}
          className="w-full py-2 bg-cyber-primary/20 border border-cyber-primary 
                   rounded text-cyber-primary font-mono text-sm
                   hover:bg-cyber-primary/30 disabled:opacity-50 
                   transition-colors flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              ANALYZING...
            </>
          ) : (
            <>
              <Wrench className="w-4 h-4" />
              ANALYZE & FIX
            </>
          )}
        </button>
      </div>

      {/* Analysis Result */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {/* Original Command */}
            <div className="bg-cyber-dark/50 border border-cyber-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-cyber-primary/40 font-mono">
                  ORIGINAL COMMAND
                </span>
                <button
                  onClick={() => handleCopy(analysis.originalCommand)}
                  className="p-1 hover:bg-cyber-primary/10 rounded"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-cyber-primary/60" />
                  )}
                </button>
              </div>
              <pre className="text-sm font-mono text-red-400 bg-red-500/10 p-2 rounded">
                {analysis.originalCommand}
              </pre>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-cyber-primary/40" />
            </div>

            {/* Suggested Fix */}
            <div className="bg-cyber-primary/10 border border-cyber-primary rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-cyber-primary font-mono">
                  SUGGESTED FIX
                </span>
                <span className={`text-xs font-mono ${
                  analysis.confidence > 0.7 ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {(analysis.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
              
              <pre className="text-sm font-mono text-cyber-primary bg-cyber-dark p-3 rounded mb-3">
                {analysis.suggestion}
              </pre>

              {analysis.error && (
                <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <p className="text-xs text-yellow-500 font-mono">
                    {analysis.error}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handleUseCommand}
                  className="flex-1 py-2 bg-cyber-primary/20 border border-cyber-primary 
                           rounded text-cyber-primary text-sm font-mono
                           hover:bg-cyber-primary hover:text-cyber-dark transition-colors"
                >
                  USE THIS COMMAND
                </button>
                <button
                  onClick={() => handleCopy(analysis.suggestion)}
                  className="px-3 py-2 bg-cyber-dark border border-cyber-border 
                           rounded text-cyber-primary/60 hover:text-cyber-primary 
                           hover:border-cyber-primary transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Fallback Warning */}
            {analysis.fallback && (
              <div className="flex items-center space-x-2 text-yellow-500 text-xs p-2 
                            bg-yellow-500/10 border border-yellow-500/30 rounded">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>AI offline - using pattern matching fallback</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && !analysis && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded">
          <p className="text-sm text-red-500 font-mono">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CommandFixer;