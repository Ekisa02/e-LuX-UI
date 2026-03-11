import React, { useState } from 'react';
import { 
  Plus, 
  Copy, 
  Clipboard, 
  Eraser, 
  Search,
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react';

/**
 * Terminal Controls Component
 * Provides control buttons for terminal operations
 */
const TerminalControls = ({ 
  onCreateNew,
  onClear,
  onCopy,
  onPaste,
  onSearch,
  onToggleFullscreen,
  isFullscreen = false,
  className = '' 
}) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button
        onClick={onCreateNew}
        className="p-1.5 hover:bg-cyber-primary/10 rounded transition-colors
                   text-cyber-primary/60 hover:text-cyber-primary"
        title="New Terminal (Ctrl+T)"
      >
        <Plus className="w-4 h-4" />
      </button>

      <button
        onClick={onCopy}
        className="p-1.5 hover:bg-cyber-primary/10 rounded transition-colors
                   text-cyber-primary/60 hover:text-cyber-primary"
        title="Copy (Ctrl+C)"
      >
        <Copy className="w-4 h-4" />
      </button>

      <button
        onClick={onPaste}
        className="p-1.5 hover:bg-cyber-primary/10 rounded transition-colors
                   text-cyber-primary/60 hover:text-cyber-primary"
        title="Paste (Ctrl+V)"
      >
        <Clipboard className="w-4 h-4" />
      </button>

      <button
        onClick={onClear}
        className="p-1.5 hover:bg-cyber-primary/10 rounded transition-colors
                   text-cyber-primary/60 hover:text-cyber-primary"
        title="Clear (Ctrl+K)"
      >
        <Eraser className="w-4 h-4" />
      </button>

      <button
        onClick={() => setShowSearch(!showSearch)}
        className="p-1.5 hover:bg-cyber-primary/10 rounded transition-colors
                   text-cyber-primary/60 hover:text-cyber-primary"
        title="Search (Ctrl+F)"
      >
        <Search className="w-4 h-4" />
      </button>

      <button
        onClick={onToggleFullscreen}
        className="p-1.5 hover:bg-cyber-primary/10 rounded transition-colors
                   text-cyber-primary/60 hover:text-cyber-primary"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </button>

      <button
        className="p-1.5 hover:bg-cyber-primary/10 rounded transition-colors
                   text-cyber-primary/60 hover:text-cyber-primary"
        title="Terminal Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Search Bar (conditionally shown) */}
      {showSearch && (
        <div className="absolute top-12 right-4 bg-cyber-panel border border-cyber-border 
                      rounded-lg p-2 shadow-lg z-10">
          <input
            type="text"
            placeholder="Search terminal..."
            className="bg-cyber-dark border border-cyber-border rounded px-3 py-1.5
                     text-sm font-mono text-cyber-primary focus:border-cyber-primary
                     focus:outline-none w-64"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSearch(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TerminalControls;