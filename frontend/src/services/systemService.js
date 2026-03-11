import api from './api';

/**
 * System Service
 * Handles system monitoring operations
 */
class SystemService {
  /**
   * Start monitoring
   */
  startMonitoring(interval = 1000) {
    api.send('system:startMonitoring', { interval });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    api.send('system:stopMonitoring');
  }

  /**
   * Get single snapshot
   */
  async getSnapshot() {
    return api.request('system:getSnapshot');
  }

  /**
   * Get historical data
   */
  async getHistory(hours = 24) {
    return api.request('system:getHistory', { hours });
  }

  /**
   * Get system info
   */
  async getSystemInfo() {
    return api.request('system:info');
  }

  /**
   * Get processes
   */
  async getProcesses() {
    return api.request('system:processes');
  }

  /**
   * Kill process
   */
  async killProcess(pid) {
    return api.request('system:killProcess', { pid });
  }

  /**
   * Export stats
   */
  async exportStats(format = 'csv') {
    return api.request('system:export', { format });
  }

  /**
   * Subscribe to stats updates
   */
  onStats(callback) {
    return api.on('system:stats', callback);
  }

  /**
   * Subscribe to system errors
   */
  onError(callback) {
    return api.on('system:error', callback);
  }
}

export default new SystemService();