module.exports = {
  // App information
  APP: {
    NAME: 'e-LuX-UI',
    VERSION: '1.0.0',
    DESCRIPTION: 'Enhanced Logic-driven Universal eXecution Interface'
  },

  // Terminal constants
  TERMINAL: {
    DEFAULT_SHELL: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
    MAX_SESSIONS: 10,
    HISTORY_SIZE: 1000,
    BUFFER_SIZE: 10000
  },

  // Monitoring intervals (ms)
  MONITORING: {
    CPU: 1000,
    MEMORY: 1000,
    DISK: 5000,
    NETWORK: 2000,
    PROCESSES: 2000
  },

  // Network constants
  NETWORK: {
    SUSPICIOUS_PORTS: [22, 23, 3389, 445, 1433, 3306, 5432, 27017],
    PACKET_BUFFER_SIZE: 1000,
    ALERT_THRESHOLD: 100, // Packets per second
    SUSPICIOUS_IPS: new Set([
      '0.0.0.0',
      '255.255.255.255'
    ])
  },

  // AI constants
  AI: {
    PROVIDERS: {
      OLLAMA: 'ollama',
      OPENAI: 'openai'
    },
    MODELS: {
      CODELLAMA: 'codellama',
      LLAMA2: 'llama2',
      MISTRAL: 'mistral',
      GPT4: 'gpt-4',
      GPT35: 'gpt-3.5-turbo'
    },
    CONFIDENCE_THRESHOLD: 0.5,
    MAX_SUGGESTIONS: 10
  },

  // Voice commands
  VOICE: {
    COMMANDS: {
      'show cpu': 'system:cpu',
      'show memory': 'system:memory',
      'show disk': 'system:disk',
      'show network': 'system:network',
      'open terminal': 'terminal:open',
      'clear terminal': 'terminal:clear',
      'new tab': 'terminal:new-tab',
      'start capture': 'network:start',
      'stop capture': 'network:stop'
    }
  },

  // Authentication
  AUTH: {
    FACE_MATCH_THRESHOLD: 0.5,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
  },

  // Database
  DATABASE: {
    MAX_HISTORY_DAYS: 30,
    BATCH_SIZE: 100,
    BACKUP_INTERVAL: 24 * 60 * 60 * 1000 // 24 hours
  },

  // UI constants
  UI: {
    CHART_COLORS: {
      cpu: '#00ff41',
      memory: '#ffff00',
      disk: '#ff00ff',
      network: '#00ffff',
      alert: '#ff0000'
    },
    ANIMATION: {
      duration: 0.3,
      ease: 'easeInOut'
    },
    REFRESH_RATES: {
      fast: 100,
      normal: 1000,
      slow: 5000
    }
  },

  // Error codes
  ERRORS: {
    PERMISSION_DENIED: 'EACCES',
    NOT_FOUND: 'ENOENT',
    CONNECTION_REFUSED: 'ECONNREFUSED',
    TIMEOUT: 'ETIMEDOUT',
    INVALID_INPUT: 'EINVAL'
  }
};