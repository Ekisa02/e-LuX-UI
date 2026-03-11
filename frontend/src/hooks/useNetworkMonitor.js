import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addPacket,
  updateStats,
  addAlert,
  clearAlerts,
  setCapturing,
  setError
} from '../store/slices/networkSlice';

/**
 * Custom hook for network monitoring
 * Manages packet capture and analysis
 */
export const useNetworkMonitor = () => {
  const dispatch = useDispatch();
  const packets = useSelector(state => state.network.packets);
  const stats = useSelector(state => state.network.stats);
  const alerts = useSelector(state => state.network.alerts);
  const isCapturing = useSelector(state => state.network.isCapturing);
  const error = useSelector(state => state.network.error);

  const [interfaces, setInterfaces] = useState([]);
  const [filter, setFilterState] = useState('');
  const [packetRate, setPacketRate] = useState(0);
  
  const packetCountRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());

  // Load available network interfaces
  useEffect(() => {
    const loadInterfaces = async () => {
      try {
        const result = await window.api.invoke('network:interfaces');
        setInterfaces(result);
      } catch (err) {
        console.error('Failed to load interfaces:', err);
      }
    };

    loadInterfaces();
  }, []);

  // Subscribe to network events
  useEffect(() => {
    if (!isCapturing) return;

    const handlePacket = (packet) => {
      dispatch(addPacket(packet));
      
      // Calculate packet rate
      packetCountRef.current++;
      const now = Date.now();
      const timeDiff = now - lastUpdateRef.current;
      
      if (timeDiff >= 1000) {
        setPacketRate(packetCountRef.current);
        packetCountRef.current = 0;
        lastUpdateRef.current = now;
      }
    };

    const handleStats = (newStats) => {
      dispatch(updateStats(newStats));
    };

    const handleAlert = (alert) => {
      dispatch(addAlert(alert));
    };

    const handleError = (err) => {
      dispatch(setError(err.message));
    };

    window.api.receive('network:packet', handlePacket);
    window.api.receive('network:stats', handleStats);
    window.api.receive('network:alert', handleAlert);
    window.api.receive('network:error', handleError);

    return () => {
      window.api.removeListener('network:packet', handlePacket);
      window.api.removeListener('network:stats', handleStats);
      window.api.removeListener('network:alert', handleAlert);
      window.api.removeListener('network:error', handleError);
    };
  }, [isCapturing, dispatch]);

  // Start packet capture
  const startCapture = useCallback(async (interfaceName = 'any', filterStr = '') => {
    try {
      dispatch(setError(null));
      
      const result = await window.api.invoke('network:startCapture', {
        interface: interfaceName,
        filter: filterStr
      });

      if (result.success) {
        dispatch(setCapturing(true));
        setFilterState(filterStr);
        packetCountRef.current = 0;
        lastUpdateRef.current = Date.now();
      } else {
        dispatch(setError(result.error));
      }

      return result;
    } catch (err) {
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    }
  }, [dispatch]);

  // Stop packet capture
  const stopCapture = useCallback(async () => {
    try {
      const result = await window.api.invoke('network:stopCapture');
      
      if (result.success) {
        dispatch(setCapturing(false));
      }

      return result;
    } catch (err) {
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    }
  }, [dispatch]);

  // Set capture filter
  const setFilter = useCallback(async (filterStr) => {
    try {
      const result = await window.api.invoke('network:setFilter', { filter: filterStr });
      
      if (result.success) {
        setFilterState(filterStr);
      }

      return result;
    } catch (err) {
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    }
  }, [dispatch]);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    dispatch(clearAlerts());
  }, [dispatch]);

  // Get packet statistics
  const getPacketStats = useCallback(() => {
    const protocolCount = packets.reduce((acc, packet) => {
      acc[packet.protocol] = (acc[packet.protocol] || 0) + 1;
      return acc;
    }, {});

    const topSources = packets
      .reduce((acc, packet) => {
        if (packet.src?.ip) {
          acc[packet.src.ip] = (acc[packet.src.ip] || 0) + 1;
        }
        return acc;
      }, {});

    const sortedSources = Object.entries(topSources)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalPackets: packets.length,
      protocolDistribution: protocolCount,
      topSources: sortedSources,
      packetRate
    };
  }, [packets, packetRate]);

  // Export packet capture
  const exportCapture = useCallback(async (format = 'pcap') => {
    try {
      const result = await window.api.invoke('network:export', { format });
      return result;
    } catch (err) {
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    }
  }, [dispatch]);

  // Clear packet buffer
  const clearBuffer = useCallback(async () => {
    try {
      const result = await window.api.invoke('network:clearBuffer');
      return result;
    } catch (err) {
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    }
  }, [dispatch]);

  return {
    // State
    packets,
    stats,
    alerts,
    isCapturing,
    error,
    interfaces,
    filter,
    packetRate,
    
    // Methods
    startCapture,
    stopCapture,
    setFilter,
    clearAlerts: clearAllAlerts,
    getPacketStats,
    exportCapture,
    clearBuffer
  };
};