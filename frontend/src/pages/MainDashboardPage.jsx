import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import Terminal from '../components/terminal/Terminal';
import Dashboard from '../components/dashboard/Dashboard';
import NetworkMonitor from '../components/network/NetworkMonitor';
import AIPanel from '../components/ai/AIPanel';
import VoiceControl from '../components/voice/VoiceControl';
import TerminalHistory from '../components/terminal/TerminalHistory';
import { 
  Terminal as TerminalIcon, 
  Layout, 
  Activity, 
  Cpu,
  LogOut,
  Menu,
  X
} from 'lucide-react';

/**
 * Main Dashboard Page
 * Primary interface after authentication
 */
const MainDashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [activeView, setActiveView] = useState('terminal'); // 'terminal', 'dashboard', 'network'
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleVoiceCommand = (command) => {
    if (typeof command === 'string') {
      switch(command) {
        case 'system:cpu':
        case 'system:memory':
        case 'system:disk':
        case 'system:network':
          setActiveView('dashboard');
          break;
        case 'terminal:open':
        case 'terminal:clear':
          setActiveView('terminal');
          break;
        case 'network:start':
        case 'network:stop':
          setActiveView('network');
          break;
        default:
          console.log('Voice command:', command);
      }
    }
  };

  return (
    <div className="h-screen bg-cyber-dark flex overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ width: sidebarOpen ? 240 : 0 }}
        animate={{ width: sidebarOpen ? 240 : 0 }}
        className="bg-cyber-panel border-r border-cyber-border overflow-hidden
                   flex flex-col relative"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-cyber-border">
          <div className="flex items-center space-x-3">
            <Cpu className="w-6 h-6 text-cyber-primary" />
            <span className="text-lg font-cyber text-cyber-primary">e-LuX-UI</span>
          </div>
          
          {/* User Info */}
          <div className="mt-4 p-2 bg-cyber-dark/50 border border-cyber-border rounded">
            <p className="text-xs text-cyber-primary/60 font-mono">USER</p>
            <p className="text-sm font-mono text-cyber-primary truncate">
              {user?.username || 'Admin'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          <button
            onClick={() => setActiveView('terminal')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded
                      transition-colors font-mono text-sm ${
              activeView === 'terminal'
                ? 'bg-cyber-primary/20 text-cyber-primary border-l-2 border-cyber-primary'
                : 'text-cyber-primary/60 hover:bg-cyber-primary/10 hover:text-cyber-primary'
            }`}
          >
            <TerminalIcon className="w-4 h-4" />
            <span>TERMINAL</span>
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded
                      transition-colors font-mono text-sm ${
              activeView === 'dashboard'
                ? 'bg-cyber-primary/20 text-cyber-primary border-l-2 border-cyber-primary'
                : 'text-cyber-primary/60 hover:bg-cyber-primary/10 hover:text-cyber-primary'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>DASHBOARD</span>
          </button>

          <button
            onClick={() => setActiveView('network')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded
                      transition-colors font-mono text-sm ${
              activeView === 'network'
                ? 'bg-cyber-primary/20 text-cyber-primary border-l-2 border-cyber-primary'
                : 'text-cyber-primary/60 hover:bg-cyber-primary/10 hover:text-cyber-primary'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>NETWORK</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-cyber-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded
                     text-red-500/70 hover:bg-red-500/10 hover:text-red-500
                     transition-colors font-mono text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-cyber-panel border-b border-cyber-border h-14 
                      flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-cyber-primary/10 rounded"
            >
              {sidebarOpen ? (
                <X className="w-4 h-4 text-cyber-primary" />
              ) : (
                <Menu className="w-4 h-4 text-cyber-primary" />
              )}
            </button>

            <span className="text-sm font-mono text-cyber-primary/60">
              {activeView.toUpperCase()} MODE
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Voice Control */}
            <VoiceControl onCommand={handleVoiceCommand} />

            {/* History Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-1.5 rounded font-mono text-sm border
                        transition-colors ${
                showHistory
                  ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary'
                  : 'border-cyber-border text-cyber-primary/60 hover:text-cyber-primary'
              }`}
            >
              HISTORY
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Main View */}
          <div className="flex-1 overflow-hidden">
            {activeView === 'terminal' && (
              <Terminal className="h-full" />
            )}

            {activeView === 'dashboard' && (
              <Dashboard className="h-full overflow-y-auto" />
            )}

            {activeView === 'network' && (
              <NetworkMonitor className="h-full" />
            )}
          </div>

          {/* History Panel */}
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <TerminalHistory className="h-full" />
            </motion.div>
          )}
        </div>
      </div>

      {/* AI Panel - Floating */}
      <AIPanel 
        className="fixed bottom-4 right-4 w-80"
        onCommandSelect={(command) => {
          if (activeView === 'terminal') {
            window.api.send('terminal:execute', { command });
          }
        }}
      />
    </div>
  );
};

export default MainDashboardPage;