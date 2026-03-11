import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useTerminal } from '../../hooks/useTerminal';
import { useAI } from '../../hooks/useAI';
import AIPanel from '../ai/AIPanel';
// ... other imports

const Terminal = ({ sessionId = 'main', className = '' }) => {
  // ... existing state
  
  const { executeCommand } = useTerminal();
  const { analyzeCommand, suggestions } = useAI();
  
  const [lastCommand, setLastCommand] = useState('');
  const [lastError, setLastError] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(true);

  // Capture command output for errors
  const handleTerminalData = (data) => {
    // Check if this is an error output
    if (data.includes('command not found') || 
        data.includes('Permission denied') ||
        data.includes('No such file') ||
        data.includes('fatal:') ||
        data.includes('error:')) {
      
      setLastError(data);
      
      // Trigger AI analysis
      if (lastCommand) {
        analyzeCommand(lastCommand, data, {
          cwd: '/', // You'd get actual cwd
          platform: process.platform
        });
      }
    }
    
    xterm.write(data);
  };

  // Handle command input
  const handleCommandInput = (data) => {
    // Capture full command when Enter is pressed
    if (data === '\r') {
      // Get the current line
      const line = xterm.buffer.active.getLine(xterm.buffer.active.cursorY)?.translateToString();
      if (line && !line.startsWith('#')) {
        setLastCommand(line.trim());
      }
    }
    
    writeToSession(activeSession, data);
  };

  // Apply AI suggestion
  const handleApplySuggestion = (command) => {
    executeCommand(command);
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Terminal Area */}
      <div className={`flex-1 flex flex-col ${showAIPanel ? 'w-2/3' : 'w-full'}`}>
        {/* ... existing terminal UI */}
        
        <div 
          ref={terminalContainerRef}
          className="flex-1 p-2"
          style={{ minHeight: 0 }}
        />
      </div>

      {/* AI Panel - Slide in/out */}
      <div className={`transition-all duration-300 ${
        showAIPanel ? 'w-1/3 ml-2' : 'w-0 ml-0 opacity-0'
      } overflow-hidden`}>
        <AIPanel 
          onCommandSelect={handleApplySuggestion}
          className="h-full"
        />
      </div>

      {/* Toggle AI Panel Button */}
      <button
        onClick={() => setShowAIPanel(!showAIPanel)}
        className="absolute bottom-4 right-4 p-3 bg-cyber-primary/20 border 
                   border-cyber-primary rounded-full text-cyber-primary
                   hover:bg-cyber-primary/30 transition-colors"
        title={showAIPanel ? 'Hide AI Assistant' : 'Show AI Assistant'}
      >
        <Cpu className="w-5 h-5" />
      </button>
    </div>
  );
};