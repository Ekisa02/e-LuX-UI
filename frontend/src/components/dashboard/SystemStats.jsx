import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { useSystemStats } from '../../hooks/useSystemStats';
import CpuChart from './CpuChart';
import MemoryChart from './MemoryChart';
import NetworkChart from './NetworkChart';
import DiskChart from './DiskChart';

/**
 * System Statistics Dashboard Component
 * Displays real-time system metrics with charts
 */
const SystemStats = ({ className = '' }) => {
  const {
    stats,
    history,
    isConnected,
    error,
    startMonitoring,
    stopMonitoring
  } = useSystemStats();

  const [view, setView] = useState('compact'); // 'compact' or 'detailed'
  const [timeRange, setTimeRange] = useState('1h'); // '1h', '6h', '24h'

  // Start monitoring on mount
  useEffect(() => {
    startMonitoring(1000);
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-500 font-mono">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-cyber-primary font-cyber text-lg tracking-wider">
          SYSTEM_TELEMETRY
        </h2>
        
        <div className="flex space-x-2">
          {/* View Toggle */}
          <button
            onClick={() => setView(view === 'compact' ? 'detailed' : 'compact')}
            className="px-3 py-1 bg-cyber-panel border border-cyber-border rounded 
                     text-cyber-primary hover:bg-cyber-primary/10 transition-colors"
          >
            {view === 'compact' ? 'DETAILED' : 'COMPACT'}
          </button>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-cyber-primary animate-pulse' : 'bg-cyber-danger'
            }`} />
            <span className="text-xs text-cyber-primary/60 font-mono">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyber-panel border border-cyber-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-cyber-primary/80 font-mono text-sm">CPU</h3>
            <span className="text-cyber-primary font-mono">
              {stats?.cpu?.usage?.average?.toFixed(1)}%
            </span>
          </div>
          
          <div className="h-32">
            <CpuChart data={history} timeRange={timeRange} />
          </div>
          
          {view === 'detailed' && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-cyber-dark/50 p-2 rounded">
                <span className="text-cyber-primary/60">CORES</span>
                <div className="text-cyber-primary font-mono">
                  {stats?.cpu?.physicalCores} / {stats?.cpu?.cores}
                </div>
              </div>
              <div className="bg-cyber-dark/50 p-2 rounded">
                <span className="text-cyber-primary/60">TEMP</span>
                <div className="text-cyber-primary font-mono">
                  {stats?.cpu?.temperature?.toFixed(1)}°C
                </div>
              </div>
              <div className="bg-cyber-dark/50 p-2 rounded">
                <span className="text-cyber-primary/60">SPEED</span>
                <div className="text-cyber-primary font-mono">
                  {stats?.cpu?.speed?.toFixed(2)} GHz
                </div>
              </div>
              <div className="bg-cyber-dark/50 p-2 rounded">
                <span className="text-cyber-primary/60">PROCESSES</span>
                <div className="text-cyber-primary font-mono">
                  {stats?.processes?.running || 0}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Memory Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-cyber-panel border border-cyber-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-cyber-primary/80 font-mono text-sm">MEMORY</h3>
            <span className="text-cyber-primary font-mono">
              {((stats?.memory?.used / stats?.memory?.total) * 100).toFixed(1)}%
            </span>
          </div>
          
          <div className="h-32">
            <MemoryChart data={history} timeRange={timeRange} />
          </div>
          
          {view === 'detailed' && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-cyber-dark/50 p-2 rounded">
                <span className="text-cyber-primary/60">USED</span>
                <div className="text-cyber-primary font-mono">
                  {(stats?.memory?.used / 1024 / 1024 / 1024).toFixed(2)} GB
                </div>
              </div>
              <div className="bg-cyber-dark/50 p-2 rounded">
                <span className="text-cyber-primary/60">TOTAL</span>
                <div className="text-cyber-primary font-mono">
                  {(stats?.memory?.total / 1024 / 1024 / 1024).toFixed(2)} GB
                </div>
              </div>
              <div className="bg-cyber-dark/50 p-2 rounded">
                <span className="text-cyber-primary/60">SWAP</span>
                <div className="text-cyber-primary font-mono">
                  {((stats?.memory?.swapUsed / stats?.memory?.swapTotal) * 100 || 0).toFixed(1)}%
                </div>
              </div>
              <div className="bg-cyber-dark/50 p-2 rounded">
                <span className="text-cyber-primary/60">AVAILABLE</span>
                <div className="text-cyber-primary font-mono">
                  {(stats?.memory?.available / 1024 / 1024 / 1024).toFixed(2)} GB
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Network Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-cyber-panel border border-cyber-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-cyber-primary/80 font-mono text-sm">NETWORK</h3>
            <div className="flex space-x-4">
              <span className="text-cyber-primary font-mono text-xs">
                ↓ {(stats?.network?.stats[0]?.rxSec / 1024).toFixed(1)} KB/s
              </span>
              <span className="text-cyber-primary font-mono text-xs">
                ↑ {(stats?.network?.stats[0]?.txSec / 1024).toFixed(1)} KB/s
              </span>
            </div>
          </div>
          
          <div className="h-32">
            <NetworkChart data={history} timeRange={timeRange} />
          </div>
        </motion.div>

        {/* Disk Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-cyber-panel border border-cyber-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-cyber-primary/80 font-mono text-sm">DISK</h3>
            <span className="text-cyber-primary font-mono">
              {stats?.disk[0]?.use?.toFixed(1)}%
            </span>
          </div>
          
          <div className="h-32">
            <DiskChart data={history} timeRange={timeRange} />
          </div>
          
          {view === 'detailed' && stats?.disk?.map((disk, idx) => (
            <div key={idx} className="mt-2 text-xs">
              <div className="flex justify-between">
                <span className="text-cyber-primary/60">{disk.mount}</span>
                <span className="text-cyber-primary">
                  {(disk.used / 1024 / 1024 / 1024).toFixed(1)} / {(disk.size / 1024 / 1024 / 1024).toFixed(1)} GB
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2">
        {['1h', '6h', '24h'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-2 py-1 text-xs font-mono rounded border ${
              timeRange === range
                ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary'
                : 'bg-cyber-panel border-cyber-border text-cyber-primary/60 hover:bg-cyber-primary/10'
            } transition-colors`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SystemStats;