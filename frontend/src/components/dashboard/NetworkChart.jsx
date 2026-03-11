import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

/**
 * Network Traffic Chart Component
 */
const NetworkChart = ({ data = [], timeRange = '1h' }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      ...item,
      rx_mbps: (item.network_rx / 1024 / 1024).toFixed(2),
      tx_mbps: (item.network_tx / 1024 / 1024).toFixed(2)
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cyber-panel border border-cyber-border rounded p-2">
          <p className="text-xs text-cyber-primary/60">{new Date(label).toLocaleTimeString()}</p>
          <p className="text-sm font-mono text-cyan-500">
            ↓ {payload[0].value} MB/s
          </p>
          <p className="text-sm font-mono text-cyan-500">
            ↑ {payload[1].value} MB/s
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00ffff" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#00ffff" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ff00ff" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis 
          dataKey="timestamp" 
          stroke="#00ffff"
          tick={{ fill: '#00ffff', fontSize: 10 }}
          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
        />
        <YAxis 
          stroke="#00ffff"
          tick={{ fill: '#00ffff', fontSize: 10 }}
          unit="MB/s"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="rx_mbps" 
          stroke="#00ffff" 
          fillOpacity={1}
          fill="url(#rxGradient)"
          name="Download"
        />
        <Area 
          type="monotone" 
          dataKey="tx_mbps" 
          stroke="#ff00ff" 
          fillOpacity={1}
          fill="url(#txGradient)"
          name="Upload"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default NetworkChart;