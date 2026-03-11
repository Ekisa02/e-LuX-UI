import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sessions: [],
  activeSession: null,
  outputs: {},
  history: []
};

const terminalSlice = createSlice({
  name: 'terminal',
  initialState,
  reducers: {
    addSession: (state, action) => {
      state.sessions.push(action.payload);
      state.outputs[action.payload.id] = [];
    },
    
    removeSession: (state, action) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
      delete state.outputs[action.payload];
      
      if (state.activeSession === action.payload) {
        state.activeSession = state.sessions[0]?.id || null;
      }
    },
    
    updateSession: (state, action) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = {
          ...state.sessions[index],
          ...action.payload
        };
      }
    },
    
    setActiveSession: (state, action) => {
      state.activeSession = action.payload;
    },
    
    addOutput: (state, action) => {
      const { sessionId, data, isError, timestamp } = action.payload;
      
      if (!state.outputs[sessionId]) {
        state.outputs[sessionId] = [];
      }
      
      state.outputs[sessionId].push({
        data,
        isError,
        timestamp
      });
      
      // Keep only last 1000 lines per session
      if (state.outputs[sessionId].length > 1000) {
        state.outputs[sessionId] = state.outputs[sessionId].slice(-1000);
      }
      
      // Add to command history if it's a command
      if (!isError && data.trim() && !data.includes('\n')) {
        state.history.unshift({
          command: data.trim(),
          sessionId,
          timestamp
        });
        
        // Keep only last 100 commands
        if (state.history.length > 100) {
          state.history.pop();
        }
      }
    },
    
    clearOutput: (state, action) => {
      const sessionId = action.payload;
      if (sessionId && state.outputs[sessionId]) {
        state.outputs[sessionId] = [];
      }
    },
    
    clearHistory: (state) => {
      state.history = [];
    }
  }
});

export const {
  addSession,
  removeSession,
  updateSession,
  setActiveSession,
  addOutput,
  clearOutput,
  clearHistory
} = terminalSlice.actions;

export default terminalSlice.reducer;