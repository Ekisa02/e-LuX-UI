/**
 * Validation utilities
 */
export const validators = {
  /**
   * Validate command input
   */
  command: (command) => {
    if (!command || typeof command !== 'string') {
      return { valid: false, error: 'Command must be a string' };
    }

    if (command.length > 10000) {
      return { valid: false, error: 'Command too long (max 10000 characters)' };
    }

    // Block dangerous commands
    const dangerous = [
      'rm -rf /',
      'mkfs',
      'dd if=',
      ':(){ :|:& };:',
      'chmod -R 000 /',
      'chown -R nobody /',
      '> /dev/sda',
      'mv /* /dev/null'
    ];

    if (dangerous.some(cmd => command.includes(cmd))) {
      return { valid: false, error: 'Dangerous command blocked' };
    }

    return { valid: true, value: command.trim() };
  },

  /**
   * Validate username
   */
  username: (username) => {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username is required' };
    }

    if (username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }

    if (username.length > 30) {
      return { valid: false, error: 'Username cannot exceed 30 characters' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    return { valid: true, value: username.trim() };
  },

  /**
   * Validate email
   */
  email: (email) => {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    if (email.length > 254) {
      return { valid: false, error: 'Email too long' };
    }

    return { valid: true, value: email.trim().toLowerCase() };
  },

  /**
   * Validate IP address
   */
  ipAddress: (ip) => {
    if (!ip || typeof ip !== 'string') {
      return { valid: false, error: 'IP address is required' };
    }

    // IPv4
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    if (ipv4Regex.test(ip)) {
      return { valid: true, value: ip, type: 'IPv4' };
    }

    if (ipv6Regex.test(ip)) {
      return { valid: true, value: ip, type: 'IPv6' };
    }

    return { valid: false, error: 'Invalid IP address format' };
  },

  /**
   * Validate port number
   */
  port: (port) => {
    const portNum = parseInt(port);
    
    if (isNaN(portNum)) {
      return { valid: false, error: 'Port must be a number' };
    }

    if (portNum < 1 || portNum > 65535) {
      return { valid: false, error: 'Port must be between 1 and 65535' };
    }

    return { valid: true, value: portNum };
  },

  /**
   * Validate MAC address
   */
  macAddress: (mac) => {
    if (!mac || typeof mac !== 'string') {
      return { valid: false, error: 'MAC address is required' };
    }

    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    
    if (!macRegex.test(mac)) {
      return { valid: false, error: 'Invalid MAC address format (use XX:XX:XX:XX:XX:XX)' };
    }

    return { valid: true, value: mac.toUpperCase() };
  },

  /**
   * Validate file path
   */
  filePath: (path) => {
    if (!path || typeof path !== 'string') {
      return { valid: false, error: 'Path is required' };
    }

    // Block directory traversal
    if (path.includes('..') || path.includes('~')) {
      return { valid: false, error: 'Invalid path (directory traversal blocked)' };
    }

    // Check for invalid characters
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(path)) {
      return { valid: false, error: 'Path contains invalid characters' };
    }

    return { valid: true, value: path.trim() };
  },

  /**
   * Validate URL
   */
  url: (url) => {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL is required' };
    }

    try {
      new URL(url);
      return { valid: true, value: url };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  },

  /**
   * Validate hex color
   */
  hexColor: (color) => {
    if (!color || typeof color !== 'string') {
      return { valid: false, error: 'Color is required' };
    }

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    if (!hexRegex.test(color)) {
      return { valid: false, error: 'Invalid hex color format (use #RRGGBB or #RGB)' };
    }

    return { valid: true, value: color };
  },

  /**
   * Validate JSON string
   */
  json: (jsonString) => {
    if (!jsonString || typeof jsonString !== 'string') {
      return { valid: false, error: 'JSON string is required' };
    }

    try {
      const parsed = JSON.parse(jsonString);
      return { valid: true, value: parsed };
    } catch {
      return { valid: false, error: 'Invalid JSON format' };
    }
  },

  /**
   * Validate base64 string
   */
  base64: (base64String) => {
    if (!base64String || typeof base64String !== 'string') {
      return { valid: false, error: 'Base64 string is required' };
    }

    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    
    if (!base64Regex.test(base64String)) {
      return { valid: false, error: 'Invalid base64 format' };
    }

    return { valid: true, value: base64String };
  },

  /**
   * Validate password strength
   */
  password: (password, options = {}) => {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecial = true
    } = options;

    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' };
    }

    const errors = [];

    if (password.length < minLength) {
      errors.push(`Must be at least ${minLength} characters`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Must contain at least one uppercase letter');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Must contain at least one lowercase letter');
    }

    if (requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Must contain at least one number');
    }

    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Must contain at least one special character');
    }

    if (errors.length > 0) {
      return { valid: false, error: errors.join(', ') };
    }

    return { valid: true, value: password };
  },

  /**
   * Validate range
   */
  range: (value, min, max) => {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return { valid: false, error: 'Value must be a number' };
    }

    if (num < min || num > max) {
      return { valid: false, error: `Value must be between ${min} and ${max}` };
    }

    return { valid: true, value: num };
  },

  /**
   * Sanitize input
   */
  sanitize: (input) => {
    if (typeof input !== 'string') return input;
    
    // Remove control characters
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Escape HTML
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    return sanitized;
  }
};