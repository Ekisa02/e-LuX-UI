import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  Play, 
  StopCircle, 
  Filter,
  Download,
  Upload,
  Globe,
  Shield
} from 'lucide-react';
import PacketTable from './PacketTable';
import TrafficGraph from './TrafficGraph';
import SuspiciousAlert from './SuspiciousAlert';
import { useNetworkMonitor } from '../../hooks/useNetworkMonitor';

/**
 * Network Monitor Component
 * Displays real-time network traffic and packet capture
 */
const NetworkMonitor = ({ className = '' }) => {
  const {
    isCapturing,
    packets,
    stats,
    alerts,
    startCapture,
    stopCapture,
    setFilter,
    clearAlerts
  } = useNetworkMonitor();

  const [filterInput, setFilterInput] = useState('');
  const [selectedInterface, setSelectedInterface] = useState('any');
  const [view, setView] = useState('packets'); // 'packets', 'graph', 'alerts'
  const [interfaces, setInterfaces] = useState([]);

  // Load available network interfaces
  useEffect(() => {
    const loadInterfaces = async () => {
      try {
        const result = await window.api.invoke('network:interfaces');
        setInterfaces(result);
      } catch (error) {
        console.error('Failed to load interfaces:', error);
      }
    };
    loadInterfaces();
  }, []);

  const handleStartCapture = () => {
    startCapture(selectedInterface, filterInput);
  };

  const handleStopCapture = () => {
    stopCapture();
  };

  const handleApplyFilter = () => {
    setFilter(filterInput);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className={`bg-cyber-panel border border-cyber-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-cyber-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-cyber-primary font-cyber text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            NETWORK MONITOR
          </h2>
          
          <div className="flex items-center space-x-2">
            {/* Capture Control */}
            {!isCapturing ? (
              <button
                onClick={handleStartCapture}
                className="flex items-center space-x-2 px-4 py-2 bg-cyber-primary/20 
                         border border-cyber-primary rounded text-cyber-primary 
                         hover:bg-cyber-primary hover:text-cyber-dark transition-colors"
              >
                <Play className="w-4 h-4" />
                <span className="font-mono text-sm">START CAPTURE</span>
              </button>
            ) : (
              <button
                onClick={handleStopCapture}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 
                         border border-red-500 rounded text-red-500 
                         hover:bg-red-500 hover:text-white transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                <span className="font-mono text-sm">STOP CAPTURE</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-cyber-dark/50 border border-cyber-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyber-primary/40 font-mono">Total Packets</p>
                <p className="text-xl font-mono text-cyber-primary">
                  {stats.totalPackets?.toLocaleString() || 0}
                </p>
              </div>
              <Globe className="w-8 h-8 text-cyber-primary/30" />
            </div>
          </div>

          <div className="bg-cyber-dark/50 border border-cyber-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyber-primary/40 font-mono">Total Data</p>
                <p className="text-xl font-mono text-cyber-primary">
                  {formatBytes(stats.totalBytes || 0)}
                </p>
              </div>
              <Download className="w-8 h-8 text-cyber-primary/30" />
            </div>
          </div>

          <div className="bg-cyber-dark/50 border border-cyber-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyber-primary/40 font-mono">Alerts</p>
                <p className="text-xl font-mono text-red-500">
                  {alerts.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500/30" />
            </div>
          </div>

          <div className="bg-cyber-dark/50 border border-cyber-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyber-primary/40 font-mono">Duration</p>
                <p className="text-xl font-mono text-cyber-primary">
                  {stats.duration ? `${Math.floor(stats.duration)}s` : '0s'}
                </p>
              </div>
              <Shield className="w-8 h-8 text-cyber-primary/30" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Interface Select */}
          <select
            value={selectedInterface}
            onChange={(e) => setSelectedInterface(e.target.value)}
            disabled={isCapturing}
            className="bg-cyber-dark border border-cyber-border rounded px-3 py-2
                     text-sm font-mono text-cyber-primary focus:border-cyber-primary
                     focus:outline-none disabled:opacity-50"
          >
            <option value="any">Any Interface</option>
            {interfaces.map(iface => (
              <option key={iface.name} value={iface.name}>
                {iface.name} ({iface.ip4 || 'No IP'})
              </option>
            ))}
          </select>

          {/* Filter Input */}
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative flex-1">
              <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-primary/40" />
              <input
                type="text"
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                placeholder="BPF Filter (e.g., port 80 or host 192.168.1.1)"
                disabled={isCapturing}
                className="w-full bg-cyber-dark border border-cyber-border rounded 
                         pl-8 pr-3 py-2 text-sm font-mono text-cyber-primary
                         focus:border-cyber-primary focus:outline-none
                         disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleApplyFilter}
              disabled={isCapturing}
              className="px-4 py-2 bg-cyber-primary/20 border border-cyber-primary 
                       rounded text-cyber-primary hover:bg-cyber-primary/30
                       disabled:opacity-50 transition-colors font-mono text-sm"
            >
              APPLY
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-2 mt-4">
          {[
            { id: 'packets', label: 'PACKETS', icon: Activity },
            { id: 'graph', label: 'TRAFFIC GRAPH', icon: Upload },
            { id: 'alerts', label: 'ALERTS', icon: AlertTriangle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                view === tab.id
                  ? 'bg-cyber-primary/20 border border-cyber-primary text-cyber-primary'
                  : 'text-cyber-primary/60 hover:text-cyber-primary hover:bg-cyber-primary/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-mono text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'packets' && (
            <motion.div
              key="packets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <PacketTable packets={packets} />
            </motion.div>
          )}

          {view === 'graph' && (
            <motion.div
              key="graph"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full p-4"
            >
              <TrafficGraph stats={stats} />
            </motion.div>
          )}

          {view === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full p-4 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyber-primary font-mono text-sm">SECURITY ALERTS</h3>
                {alerts.length > 0 && (
                  <button
                    onClick={clearAlerts}
                    className="text-xs text-cyber-primary/60 hover:text-cyber-primary"
                  >
                    CLEAR ALL
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-cyber-primary/20 mx-auto mb-3" />
                    <p className="text-cyber-primary/40 font-mono text-sm">
                      No security alerts detected
                    </p>
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <SuspiciousAlert key={index} alert={alert} />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-cyber-border bg-cyber-dark/30">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-4">
            <span className="text-cyber-primary/40">
              TCP: {stats.protocols?.tcp || 0}
            </span>
            <span className="text-cyber-primary/40">
              UDP: {stats.protocols?.udp || 0}
            </span>
            <span className="text-cyber-primary/40">
              ICMP: {stats.protocols?.icmp || 0}
            </span>
          </div>
          <span className="text-cyber-primary/40">
            {isCapturing ? 'Capturing...' : 'Idle'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkMonitor;