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
 * Memory Usage Chart Component
 */
const MemoryChart = ({ data = [], timeRange = '1h' }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      ...item,
      memory_percent: (item.memory_used / item.memory_total) * 100
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const usedGB = (payload[0].payload.memory_used / 1024 / 1024 / 1024).toFixed(2);
      const totalGB = (payload[0].payload.memory_total / 1024 / 1024 / 1024).toFixed(2);
      
      return (
        <div className="bg-cyber-panel border border-cyber-border rounded p-2">
          <p className="text-xs text-cyber-primary/60">{new Date(label).toLocaleTimeString()}</p>
          <p className="text-sm font-mono text-yellow-500">
            Memory: {payload[0].value.toFixed(1)}%
          </p>
          <p className="text-xs font-mono text-cyber-primary/60">
            {usedGB}GB / {totalGB}GB
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
          <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ffff00" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ffff00" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis 
          dataKey="timestamp" 
          stroke="#ffff00"
          tick={{ fill: '#ffff00', fontSize: 10 }}
          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
        />
        <YAxis 
          stroke="#ffff00"
          tick={{ fill: '#ffff00', fontSize: 10 }}
          domain={[0, 100]}
          unit="%"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="memory_percent" 
          stroke="#ffff00" 
          fillOpacity={1}
          fill="url(#memoryGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MemoryChart;