import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addSuggestion,
  removeSuggestion,
  updateSuggestion,
  setProcessing,
  setError,
  clearSuggestions,
  setStats
} from '../store/slices/aiSlice';

/**
 * Custom hook for AI functionality
 * Provides interface to AI engine for command analysis and suggestions
 */
export const useAI = () => {
  const dispatch = useDispatch();
  const suggestions = useSelector(state => state.ai.suggestions);
  const isProcessing = useSelector(state => state.ai.isProcessing);
  const error = useSelector(state => state.ai.error);
  const stats = useSelector(state => state.ai.stats);
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [context, setContext] = useState([]);

  // Check AI availability on mount
  useEffect(() => {
    checkAvailability();
    loadStats();
  }, []);

  // Load AI stats
  const loadStats = async () => {
    try {
      const result = await window.api.invoke('ai:stats');
      if (result.success) {
        dispatch(setStats(result));
      }
    } catch (err) {
      console.error('Failed to load AI stats:', err);
    }
  };

  /**
   * Check if AI service is available
   */
  const checkAvailability = async () => {
    try {
      const result = await window.api.invoke('ai:check');
      setIsAvailable(result.available);
      setModelInfo({
        provider: result.provider,
        model: result.model
      });
    } catch (err) {
      console.error('AI check failed:', err);
      setIsAvailable(false);
    }
  };

  /**
   * Analyze a command for errors and get suggestions
   */
  const analyzeCommand = useCallback(async (command, errorMsg = null, contextData = {}) => {
    try {
      dispatch(setProcessing(true));
      dispatch(setError(null));

      const result = await window.api.invoke('ai:analyze', {
        command,
        error: errorMsg,
        context: {
          ...contextData,
          history: context.slice(-5) // Last 5 commands for context
        }
      });

      if (result.success) {
        const suggestion = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ...result
        };
        
        dispatch(addSuggestion(suggestion));
        
        // Update context
        setContext(prev => [...prev, command].slice(-10));
        
        return suggestion;
      } else {
        dispatch(setError(result.error || 'Analysis failed'));
        return null;
      }
    } catch (err) {
      dispatch(setError(err.message));
      return null;
    } finally {
      dispatch(setProcessing(false));
    }
  }, [dispatch, context]);

  /**
   * Get suggestion for a specific error
   */
  const getSuggestion = useCallback(async (command, errorMsg) => {
    return analyzeCommand(command, errorMsg);
  }, [analyzeCommand]);

  /**
   * Convert natural language to command
   */
  const naturalLanguageToCommand = useCallback(async (input) => {
    try {
      dispatch(setProcessing(true));
      
      const result = await window.api.invoke('ai:naturalLanguage', { input });
      
      if (result.success) {
        return result.command;
      } else {
        dispatch(setError(result.error));
        return null;
      }
    } catch (err) {
      dispatch(setError(err.message));
      return null;
    } finally {
      dispatch(setProcessing(false));
    }
  }, [dispatch]);

  /**
   * Mark suggestion as used
   */
  const markSuggestionUsed = useCallback(async (suggestionId) => {
    try {
      await window.api.invoke('ai:markUsed', { suggestionId });
      
      // Update in store
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        dispatch(updateSuggestion({
          ...suggestion,
          usedCount: (suggestion.usedCount || 0) + 1
        }));
      }
    } catch (err) {
      console.error('Failed to mark suggestion used:', err);
    }
  }, [dispatch, suggestions]);

  /**
   * Provide feedback on suggestion
   */
  const provideFeedback = useCallback(async (suggestionId, rating) => {
    try {
      await window.api.invoke('ai:feedback', { suggestionId, rating });
      
      // Update in store
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        dispatch(updateSuggestion({
          ...suggestion,
          feedback: rating
        }));
      }
    } catch (err) {
      console.error('Failed to provide feedback:', err);
    }
  }, [dispatch, suggestions]);

  /**
   * Analyze system logs
   */
  const analyzeLogs = useCallback(async (logs, type = 'error') => {
    try {
      dispatch(setProcessing(true));
      
      const result = await window.api.invoke('ai:analyzeLogs', {
        logs,
        type
      });
      
      return result;
    } catch (err) {
      dispatch(setError(err.message));
      return null;
    } finally {
      dispatch(setProcessing(false));
    }
  }, [dispatch]);

  /**
   * Get popular commands for context
   */
  const getPopularCommands = useCallback(async (limit = 10) => {
    try {
      const result = await window.api.invoke('ai:popularCommands', { limit });
      return result.commands || [];
    } catch (err) {
      console.error('Failed to get popular commands:', err);
      return [];
    }
  }, []);

  /**
   * Train AI with successful command
   */
  const trainWithSuccess = useCallback(async (command, context = {}) => {
    try {
      await window.api.invoke('ai:train', {
        command,
        success: true,
        context
      });
    } catch (err) {
      console.error('Failed to train AI:', err);
    }
  }, []);

  /**
   * Clear all suggestions
   */
  const clearAllSuggestions = useCallback(() => {
    dispatch(clearSuggestions());
  }, [dispatch]);

  /**
   * Get suggestion by ID
   */
  const getSuggestionById = useCallback((id) => {
    return suggestions.find(s => s.id === id);
  }, [suggestions]);

  return {
    // State
    suggestions,
    isProcessing,
    error,
    isAvailable,
    modelInfo,
    stats,
    
    // Methods
    analyzeCommand,
    getSuggestion,
    naturalLanguageToCommand,
    markSuggestionUsed,
    provideFeedback,
    analyzeLogs,
    getPopularCommands,
    trainWithSuccess,
    clearSuggestions: clearAllSuggestions,
    getSuggestionById,
    
    // Refresh
    refreshStats: loadStats
  };
};