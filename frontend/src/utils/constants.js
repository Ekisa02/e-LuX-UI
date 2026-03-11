/**
 * Application Constants
 */
export const APP = {
  NAME: 'e-LuX-UI',
  VERSION: '1.0.0',
  DESCRIPTION: 'Enhanced Logic-driven Universal eXecution Interface'
};

/**
 * Terminal Constants
 */
export const TERMINAL = {
  DEFAULT_SHELL: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
  MAX_SESSIONS: 10,
  HISTORY_SIZE: 1000,
  BUFFER_SIZE: 10000,
  THEMES: {
    dark: {
      background: '#0c0c0c',
      foreground: '#00ff41',
      cursor: '#00ff41',
      selection: '#00ff4140',
      black: '#000000',
      red: '#ff0000',
      green: '#00ff41',
      yellow: '#ffff00',
      blue: '#0000ff',
      magenta: '#ff00ff',
      cyan: '#00ffff',
      white: '#ffffff'
    },
    light: {
      background: '#ffffff',
      foreground: '#000000',
      cursor: '#000000',
      selection: '#00000020',
      black: '#000000',
      red: '#ff0000',
      green: '#00ff00',
      yellow: '#ffff00',
      blue: '#0000ff',
      magenta: '#ff00ff',
      cyan: '#00ffff',
      white: '#ffffff'
    }
  }
};

/**
 * Monitoring Constants
 */
export const MONITORING = {
  INTERVALS: {
    CPU: 1000,
    MEMORY: 1000,
    DISK: 5000,
    NETWORK: 2000,
    PROCESSES: 2000
  },
  THRESHOLDS: {
    CPU_WARNING: 80,
    CPU_CRITICAL: 90,
    MEMORY_WARNING: 80,
    MEMORY_CRITICAL: 90,
    DISK_WARNING: 85,
    DISK_CRITICAL: 95,
    TEMP_WARNING: 70,
    TEMP_CRITICAL: 85
  },
  CHART_COLORS: {
    cpu: '#00ff41',
    memory: '#ffff00',
    disk: '#ff00ff',
    network_rx: '#00ffff',
    network_tx: '#ff00ff',
    alert: '#ff0000'
  }
};

/**
 * Network Constants
 */
export const NETWORK = {
  SUSPICIOUS_PORTS: [22, 23, 3389, 445, 1433, 3306, 5432, 27017],
  SUSPICIOUS_PORTS_NAMES: {
    22: 'SSH',
    23: 'Telnet',
    3389: 'RDP',
    445: 'SMB',
    1433: 'MSSQL',
    3306: 'MySQL',
    5432: 'PostgreSQL',
    27017: 'MongoDB'
  },
  PACKET_BUFFER_SIZE: 1000,
  ALERT_THRESHOLD: 100, // Packets per second
  PROTOCOLS: ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'DNS', 'DHCP'],
  COMMON_PORTS: {
    20: 'FTP Data',
    21: 'FTP Control',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    123: 'NTP',
    143: 'IMAP',
    443: 'HTTPS',
    993: 'IMAPS',
    995: 'POP3S',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    27017: 'MongoDB'
  }
};

/**
 * AI Constants
 */
export const AI = {
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
  MAX_SUGGESTIONS: 10,
  TEMPERATURE: 0.3,
  MAX_TOKENS: 500
};

/**
 * Voice Commands
 */
export const VOICE = {
  COMMANDS: {
    'show cpu': 'system:cpu',
    'show memory': 'system:memory',
    'show disk': 'system:disk',
    'show network': 'system:network',
    'open terminal': 'terminal:open',
    'clear terminal': 'terminal:clear',
    'new tab': 'terminal:new-tab',
    'close tab': 'terminal:close-tab',
    'start capture': 'network:start',
    'stop capture': 'network:stop',
    'show alerts': 'network:alerts',
    'stop listening': 'voice:stop',
    'help': 'voice:help'
  },
  LANGUAGES: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'],
  VOICES: ['default', 'female', 'male']
};

/**
 * Authentication Constants
 */
export const AUTH = {
  FACE_MATCH_THRESHOLD: 0.5,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest'
  }
};

/**
 * Database Constants
 */
export const DATABASE = {
  MAX_HISTORY_DAYS: 30,
  BATCH_SIZE: 100,
  BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  TABLES: {
    USERS: 'users',
    COMMAND_LOGS: 'command_logs',
    SYSTEM_METRICS: 'system_metrics',
    AI_SUGGESTIONS: 'ai_suggestions',
    NETWORK_METRICS: 'network_metrics',
    LOGIN_LOGS: 'login_logs'
  }
};

/**
 * UI Constants
 */
export const UI = {
  ANIMATION: {
    duration: 0.3,
    ease: 'easeInOut'
  },
  REFRESH_RATES: {
    fast: 100,
    normal: 1000,
    slow: 5000
  },
  CHART_COLORS: {
    primary: '#00ff41',
    secondary: '#ff00ff',
    tertiary: '#00ffff',
    warning: '#ffff00',
    danger: '#ff0000',
    info: '#00ffff',
    success: '#00ff41'
  },
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
};

/**
 * Error Codes
 */
export const ERRORS = {
  PERMISSION_DENIED: 'EACCES',
  NOT_FOUND: 'ENOENT',
  CONNECTION_REFUSED: 'ECONNREFUSED',
  TIMEOUT: 'ETIMEDOUT',
  INVALID_INPUT: 'EINVAL',
  NETWORK_ERROR: 'ENETUNREACH',
  AI_UNAVAILABLE: 'EAIUNAVAIL',
  FACE_NOT_DETECTED: 'EFACENOTFOUND',
  CAPTURE_FAILED: 'ECAPTUREFAILED'
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  THEME: 'elux_theme',
  TERMINAL_SETTINGS: 'elux_terminal',
  AI_PREFERENCES: 'elux_ai',
  AUTH_TOKEN: 'elux_auth',
  USER_PREFERENCES: 'elux_preferences'
};

/**
 * Event Names
 */
export const EVENTS = {
  TERMINAL: {
    OUTPUT: 'terminal:output',
    EXIT: 'terminal:exit',
    ERROR: 'terminal:error'
  },
  SYSTEM: {
    STATS: 'system:stats',
    ERROR: 'system:error'
  },
  NETWORK: {
    PACKET: 'network:packet',
    ALERT: 'network:alert',
    STATS: 'network:stats',
    ERROR: 'network:error'
  },
  AI: {
    SUGGESTION: 'ai:suggestion',
    ERROR: 'ai:error'
  },
  AUTH: {
    CHANGE: 'auth:change',
    ERROR: 'auth:error'
  },
  VOICE: {
    COMMAND: 'voice:command',
    TRANSCRIPT: 'voice:transcript',
    ERROR: 'voice:error'
  }
};