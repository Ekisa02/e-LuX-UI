import api from './api';

/**
 * AI Service
 * Handles AI-related operations
 */
class AIService {
  /**
   * Check AI availability
   */
  async checkAvailability() {
    return api.request('ai:check');
  }

  /**
   * Analyze command error
   */
  async analyzeCommand(command, error = null, context = {}) {
    return api.request('ai:analyze', { command, error, context });
  }

  /**
   * Convert natural language to command
   */
  async naturalLanguageToCommand(input) {
    return api.request('ai:naturalLanguage', { input });
  }

  /**
   * Mark suggestion as used
   */
  async markSuggestionUsed(suggestionId) {
    return api.request('ai:markUsed', { suggestionId });
  }

  /**
   * Provide feedback on suggestion
   */
  async provideFeedback(suggestionId, rating) {
    return api.request('ai:feedback', { suggestionId, rating });
  }

  /**
   * Analyze system logs
   */
  async analyzeLogs(logs, type = 'error') {
    return api.request('ai:analyzeLogs', { logs, type });
  }

  /**
   * Get popular commands
   */
  async getPopularCommands(limit = 10) {
    return api.request('ai:popularCommands', { limit });
  }

  /**
   * Train AI with successful command
   */
  async trainWithSuccess(command, context = {}) {
    return api.request('ai:train', { command, context });
  }

  /**
   * Get AI stats
   */
  async getStats() {
    return api.request('ai:stats');
  }

  /**
   * Subscribe to AI events
   */
  onSuggestion(callback) {
    return api.on('ai:suggestion', callback);
  }

  onError(callback) {
    return api.on('ai:error', callback);
  }
}

export default new AIService();