import React from 'react';
import { motion } from 'framer-motion';
import { X, Terminal } from 'lucide-react';

/**
 * Terminal Tab Component
 * Represents a single tab in the multi-tab terminal
 */
const TerminalTab = ({ 
  session, 
  isActive, 
  onSelect, 
  onClose,
  index 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`group flex items-center space-x-2 px-3 py-1.5 rounded-t-lg cursor-pointer
                 transition-all duration-200 ${
        isActive 
          ? 'bg-cyber-primary/20 border-t-2 border-cyber-primary text-cyber-primary' 
          : 'bg-cyber-dark/50 text-cyber-primary/60 hover:bg-cyber-primary/10 hover:text-cyber-primary/80'
      }`}
      onClick={onSelect}
    >
      <Terminal className="w-3 h-3" />
      <span className="text-sm font-mono max-w-[120px] truncate">
        {session.name || `Terminal ${session.id.slice(0, 4)}`}
      </span>
      
      {session.process && (
        <span className="w-1.5 h-1.5 bg-cyber-primary rounded-full animate-pulse" />
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 
                   hover:bg-cyber-danger/20 rounded"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

export default TerminalTab;