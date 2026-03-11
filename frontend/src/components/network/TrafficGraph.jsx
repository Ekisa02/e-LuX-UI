import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

/**
 * Traffic Graph Component
 * Visualizes network traffic over time
 */
const TrafficGraph = ({ stats }) => {
  const chartData = useMemo(() => {
    // Generate sample data points based on stats
    const data = [];
    const now = Date.now();
    
    for (let i = 0; i < 60; i++) {
      data.push({
        time: new Date(now - (59 - i) * 1000).toLocaleTimeString(),
        download: Math.random() * 100,
        upload: Math.random() * 50,
        packets: Math.floor(Math.random() * 1000)
      });
    }
    
    return data;
  }, [stats]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cyber-panel border border-cyber-border rounded p-3">
          <p className="text-xs text-cyber-primary/60 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-xs font-mono" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="text-xs font-mono text-cyber-primary">
                {entry.value.toFixed(2)} KB/s
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-cyber-primary font-mono text-sm">TRAFFIC ANALYSIS</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-500 rounded" />
            <span className="text-xs font-mono text-cyber-primary/60">Download</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-fuchsia-500 rounded" />
            <span className="text-xs font-mono text-cyber-primary/60">Upload</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis 
            dataKey="time" 
            stroke="#00ff41"
            tick={{ fill: '#00ff41', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#00ff41"
            tick={{ fill: '#00ff41', fontSize: 10 }}
            unit="KB/s"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="download" 
            stroke="#00ffff" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name="Download"
          />
          <Line 
            type="monotone" 
            dataKey="upload" 
            stroke="#ff00ff" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name="Upload"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Protocol Distribution */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-cyber-dark/50 border border-cyber-border rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-cyber-primary/60">TCP</span>
            <span className="text-sm font-mono text-cyber-primary">
              {stats.protocols?.tcp || 0}
            </span>
          </div>
          <div className="w-full bg-cyber-dark h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyber-primary rounded-full"
              style={{ 
                width: `${((stats.protocols?.tcp || 0) / (stats.totalPackets || 1)) * 100}%` 
              }}
            />
          </div>
        </div>

        <div className="bg-cyber-dark/50 border border-cyber-border rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-cyber-primary/60">UDP</span>
            <span className="text-sm font-mono text-yellow-500">
              {stats.protocols?.udp || 0}
            </span>
          </div>
          <div className="w-full bg-cyber-dark h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 rounded-full"
              style={{ 
                width: `${((stats.protocols?.udp || 0) / (stats.totalPackets || 1)) * 100}%` 
              }}
            />
          </div>
        </div>

        <div className="bg-cyber-dark/50 border border-cyber-border rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-cyber-primary/60">Other</span>
            <span className="text-sm font-mono text-purple-500">
              {stats.protocols?.icmp || 0}
            </span>
          </div>
          <div className="w-full bg-cyber-dark h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full"
              style={{ 
                width: `${((stats.protocols?.icmp || 0) / (stats.totalPackets || 1)) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficGraph;