import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Memory, 
  HardDrive, 
  Network,
  Activity,
  AlertTriangle
} from 'lucide-react';
import SystemStats from './SystemStats';
import CpuChart from './CpuChart';
import MemoryChart from './MemoryChart';
import DiskChart from './DiskChart';
import NetworkChart from './NetworkChart';
import { useSystemStats } from '../../hooks/useSystemStats';

/**
 * Main Dashboard Component
 * Displays all system monitoring metrics
 */
const Dashboard = ({ className = '' }) => {
  const { stats, history, isConnected } = useSystemStats();
  const [timeRange, setTimeRange] = useState('1h');

  const metrics = [
    {
      icon: Cpu,
      label: 'CPU Usage',
      value: stats?.cpu?.usage?.average?.toFixed(1) || '0',
      unit: '%',
      color: 'text-cyber-primary',
      bg: 'bg-cyber-primary/10',
      border: 'border-cyber-primary/30'
    },
    {
      icon: Memory,
      label: 'Memory',
      value: stats?.memory ? ((stats.memory.used / stats.memory.total) * 100).toFixed(1) : '0',
      unit: '%',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30'
    },
    {
      icon: HardDrive,
      label: 'Disk',
      value: stats?.disk?.[0]?.use?.toFixed(1) || '0',
      unit: '%',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30'
    },
    {
      icon: Network,
      label: 'Network',
      value: stats?.network?.stats?.[0]?.rx_sec ? 
             (stats.network.stats[0].rx_sec / 1024).toFixed(1) : '0',
      unit: 'KB/s',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-cyber text-cyber-primary flex items-center gap-2">
          <Activity className="w-6 h-6" />
          SYSTEM DASHBOARD
        </h1>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
            isConnected 
              ? 'border-cyber-primary bg-cyber-primary/10' 
              : 'border-red-500 bg-red-500/10'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-cyber-primary animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-xs font-mono">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${metric.bg} border ${metric.border} rounded-lg p-4`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-cyber-primary/60 font-mono mb-1">
                  {metric.label}
                </p>
                <div className="flex items-baseline">
                  <span className={`text-2xl font-mono ${metric.color}`}>
                    {metric.value}
                  </span>
                  <span className="ml-1 text-sm text-cyber-primary/40">
                    {metric.unit}
                  </span>
                </div>
              </div>
              <metric.icon className={`w-8 h-8 ${metric.color} opacity-50`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-cyber-panel border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyber-primary font-mono text-sm">CPU Usage History</h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-cyber-dark border border-cyber-border rounded px-2 py-1
                       text-xs font-mono text-cyber-primary"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
            </select>
          </div>
          <div className="h-64">
            <CpuChart data={history} timeRange={timeRange} />
          </div>
        </div>

        <div className="bg-cyber-panel border border-cyber-border rounded-lg p-4">
          <h3 className="text-cyber-primary font-mono text-sm mb-4">Memory Usage</h3>
          <div className="h-64">
            <MemoryChart data={history} timeRange={timeRange} />
          </div>
        </div>

        <div className="bg-cyber-panel border border-cyber-border rounded-lg p-4">
          <h3 className="text-cyber-primary font-mono text-sm mb-4">Disk Usage</h3>
          <div className="h-64">
            <DiskChart data={history} timeRange={timeRange} />
          </div>
        </div>

        <div className="bg-cyber-panel border border-cyber-border rounded-lg p-4">
          <h3 className="text-cyber-primary font-mono text-sm mb-4">Network Traffic</h3>
          <div className="h-64">
            <NetworkChart data={history} timeRange={timeRange} />
          </div>
        </div>
      </div>

      {/* System Info Bar */}
      {stats?.os && (
        <div className="bg-cyber-panel border border-cyber-border rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-cyber-primary/40 font-mono">OS</p>
              <p className="text-sm font-mono text-cyber-primary">{stats.os.distro}</p>
            </div>
            <div>
              <p className="text-xs text-cyber-primary/40 font-mono">Kernel</p>
              <p className="text-sm font-mono text-cyber-primary">{stats.os.kernel}</p>
            </div>
            <div>
              <p className="text-xs text-cyber-primary/40 font-mono">Hostname</p>
              <p className="text-sm font-mono text-cyber-primary">{stats.os.hostname}</p>
            </div>
            <div>
              <p className="text-xs text-cyber-primary/40 font-mono">Uptime</p>
              <p className="text-sm font-mono text-cyber-primary">
                {Math.floor(stats.os.uptime / 3600)}h {Math.floor((stats.os.uptime % 3600) / 60)}m
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {stats?.cpu?.temperature > 80 && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-sm font-mono text-red-500">
            High CPU Temperature Detected: {stats.cpu.temperature}°C
          </span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;