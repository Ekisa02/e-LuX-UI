import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  packets: [],
  stats: {
    totalPackets: 0,
    totalBytes: 0,
    protocols: {},
    startTime: null
  },
  alerts: [],
  isCapturing: false,
  error: null,
  filter: ''
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    addPacket: (state, action) => {
      state.packets.unshift(action.payload);
      state.stats.totalPackets++;
      state.stats.totalBytes += action.payload.length || 0;
      
      // Update protocol stats
      const protocol = action.payload.protocol || 'unknown';
      state.stats.protocols[protocol] = (state.stats.protocols[protocol] || 0) + 1;
      
      // Keep only last 1000 packets
      if (state.packets.length > 1000) {
        state.packets.pop();
      }
    },
    
    updateStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...action.payload
      };
    },
    
    addAlert: (state, action) => {
      state.alerts.unshift({
        ...action.payload,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 alerts
      if (state.alerts.length > 50) {
        state.alerts.pop();
      }
    },
    
    clearAlerts: (state) => {
      state.alerts = [];
    },
    
    setCapturing: (state, action) => {
      state.isCapturing = action.payload;
      if (action.payload) {
        state.stats.startTime = new Date().toISOString();
      }
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    
    clearPackets: (state) => {
      state.packets = [];
      state.stats = {
        totalPackets: 0,
        totalBytes: 0,
        protocols: {},
        startTime: null
      };
    },
    
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  addPacket,
  updateStats,
  addAlert,
  clearAlerts,
  setCapturing,
  setError,
  setFilter,
  clearPackets,
  clearError
} = networkSlice.actions;

export default networkSlice.reducer;