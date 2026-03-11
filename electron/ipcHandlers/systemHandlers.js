const { ipcMain } = require('electron');
const SystemMonitor = require('../../backend/services/SystemMonitor');
const log = require('electron-log');

/**
 * Register system monitoring IPC handlers
 */
function registerSystemHandlers() {
  const subscribers = new Map();

  // Start monitoring
  ipcMain.on('system:startMonitoring', (event, { interval }) => {
    try {
      const windowId = event.sender.id;
      
      // Start monitor if not already running
      if (!SystemMonitor.interval) {
        SystemMonitor.start(interval);
      }

      // Subscribe this window to updates
      const unsubscribe = SystemMonitor.subscribe((stats) => {
        event.sender.send('system:stats', stats);
      });

      subscribers.set(windowId, unsubscribe);
      log.info(`System monitoring started for window ${windowId}`);
      
    } catch (error) {
      log.error('Failed to start monitoring:', error);
      event.sender.send('system:error', { error: error.message });
    }
  });

  // Stop monitoring
  ipcMain.on('system:stopMonitoring', (event) => {
    try {
      const windowId = event.sender.id;
      
      // Unsubscribe this window
      if (subscribers.has(windowId)) {
        subscribers.get(windowId)();
        subscribers.delete(windowId);
      }

      // Stop monitor if no subscribers left
      if (subscribers.size === 0) {
        SystemMonitor.stop();
      }

      log.info(`System monitoring stopped for window ${windowId}`);
      
    } catch (error) {
      log.error('Failed to stop monitoring:', error);
    }
  });

  // Get single snapshot
  ipcMain.handle('system:getSnapshot', async () => {
    try {
      const stats = await SystemMonitor.getStats();
      return stats;
    } catch (error) {
      log.error('Failed to get snapshot:', error);
      throw error;
    }
  });

  // Get historical data
  ipcMain.handle('system:getHistory', async (event, { hours }) => {
    try {
      const history = await SystemMonitor.getHistoricalMetrics(hours);
      return history;
    } catch (error) {
      log.error('Failed to get history:', error);
      throw error;
    }
  });

  // Ping for connection check
  ipcMain.handle('system:ping', () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Clean up on window close
  ipcMain.on('window-closed', (event) => {
    const windowId = event.sender.id;
    if (subscribers.has(windowId)) {
      subscribers.get(windowId)();
      subscribers.delete(windowId);
    }
  });

  log.info('System monitoring IPC handlers registered');
}

module.exports = { registerSystemHandlers };