const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const log = require('electron-log');
const { initIpcHandlers } = require('./ipcHandlers');
const { createMenu } = require('./menu');

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Global reference to main window
let mainWindow = null;

// Get environment
const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';

/**
 * Create the main application window
 */
function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    show: false, // Don't show until ready-to-show
    backgroundColor: '#0c0c0c',
    webPreferences: {
      nodeIntegration: false, // Security: disable node integration
      contextIsolation: true, // Security: enable context isolation
      preload: path.join(__dirname, 'preload.js'), // Preload script for secure bridge
      sandbox: true // Additional security
    },
    icon: path.join(__dirname, '../resources/icon.icns'),
    frame: true,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    vibrancy: isMac ? 'dark' : null
  });

  // Load the app
  if (isDev) {
    // In development, load from webpack dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from file
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle navigation events (prevent external navigation)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost:3000')) {
      event.preventDefault();
      log.warn(`Blocked navigation to: ${url}`);
    }
  });

  // Handle new window creation (prevent popups)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    log.warn(`Blocked new window for: ${url}`);
    return { action: 'deny' };
  });

  return mainWindow;
}

/**
 * App event handlers
 */
app.whenReady().then(() => {
  log.info('Application starting...');
  
  // Initialize IPC handlers
  initIpcHandlers();
  
  // Create main window
  createMainWindow();
  
  // Set application menu
  Menu.setApplicationMenu(createMenu());
  
  // On macOS, recreate window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// Security: Prevent new renderer processes
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    log.warn(`Blocked new window for: ${navigationUrl}`);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  log.error('Unhandled Rejection:', error);
});

// Export for testing
module.exports = { createMainWindow };