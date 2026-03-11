const logger = require('./logger');

/**
 * Centralized error handler
 */
class ErrorHandler {
  /**
   * Handle error based on type
   */
  static handle(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      context,
      timestamp: new Date().toISOString()
    };

    // Log error
    logger.error('Error occurred:', errorInfo);

    // Handle specific error types
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return this.handlePermissionError(error);
    }

    if (error.code === 'ENOENT') {
      return this.handleNotFoundError(error);
    }

    if (error.code === 'ECONNREFUSED') {
      return this.handleConnectionError(error);
    }

    if (error.name === 'ValidationError') {
      return this.handleValidationError(error);
    }

    // Default error response
    return {
      success: false,
      error: error.message,
      type: 'UnknownError',
      statusCode: 500
    };
  }

  /**
   * Handle permission errors
   */
  static handlePermissionError(error) {
    return {
      success: false,
      error: 'Permission denied. Try running with elevated privileges.',
      type: 'PermissionError',
      statusCode: 403,
      details: error.message
    };
  }

  /**
   * Handle not found errors
   */
  static handleNotFoundError(error) {
    return {
      success: false,
      error: `File or directory not found: ${error.path}`,
      type: 'NotFoundError',
      statusCode: 404,
      details: error.message
    };
  }

  /**
   * Handle connection errors
   */
  static handleConnectionError(error) {
    return {
      success: false,
      error: 'Failed to connect to service. Is it running?',
      type: 'ConnectionError',
      statusCode: 503,
      details: error.message
    };
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error) {
    return {
      success: false,
      error: 'Validation failed',
      type: 'ValidationError',
      statusCode: 400,
      details: error.errors || error.message
    };
  }

  /**
   * Create user-friendly error message
   */
  static getUserMessage(error) {
    const messages = {
      'Error: Command failed': 'Command execution failed',
      'Error: spawn ENOENT': 'Command not found',
      'Error: Permission denied': 'Permission denied',
      'Error: Connection refused': 'Connection refused',
      'Error: Network is unreachable': 'Network unreachable'
    };

    for (const [pattern, message] of Object.entries(messages)) {
      if (error.message.includes(pattern)) {
        return message;
      }
    }

    return 'An error occurred. Please try again.';
  }
}

module.exports = ErrorHandler;