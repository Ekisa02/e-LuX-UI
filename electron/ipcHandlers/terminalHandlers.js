const { ipcMain } = require('electron');
const CommandExecutor = require('../../backend/services/CommandExecutor');
const log = require('electron-log');

/**
 * Register terminal-related IPC handlers
 */
function registerTerminalHandlers() {
  
  // Create new terminal session
  ipcMain.handle('terminal:create', async (event, { sessionId, options }) => {
    try {
      const result = CommandExecutor.createSession(sessionId, options);
      
      // Set up output forwarding
      const sendOutput = (data, isError) => {
        event.sender.send('terminal:output', {
          sessionId,
          data,
          isError,
          timestamp: new Date().toISOString()
        });
      };

      // Store event sender for this session
      CommandExecutor.sessions.get(sessionId).sender = event.sender;
      
      return result;
    } catch (error) {
      log.error('Terminal creation failed:', error);
      return { success: false, error: error.message };
    }
  });

  // Write to terminal
  ipcMain.handle('terminal:write', async (event, { sessionId, data }) => {
    try {
      const result = CommandExecutor.writeToSession(sessionId, data);
      return result;
    } catch (error) {
      log.error('Terminal write failed:', error);
      return { success: false, error: error.message };
    }
  });

  // Resize terminal
  ipcMain.handle('terminal:resize', async (event, { sessionId, cols, rows }) => {
    try {
      const result = CommandExecutor.resizeSession(sessionId, cols, rows);
      return result;
    } catch (error) {
      log.error('Terminal resize failed:', error);
      return { success: false, error: error.message };
    }
  });

  // Kill terminal session
  ipcMain.handle('terminal:kill', async (event, { sessionId }) => {
    try {
      const result = CommandExecutor.killSession(sessionId);
      return result;
    } catch (error) {
      log.error('Terminal kill failed:', error);
      return { success: false, error: error.message };
    }
  });

  // Get active sessions
  ipcMain.handle('terminal:sessions', async () => {
    try {
      const sessions = CommandExecutor.getActiveSessions();
      return { success: true, sessions };
    } catch (error) {
      log.error('Failed to get sessions:', error);
      return { success: false, error: error.message };
    }
  });

  log.info('Terminal IPC handlers registered');
}

module.exports = { registerTerminalHandlers };