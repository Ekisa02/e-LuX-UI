import api from './api';

/**
 * Terminal Service
 * Handles terminal-related operations
 */
class TerminalService {
  /**
   * Create new terminal session
   */
  async createSession(options = {}) {
    return api.request('terminal:create', options);
  }

  /**
   * Write to terminal
   */
  async write(sessionId, data) {
    return api.request('terminal:write', { sessionId, data });
  }

  /**
   * Resize terminal
   */
  async resize(sessionId, cols, rows) {
    return api.request('terminal:resize', { sessionId, cols, rows });
  }

  /**
   * Kill terminal session
   */
  async kill(sessionId) {
    return api.request('terminal:kill', { sessionId });
  }

  /**
   * Get active sessions
   */
  async getSessions() {
    return api.request('terminal:sessions');
  }

  /**
   * Get command history
   */
  async getHistory(sessionId, limit = 50) {
    return api.request('terminal:history', { sessionId, limit });
  }

  /**
   * Execute command directly
   */
  async executeCommand(command, sessionId) {
    return this.write(sessionId, command + '\n');
  }

  /**
   * Subscribe to terminal output
   */
  onOutput(callback) {
    return api.on('terminal:output', callback);
  }

  /**
   * Subscribe to terminal exit events
   */
  onExit(callback) {
    return api.on('terminal:exit', callback);
  }

  /**
   * Subscribe to terminal errors
   */
  onError(callback) {
    return api.on('terminal:error', callback);
  }
}

export default new TerminalService();