import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  current: null,
  history: [],
  isConnected: false,
  error: null,
  alerts: []
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    updateStats: (state, action) => {
      state.current = action.payload;
    },
    
    addToHistory: (state, action) => {
      state.history.push({
        ...action.payload,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 1000 data points
      if (state.history.length > 1000) {
        state.history = state.history.slice(-1000);
      }
    },
    
    clearHistory: (state) => {
      state.history = [];
    },
    
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    addAlert: (state, action) => {
      state.alerts.unshift(action.payload);
      
      // Keep only last 50 alerts
      if (state.alerts.length > 50) {
        state.alerts.pop();
      }
    },
    
    clearAlerts: (state) => {
      state.alerts = [];
    },
    
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  updateStats,
  addToHistory,
  clearHistory,
  setConnected,
  setError,
  addAlert,
  clearAlerts,
  clearError
} = systemSlice.actions;

export default systemSlice.reducer;