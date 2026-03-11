/**
 * API Service
 * Provides a unified interface for IPC communication
 */
class ApiService {
  constructor() {
    this.pendingRequests = new Map();
    this.requestId = 0;
  }

  /**
   * Send a request to the main process
   */
  async request(channel, data = {}) {
    return window.api.invoke(channel, data);
  }

  /**
   * Send a one-way message
   */
  send(channel, data = {}) {
    window.api.send(channel, data);
  }

  /**
   * Subscribe to events
   */
  on(channel, callback) {
    window.api.receive(channel, callback);
    return () => this.off(channel, callback);
  }

  /**
   * Unsubscribe from events
   */
  off(channel, callback) {
    window.api.removeListener(channel, callback);
  }

  /**
   * Make a request with timeout
   */
  async requestWithTimeout(channel, data = {}, timeout = 5000) {
    return Promise.race([
      this.request(channel, data),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }

  /**
   * Batch multiple requests
   */
  async batch(requests) {
    return this.request('api:batch', { requests });
  }

  /**
   * Get app version
   */
  async getVersion() {
    return window.app.getVersion();
  }

  /**
   * Get app path
   */
  getPath(name) {
    return window.app.getPath(name);
  }
}

export default new ApiService();