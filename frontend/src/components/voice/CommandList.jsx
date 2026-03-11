import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Cpu, 
  HardDrive, 
  Network, 
  Terminal,
  Activity,
  Shield,
  Mic
} from 'lucide-react';

/**
 * Command List Component
 * Displays available voice commands
 */
const CommandList = ({ onClose }) => {
  const commandCategories = [
    {
      name: 'System Commands',
      icon: Cpu,
      commands: [
        { phrase: 'Show CPU usage', description: 'Display CPU statistics' },
        { phrase: 'Show memory usage', description: 'Display memory usage' },
        { phrase: 'Show disk usage', description: 'Display disk statistics' },
        { phrase: 'Show network stats', description: 'Display network activity' },
        { phrase: 'System status', description: 'Show overall system status' }
      ]
    },
    {
      name: 'Terminal Commands',
      icon: Terminal,
      commands: [
        { phrase: 'Open terminal', description: 'Open new terminal window' },
        { phrase: 'Clear terminal', description: 'Clear terminal screen' },
        { phrase: 'New tab', description: 'Create new terminal tab' },
        { phrase: 'Close tab', description: 'Close current terminal tab' },
        { phrase: 'Run command [command]', description: 'Execute a command' }
      ]
    },
    {
      name: 'Network Commands',
      icon: Network,
      commands: [
        { phrase: 'Start capture', description: 'Begin packet capture' },
        { phrase: 'Stop capture', description: 'Stop packet capture' },
        { phrase: 'Show alerts', description: 'Display security alerts' },
        { phrase: 'Network scan', description: 'Scan network devices' }
      ]
    },
    {
      name: 'AI Commands',
      icon: Activity,
      commands: [
        { phrase: 'Analyze this', description: 'Analyze last command' },
        { phrase: 'Suggest command', description: 'Get command suggestion' },
        { phrase: 'Fix error', description: 'Get error fix suggestion' },
        { phrase: 'Help with [task]', description: 'Get help with a task' }
      ]
    },
    {
      name: 'Security Commands',
      icon: Shield,
      commands: [
        { phrase: 'Security status', description: 'Show security status' },
        { phrase: 'Show threats', description: 'Display detected threats' },
        { phrase: 'Run security scan', description: 'Perform security scan' }
      ]
    },
    {
      name: 'Voice Control',
      icon: Mic,
      commands: [
        { phrase: 'Stop listening', description: 'Deactivate voice control' },
        { phrase: 'Help', description: 'Show this command list' },
        { phrase: 'Repeat that', description: 'Repeat last response' }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-cyber-panel border border-cyber-border 
                    rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyber-border">
          <h2 className="text-xl font-cyber text-cyber-primary flex items-center gap-2">
            <Mic className="w-5 h-5" />
            VOICE COMMANDS
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cyber-primary/10 rounded transition-colors"
          >
            <X className="w-5 h-5 text-cyber-primary/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commandCategories.map((category) => (
              <div
                key={category.name}
                className="bg-cyber-dark/50 border border-cyber-border rounded-lg p-4"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <category.icon className="w-4 h-4 text-cyber-primary" />
                  <h3 className="text-sm font-cyber text-cyber-primary">
                    {category.name}
                  </h3>
                </div>

                <div className="space-y-2">
                  {category.commands.map((cmd, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-cyber-dark rounded border border-cyber-border/50
                               hover:border-cyber-primary/30 transition-colors"
                    >
                      <p className="text-sm font-mono text-cyber-primary mb-1">
                        "{cmd.phrase}"
                      </p>
                      <p className="text-xs text-cyber-primary/60">
                        {cmd.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-4 p-4 bg-cyber-primary/10 border border-cyber-primary/30 rounded-lg">
            <h4 className="text-sm font-cyber text-cyber-primary mb-2">💡 TIPS</h4>
            <ul className="space-y-2 text-sm text-cyber-primary/80">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Wait for the beep before giving a command</li>
              <li>• You can chain multiple commands together</li>
              <li>• Say "help" anytime to see this list</li>
              <li>• Commands work best in quiet environments</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommandList;