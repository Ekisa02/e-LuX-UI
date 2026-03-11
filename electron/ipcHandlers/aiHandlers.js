const { ipcMain } = require('electron');
const AIEngine = require('../../backend/services/AIEngine');
const log = require('electron-log');

/**
 * Register AI-related IPC handlers
 */
function registerAIHandlers() {
  
  // Check AI availability
  ipcMain.handle('ai:check', async () => {
    try {
      return {
        available: AIEngine.isAvailable,
        provider: AIEngine.config.provider,
        model: AIEngine.config.model
      };
    } catch (error) {
      log.error('AI check failed:', error);
      return { available: false, error: error.message };
    }
  });

  // Analyze command
  ipcMain.handle('ai:analyze', async (event, { command, error, context }) => {
    try {
      const result = await AIEngine.analyzeCommandError(command, error, context);
      return result;
    } catch (error) {
      log.error('AI analysis failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Natural language to command
  ipcMain.handle('ai:naturalLanguage', async (event, { input }) => {
    try {
      const command = await AIEngine.getCommandFromNaturalLanguage(input);
      return { success: true, command };
    } catch (error) {
      log.error('Natural language processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Mark suggestion as used
  ipcMain.handle('ai:markUsed', async (event, { suggestionId }) => {
    try {
      // This would update the database
      return { success: true };
    } catch (error) {
      log.error('Failed to mark suggestion used:', error);
      return { success: false, error: error.message };
    }
  });

  // Analyze logs
  ipcMain.handle('ai:analyzeLogs', async (event, { logs, type }) => {
    try {
      const analysis = await AIEngine.analyzeSystemLogs(logs, type);
      return { success: true, ...analysis };
    } catch (error) {
      log.error('Log analysis failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get popular commands
  ipcMain.handle('ai:popularCommands', async (event, { limit }) => {
    try {
      const commands = await AIEngine.getPopularCommands(limit);
      return { success: true, commands };
    } catch (error) {
      log.error('Failed to get popular commands:', error);
      return { success: false, error: error.message };
    }
  });

  // Get AI stats
  ipcMain.handle('ai:stats', async () => {
    try {
      const stats = {
        totalSuggestions: await AIEngine.getTotalSuggestions(),
        successRate: await AIEngine.getSuccessRate(),
        popularSuggestions: await AIEngine.getPopularSuggestions(5)
      };
      return { success: true, ...stats };
    } catch (error) {
      log.error('Failed to get AI stats:', error);
      return { success: false, error: error.message };
    }
  });

  log.info('AI IPC handlers registered');
}

module.exports = { registerAIHandlers };