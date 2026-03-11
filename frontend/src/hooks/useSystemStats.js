import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateStats,
  addToHistory,
  clearHistory,
  setConnected,
  setError
} from '../store/slices/systemSlice';

/**
 * Custom hook for system statistics
 * Provides real-time system metrics with history
 */
export const useSystemStats = () => {
  const dispatch = useDispatch();
  const stats = useSelector(state => state.system.current);
  const history = useSelector(state => state.system.history);
  const isConnected = useSelector(state => state.system.isConnected);
  const error = useSelector(state => state.system.error);
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  const unsubscribeRef = useRef(null);
  const alertThresholds = useRef({
    cpu: 80,
    memory: 90,
    disk: 90,
    temperature: 85
  });

  // Subscribe to stats updates
  useEffect(() => {
    if (!isMonitoring) return;

    const handleStats = (newStats) => {
      dispatch(updateStats(newStats));
      dispatch(addToHistory(newStats));
      dispatch(setConnected(true));
      
      // Check for alerts
      checkAlerts(newStats);
    };

    const handleError = (err) => {
      dispatch(setError(err.message));
      dispatch(setConnected(false));
    };

    window.api.receive('system:stats', handleStats);
    window.api.receive('system:error', handleError);

    return () => {
      window.api.removeListener('system:stats', handleStats);
      window.api.removeListener('system:error', handleError);
    };
  }, [isMonitoring, dispatch]);

  // Check for system alerts
  const checkAlerts = useCallback((currentStats) => {
    const newAlerts = [];

    // CPU alert
    if (currentStats.cpu?.usage?.average > alertThresholds.current.cpu) {
      newAlerts.push({
        type: 'cpu',
        severity: 'warning',
        message: `High CPU usage: ${currentStats.cpu.usage.average.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }

    // Memory alert
    const memPercent = (currentStats.memory?.used / currentStats.memory?.total) * 100;
    if (memPercent > alertThresholds.current.memory) {
      newAlerts.push({
        type: 'memory',
        severity: 'warning',
        message: `High memory usage: ${memPercent.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }

    // Temperature alert
    if (currentStats.cpu?.temperature > alertThresholds.current.temperature) {
      newAlerts.push({
        type: 'temperature',
        severity: 'danger',
        message: `High CPU temperature: ${currentStats.cpu.temperature}°C`,
        timestamp: new Date().toISOString()
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
    }
  }, []);

  /**
   * Start monitoring system stats
   */
  const startMonitoring = useCallback((interval = 1000) => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    dispatch(setError(null));
    window.api.send('system:startMonitoring', { interval });

  }, [isMonitoring, dispatch]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    window.api.send('system:stopMonitoring');
    setIsMonitoring(false);
    dispatch(setConnected(false));
  }, [isMonitoring, dispatch]);

  /**
   * Get single snapshot
   */
  const getSnapshot = useCallback(async () => {
    try {
      const result = await window.api.invoke('system:getSnapshot');
      dispatch(updateStats(result));
      return result;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    }
  }, [dispatch]);

  /**
   * Get historical data
   */
  const getHistory = useCallback(async (hours = 24) => {
    try {
      const result = await window.api.invoke('system:getHistory', { hours });
      setHistoricalData(result);
      return result;
    } catch (err) {
      dispatch(setError(err.message));
      return [];
    }
  }, [dispatch]);

  /**
   * Get stats for time range
   */
  const getStatsForTimeRange = useCallback((range = '1h') => {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };

    const timeRange = ranges[range] || ranges['1h'];
    const cutoff = now - timeRange;

    return history.filter(item => new Date(item.timestamp).getTime() > cutoff);
  }, [history]);

  /**
   * Get average stats for period
   */
  const getAverageStats = useCallback((period = '1h') => {
    const filtered = getStatsForTimeRange(period);
    
    if (filtered.length === 0) return null;

    const avg = filtered.reduce((acc, curr) => {
      acc.cpu += curr.cpu_usage || 0;
      acc.memory += (curr.memory_used / curr.memory_total) * 100 || 0;
      acc.disk += (curr.disk_used / curr.disk_total) * 100 || 0;
      acc.network_rx += curr.network_rx || 0;
      acc.network_tx += curr.network_tx || 0;
      return acc;
    }, { cpu: 0, memory: 0, disk: 0, network_rx: 0, network_tx: 0 });

    Object.keys(avg).forEach(key => {
      avg[key] = avg[key] / filtered.length;
    });

    return avg;
  }, [getStatsForTimeRange]);

  /**
   * Clear history
   */
  const clearStatsHistory = useCallback(() => {
    dispatch(clearHistory());
    setHistoricalData([]);
  }, [dispatch]);

  /**
   * Clear alerts
   */
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  /**
   * Update alert thresholds
   */
  const updateThresholds = useCallback((newThresholds) => {
    alertThresholds.current = {
      ...alertThresholds.current,
      ...newThresholds
    };
  }, []);

  /**
   * Export stats to CSV
   */
  const exportStats = useCallback(async (format = 'csv') => {
    try {
      const result = await window.api.invoke('system:export', { 
        format, 
        data: history 
      });
      return result;
    } catch (err) {
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    }
  }, [dispatch, history]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [isMonitoring, stopMonitoring]);

  return {
    // State
    stats,
    history,
    isConnected,
    error,
    isMonitoring,
    alerts,
    historicalData,
    
    // Methods
    startMonitoring,
    stopMonitoring,
    getSnapshot,
    getHistory,
    getStatsForTimeRange,
    getAverageStats,
    clearStatsHistory,
    clearAlerts,
    updateThresholds,
    exportStats
  };
};