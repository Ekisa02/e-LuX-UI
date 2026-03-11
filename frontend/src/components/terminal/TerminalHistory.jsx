import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Copy, Check, Play } from 'lucide-react';

/**
 * Terminal History Component
 * Displays command history with search and replay functionality
 */
const TerminalHistory = ({ 
  history = [], 
  onCommandSelect,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredHistory = useMemo(() => {
    return history
      .filter(cmd => cmd.command.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [history, searchTerm]);

  const handleCopy = async (command, id) => {
    await navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-cyber-panel border border-cyber-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-cyber-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-cyber-primary font-cyber text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            COMMAND HISTORY
          </h3>
          <span className="text-xs text-cyber-primary/40">
            {filteredHistory.length} commands
          </span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-cyber-primary/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search commands..."
            className="w-full bg-cyber-dark border border-cyber-border rounded pl-7 pr-3 py-1.5
                     text-xs font-mono text-cyber-primary focus:border-cyber-primary 
                     focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* History List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-cyber-primary/40 font-mono text-sm">
                No commands found
              </p>
            </div>
          ) : (
            filteredHistory.map((cmd, index) => (
              <motion.div
                key={cmd.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.02 }}
                className="group p-3 border-b border-cyber-border/30 hover:bg-cyber-primary/5 
                         transition-colors cursor-pointer"
                onClick={() => onCommandSelect?.(cmd.command)}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs text-cyber-primary/40 font-mono">
                    {formatTimestamp(cmd.timestamp)}
                  </span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(cmd.command, cmd.id);
                      }}
                      className="p-1 hover:bg-cyber-primary/10 rounded"
                    >
                      {copiedId === cmd.id ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-cyber-primary/60" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCommandSelect?.(cmd.command);
                      }}
                      className="p-1 hover:bg-cyber-primary/10 rounded"
                    >
                      <Play className="w-3 h-3 text-cyber-primary/60" />
                    </button>
                  </div>
                </div>
                
                <pre className="text-sm font-mono text-cyber-primary truncate">
                  {cmd.command}
                </pre>
                
                {cmd.exitCode !== undefined && (
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`text-xs font-mono ${
                      cmd.exitCode === 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      Exit: {cmd.exitCode}
                    </span>
                    {cmd.directory && (
                      <span className="text-xs text-cyber-primary/40 font-mono">
                        {cmd.directory}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TerminalHistory;