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
 * CPU Usage Chart Component
 */
const CpuChart = ({ data = [], timeRange = '1h' }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let points = 50;
    if (timeRange === '6h') points = 100;
    if (timeRange === '24h') points = 200;
    
    const step = Math.max(1, Math.floor(data.length / points));
    return data.filter((_, i) => i % step === 0);
  }, [data, timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cyber-panel border border-cyber-border rounded p-2">
          <p className="text-xs text-cyber-primary/60">{new Date(label).toLocaleTimeString()}</p>
          <p className="text-sm font-mono text-cyber-primary">
            CPU: {payload[0].value.toFixed(1)}%
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
          <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00ff41" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#00ff41" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis 
          dataKey="timestamp" 
          stroke="#00ff41"
          tick={{ fill: '#00ff41', fontSize: 10 }}
          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
        />
        <YAxis 
          stroke="#00ff41"
          tick={{ fill: '#00ff41', fontSize: 10 }}
          domain={[0, 100]}
          unit="%"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="cpu_usage" 
          stroke="#00ff41" 
          fillOpacity={1}
          fill="url(#cpuGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CpuChart;