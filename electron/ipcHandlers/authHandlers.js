const { ipcMain } = require('electron');
const AuthService = require('../../backend/services/AuthService');
const log = require('electron-log');

/**
 * Register authentication IPC handlers
 */
function registerAuthHandlers() {
  
  // Login with face
  ipcMain.handle('auth:login', async (event, { imageData }) => {
    try {
      const result = await AuthService.authenticateFace(imageData);
      return result;
    } catch (error) {
      log.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  });

  // Register new face
  ipcMain.handle('auth:register', async (event, { imageData, username }) => {
    try {
      const result = await AuthService.registerFace(imageData, username);
      return result;
    } catch (error) {
      log.error('Registration failed:', error);
      return { success: false, error: error.message };
    }
  });

  // Logout
  ipcMain.handle('auth:logout', async () => {
    try {
      await AuthService.logout();
      return { success: true };
    } catch (error) {
      log.error('Logout failed:', error);
      return { success: false, error: error.message };
    }
  });

  // Check authentication status
  ipcMain.handle('auth:status', async () => {
    try {
      const status = await AuthService.getStatus();
      return { success: true, ...status };
    } catch (error) {
      log.error('Failed to get auth status:', error);
      return { success: false, error: error.message };
    }
  });

  // Verify current user
  ipcMain.handle('auth:verify', async (event, { imageData }) => {
    try {
      const verified = await AuthService.verifyFace(imageData);
      return { success: true, verified };
    } catch (error) {
      log.error('Verification failed:', error);
      return { success: false, error: error.message };
    }
  });

  log.info('Auth IPC handlers registered');
}

module.exports = { registerAuthHandlers };