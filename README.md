# e-LuX-UI (Enhanced Logic-driven Universal eXecution Interface)

An AI-powered system command center with biometric authentication, voice commands, and real-time monitoring.

## Features

- 🖥️ **Multi-tab Terminal** with xterm.js
- 📊 **Real-time System Monitoring** (CPU, RAM, Disk, Network)
- 🤖 **AI Command Assistant** with Ollama/OpenAI integration
- 👤 **Biometric Login** with face-api.js
- 🎤 **Voice Command Control** using Web Speech API
- 🌐 **Network Traffic Monitoring** with node-pcap
- 🎨 **Cyberpunk-styled UI** with Framer Motion animations

## Tech Stack

- **Desktop Framework**: Electron.js
- **Frontend**: React.js, Redux Toolkit, TailwindCSS
- **Monitoring**: systeminformation, node-pcap
- **AI**: Ollama/OpenAI API
- **Authentication**: face-api.js
- **Database**: SQLite3

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/elux-ui.git
cd elux-ui

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build
npm run dist

```
## Project Structure
elux-ui/
├── electron/          # Electron main process
├── backend/           # Core services
├── frontend/          # React application
├── ai/               # AI models and prompts
├── database/         # Database schemas
└── resources/        # Application resources

## Configuration
- **Create .env file**:
```bash
# AI Configuration
AI_PROVIDER=ollama
AI_MODEL=codellama
OLLAMA_URL=http://localhost:11434

# Database
DB_PATH=./database/elux-ui.db
```
## License
# MIT
```bash

---

### Electron Directory Files

#### `/electron/menu.js`
```javascript
const { Menu, shell, app } = require('electron');
const log = require('electron-log');

/**
 * Create application menu
 */
function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Terminal Tab',
          accelerator: 'CmdOrCtrl+T',
          click: (menuItem, browserWindow) => {
            browserWindow.webContents.send('menu:new-tab');
          }
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: (menuItem, browserWindow) => {
            browserWindow.webContents.send('menu:close-tab');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },

    // Terminal menu
    {
      label: 'Terminal',
      submenu: [
        {
          label: 'Clear Terminal',
          accelerator: 'CmdOrCtrl+K',
          click: (menuItem, browserWindow) => {
            browserWindow.webContents.send('terminal:clear');
          }
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          click: (menuItem, browserWindow) => {
            browserWindow.webContents.send('terminal:copy');
          }
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          click: (menuItem, browserWindow) => {
            browserWindow.webContents.send('terminal:paste');
          }
        },
        { type: 'separator' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          click: (menuItem, browserWindow) => {
            browserWindow.webContents.send('terminal:select-all');
          }
        }
      ]
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },

    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/yourusername/elux-ui');
          }
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/yourusername/elux-ui/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  return menu;
}

module.exports = { createMenu };



# e-LuX-UI
