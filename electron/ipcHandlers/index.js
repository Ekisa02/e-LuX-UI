const { ipcMain } = require('electron');
const { registerTerminalHandlers } = require('./terminalHandlers');
const { registerSystemHandlers } = require('./systemHandlers');
const { registerAIHandlers } = require('./aiHandlers');
const { registerAuthHandlers } = require('./authHandlers');
const log = require('electron-log');

/**
 * Initialize all IPC handlers
 */
function initIpcHandlers() {
  log.info('Initializing IPC handlers...');
  
  // Register all handler groups
  registerTerminalHandlers();
  registerSystemHandlers();
  registerAIHandlers();
  registerAuthHandlers();
  
  // Generic handlers
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });
  
  ipcMain.on('app:getPath', (event, name) => {
    event.returnValue = app.getPath(name);
  });
  
  // Error handling wrapper for all handlers
  ipcMain.on('*', (event, ...args) => {
    log.debug('IPC received:', event.type, args);
  });
  
  log.info('IPC handlers initialized successfully');
}

module.exports = { initIpcHandlers };