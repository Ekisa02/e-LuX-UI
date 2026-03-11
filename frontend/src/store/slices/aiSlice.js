import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  suggestions: [],
  isProcessing: false,
  error: null,
  stats: {
    totalSuggestions: 0,
    usedSuggestions: 0,
    averageConfidence: 0,
    successRate: 0,
    popularSuggestions: []
  },
  preferences: {
    autoAnalyze: true,
    showConfidence: true,
    maxSuggestions: 10
  }
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addSuggestion: (state, action) => {
      state.suggestions.unshift(action.payload);
      state.stats.totalSuggestions++;
      
      // Keep only last 50 suggestions
      if (state.suggestions.length > 50) {
        state.suggestions.pop();
      }
      
      // Update average confidence
      const totalConfidence = state.suggestions.reduce(
        (sum, s) => sum + (s.confidence || 0), 0
      );
      state.stats.averageConfidence = totalConfidence / state.suggestions.length;
    },
    
    removeSuggestion: (state, action) => {
      state.suggestions = state.suggestions.filter(
        s => s.id !== action.payload
      );
    },
    
    updateSuggestion: (state, action) => {
      const index = state.suggestions.findIndex(
        s => s.id === action.payload.id
      );
      if (index !== -1) {
        const oldSuggestion = state.suggestions[index];
        state.suggestions[index] = action.payload;
        
        // Update used count
        if (action.payload.usedCount > (oldSuggestion.usedCount || 0)) {
          state.stats.usedSuggestions++;
        }
      }
    },
    
    setProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearSuggestions: (state) => {
      state.suggestions = [];
      state.stats.totalSuggestions = 0;
      state.stats.usedSuggestions = 0;
      state.stats.averageConfidence = 0;
    },
    
    setStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...action.payload
      };
    },
    
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload
      };
    },
    
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  addSuggestion,
  removeSuggestion,
  updateSuggestion,
  setProcessing,
  setError,
  clearSuggestions,
  setStats,
  updatePreferences,
  clearError
} = aiSlice.actions;

export default aiSlice.reducer;