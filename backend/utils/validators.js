/**
 * Input validation utilities
 */
class Validators {
  /**
   * Validate command input
   */
  static validateCommand(command) {
    if (!command || typeof command !== 'string') {
      return { valid: false, error: 'Command must be a string' };
    }

    if (command.length > 10000) {
      return { valid: false, error: 'Command too long' };
    }

    // Block dangerous commands
    const dangerous = ['rm -rf /', 'mkfs', 'dd if=', ':(){ :|:& };:'];
    if (dangerous.some(cmd => command.includes(cmd))) {
      return { valid: false, error: 'Dangerous command blocked' };
    }

    return { valid: true, command: command.trim() };
  }

  /**
   * Validate session ID
   */
  static validateSessionId(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      return { valid: false, error: 'Invalid session ID' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
      return { valid: false, error: 'Session ID contains invalid characters' };
    }

    return { valid: true };
  }

  /**
   * Validate username
   */
  static validateUsername(username) {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username required' };
    }

    if (username.length < 3 || username.length > 30) {
      return { valid: false, error: 'Username must be 3-30 characters' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    return { valid: true };
  }

  /**
   * Validate file path
   */
  static validatePath(path) {
    if (!path || typeof path !== 'string') {
      return { valid: false, error: 'Path required' };
    }

    // Block directory traversal
    if (path.includes('..') || path.includes('~')) {
      return { valid: false, error: 'Invalid path' };
    }

    return { valid: true, path };
  }

  /**
   * Validate network interface
   */
  static validateInterface(interface) {
    const validInterfaces = ['any', 'eth0', 'wlan0', 'en0', 'lo'];
    
    if (!validInterfaces.includes(interface)) {
      return { valid: false, error: 'Invalid network interface' };
    }

    return { valid: true };
  }

  /**
   * Validate port number
   */
  static validatePort(port) {
    const portNum = parseInt(port);
    
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return { valid: false, error: 'Port must be between 1 and 65535' };
    }

    return { valid: true, port: portNum };
  }

  /**
   * Validate email
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
  }

  /**
   * Sanitize input
   */
  static sanitize(input) {
    if (typeof input !== 'string') return input;
    
    // Remove control characters
    return input.replace(/[\x00-\x1F\x7F]/g, '');
  }
}

module.exports = Validators;