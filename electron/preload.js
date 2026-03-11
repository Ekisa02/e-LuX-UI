const { contextBridge, ipcRenderer } = require('electron');
const log = require('electron-log');

// Valid channels for IPC communication (whitelist)
const validChannels = [
  // Terminal channels
  'terminal:create',
  'terminal:write',
  'terminal:resize',
  'terminal:data',
  'terminal:exit',
  
  // System monitoring channels
  'system:getStats',
  'system:subscribe',
  'system:unsubscribe',
  
  // AI channels
  'ai:analyze',
  'ai:suggest',
  
  // Network channels
  'network:startCapture',
  'network:stopCapture',
  'network:getPackets',
  
  // Auth channels
  'auth:login',
  'auth:logout',
  'auth:verify',
  'auth:saveFace',
  
  // Voice channels
  'voice:command',
  
  // Database channels
  'db:query',
  'db:insert'
];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Send message to main process (one-way)
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      log.warn(`Blocked send on invalid channel: ${channel}`);
    }
  },
  
  // Send message and wait for response (two-way)
  invoke: (channel, data) => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    log.warn(`Blocked invoke on invalid channel: ${channel}`);
    return Promise.reject(new Error('Invalid channel'));
  },
  
  // Receive message from main process
  receive: (channel, func) => {
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    } else {
      log.warn(`Blocked receive on invalid channel: ${channel}`);
    }
  },
  
  // Remove listener
  removeListener: (channel, func) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
    }
  }
});

// Expose environment information
contextBridge.exposeInMainWorld('env', {
  isDev: process.env.NODE_ENV === 'development',
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Expose app information
contextBridge.exposeInMainWorld('app', {
  getPath: (name) => ipcRenderer.sendSync('app:getPath', name),
  getVersion: () => ipcRenderer.sendSync('app:getVersion')
});

// Log preload script loaded
log.info('Preload script loaded');