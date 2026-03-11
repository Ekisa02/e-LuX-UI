import api from './api';

/**
 * Authentication Service
 * Handles authentication operations
 */
class AuthService {
  /**
   * Login with face
   */
  async login(imageData) {
    return api.request('auth:login', { imageData });
  }

  /**
   * Register new face
   */
  async register(imageData, username) {
    return api.request('auth:register', { imageData, username });
  }

  /**
   * Logout
   */
  async logout() {
    return api.request('auth:logout');
  }

  /**
   * Check authentication status
   */
  async getStatus() {
    return api.request('auth:status');
  }

  /**
   * Verify current user
   */
  async verify(imageData) {
    return api.request('auth:verify', { imageData });
  }

  /**
   * List registered users
   */
  async listUsers() {
    return api.request('auth:listUsers');
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    return api.request('auth:deleteUser', { userId });
  }

  /**
   * Update user role
   */
  async updateUserRole(userId, role) {
    return api.request('auth:updateRole', { userId, role });
  }

  /**
   * Get login history
   */
  async getLoginHistory(userId = null) {
    return api.request('auth:loginHistory', { userId });
  }

  /**
   * Subscribe to auth events
   */
  onAuthChange(callback) {
    return api.on('auth:change', callback);
  }

  onError(callback) {
    return api.on('auth:error', callback);
  }
}

export default new AuthService();