import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addSession, 
  removeSession, 
  setActiveSession,
  addOutput,
  clearOutput,
  updateSession
} from '../store/slices/terminalSlice';

/**
 * Custom hook for terminal management
 * Provides interface to terminal IPC and state
 */
export const useTerminal = () => {
  const dispatch = useDispatch();
  const sessions = useSelector(state => state.terminal.sessions);
  const activeSession = useSelector(state => state.terminal.activeSession);
  const outputs = useSelector(state => state.terminal.outputs);
  
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await window.api.invoke('terminal:ping');
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setIsConnected(false);
        setError('Terminal service unavailable');
      }
    };

    checkConnection();
  }, []);

  // Subscribe to terminal events
  useEffect(() => {
    const handleOutput = (data) => {
      if (data.sessionId === activeSession) {
        dispatch(addOutput({
          sessionId: data.sessionId,
          data: data.data,
          isError: data.isError,
          timestamp: data.timestamp
        }));
      }
    };

    const handleExit = (data) => {
      dispatch(updateSession({
        id: data.sessionId,
        status: 'exited',
        exitCode: data.code
      }));
    };

    const handleError = (data) => {
      setError(data.error);
    };

    window.api.receive('terminal:output', handleOutput);
    window.api.receive('terminal:exit', handleExit);
    window.api.receive('terminal:error', handleError);

    return () => {
      window.api.removeListener('terminal:output', handleOutput);
      window.api.removeListener('terminal:exit', handleExit);
      window.api.removeListener('terminal:error', handleError);
    };
  }, [activeSession, dispatch]);

  /**
   * Create new terminal session
   */
  const createSession = useCallback(async (id = null, options = {}) => {
    try {
      const sessionId = id || `session_${Date.now()}`;
      
      const result = await window.api.invoke('terminal:create', {
        sessionId,
        ...options
      });

      if (result.success) {
        const session = {
          id: sessionId,
          pid: result.pid,
          created: new Date().toISOString(),
          status: 'running',
          cwd: options.cwd || process.cwd(),
          ...options
        };
        
        dispatch(addSession(session));
        dispatch(setActiveSession(sessionId));
        
        // Add to history
        setHistory(prev => [...prev, { type: 'session', action: 'create', sessionId }]);
        
        return { success: true, sessionId, session };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [dispatch]);

  /**
   * Write data to terminal session
   */
  const writeToSession = useCallback(async (sessionId, data) => {
    try {
      if (!sessionId) {
        throw new Error('No active session');
      }

      const result = await window.api.invoke('terminal:write', {
        sessionId,
        data
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Execute command directly
   */
  const executeCommand = useCallback(async (command, sessionId = null) => {
    const targetSession = sessionId || activeSession;
    
    if (!targetSession) {
      return { success: false, error: 'No active session' };
    }

    // Add newline to execute command
    return writeToSession(targetSession, command + '\n');
  }, [activeSession, writeToSession]);

  /**
   * Resize terminal session
   */
  const resizeSession = useCallback(async (sessionId, cols, rows) => {
    try {
      if (!sessionId) return;

      const result = await window.api.invoke('terminal:resize', {
        sessionId,
        cols,
        rows
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Kill terminal session
   */
  const killSession = useCallback(async (sessionId) => {
    try {
      const result = await window.api.invoke('terminal:kill', { sessionId });

      if (result.success) {
        dispatch(removeSession(sessionId));
        
        // If this was the active session, switch to another
        if (activeSession === sessionId && sessions.length > 1) {
          const nextSession = sessions.find(s => s.id !== sessionId);
          if (nextSession) {
            dispatch(setActiveSession(nextSession.id));
          }
        }

        setHistory(prev => [...prev, { type: 'session', action: 'kill', sessionId }]);

        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [dispatch, activeSession, sessions]);

  /**
   * Switch active session
   */
  const switchSession = useCallback((sessionId) => {
    dispatch(setActiveSession(sessionId));
  }, [dispatch]);

  /**
   * Clear terminal output
   */
  const clearTerminal = useCallback((sessionId = null) => {
    dispatch(clearOutput(sessionId || activeSession));
  }, [dispatch, activeSession]);

  /**
   * Get session output
   */
  const getSessionOutput = useCallback((sessionId) => {
    return outputs[sessionId] || [];
  }, [outputs]);

  /**
   * Get command history for session
   */
  const getCommandHistory = useCallback(async (sessionId, limit = 50) => {
    try {
      const result = await window.api.invoke('terminal:history', { sessionId, limit });
      return result.commands || [];
    } catch (err) {
      console.error('Failed to get command history:', err);
      return [];
    }
  }, []);

  /**
   * Rename session
   */
  const renameSession = useCallback((sessionId, name) => {
    dispatch(updateSession({ id: sessionId, name }));
  }, [dispatch]);

  return {
    // State
    sessions,
    activeSession,
    outputs,
    isConnected,
    error,
    history,
    
    // Methods
    createSession,
    writeToSession,
    executeCommand,
    resizeSession,
    killSession,
    switchSession,
    clearTerminal,
    getSessionOutput,
    getCommandHistory,
    renameSession
  };
};