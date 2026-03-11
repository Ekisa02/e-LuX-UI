const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const log = require('../utils/logger');
const DatabaseService = require('../database/DatabaseService');

/**
 * Secure command execution service
 * Handles terminal process creation and management
 */
class CommandExecutor {
  constructor() {
    this.sessions = new Map(); // Store active terminal sessions
    this.db = DatabaseService.getInstance();
    this.shell = this.getDefaultShell();
  }

  /**
   * Get default shell based on platform
   */
  getDefaultShell() {
    const platform = os.platform();
    if (platform === 'win32') {
      return process.env.COMSPEC || 'cmd.exe';
    } else {
      return process.env.SHELL || '/bin/bash';
    }
  }

  /**
   * Create new terminal session
   */
  createSession(sessionId, options = {}) {
    try {
      log.info(`Creating terminal session: ${sessionId}`);
      
      const env = {
        ...process.env,
        TERM: 'xterm-256color',
        LANG: 'en_US.UTF-8',
        ...options.env
      };

      // Spawn shell process
      const shellProcess = spawn(this.shell, [], {
        env,
        cwd: options.cwd || os.homedir(),
        shell: true,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Store session
      const session = {
        id: sessionId,
        process: shellProcess,
        cwd: options.cwd || os.homedir(),
        created: new Date(),
        lastActivity: new Date()
      };

      this.sessions.set(sessionId, session);

      // Handle process output
      shellProcess.stdout.on('data', (data) => {
        this.handleOutput(sessionId, data.toString());
      });

      shellProcess.stderr.on('data', (data) => {
        this.handleOutput(sessionId, data.toString(), true);
      });

      // Handle process exit
      shellProcess.on('exit', (code) => {
        log.info(`Terminal session ${sessionId} exited with code ${code}`);
        this.sessions.delete(sessionId);
        this.handleExit(sessionId, code);
      });

      // Handle process error
      shellProcess.on('error', (error) => {
        log.error(`Terminal session ${sessionId} error:`, error);
        this.handleError(sessionId, error);
      });

      return {
        success: true,
        sessionId,
        pid: shellProcess.pid
      };

    } catch (error) {
      log.error('Failed to create terminal session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Write data to terminal session
   */
  writeToSession(sessionId, data) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    try {
      session.process.stdin.write(data);
      session.lastActivity = new Date();
      
      // Log command for AI analysis
      this.logCommand(sessionId, data);
      
      return { success: true };
    } catch (error) {
      log.error(`Failed to write to session ${sessionId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Resize terminal
   */
  resizeSession(sessionId, cols, rows) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    try {
      session.process.stdout.setCols?.(cols);
      session.process.stdout.setRows?.(rows);
      return { success: true };
    } catch (error) {
      log.error(`Failed to resize session ${sessionId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Kill terminal session
   */
  killSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    try {
      session.process.kill();
      this.sessions.delete(sessionId);
      return { success: true };
    } catch (error) {
      log.error(`Failed to kill session ${sessionId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle terminal output
   */
  handleOutput(sessionId, data, isError = false) {
    // This would be sent to renderer via IPC
    if (global.mainWindow) {
      global.mainWindow.webContents.send('terminal:output', {
        sessionId,
        data,
        isError,
        timestamp: new Date()
      });
    }
  }

  /**
   * Handle session exit
   */
  handleExit(sessionId, code) {
    if (global.mainWindow) {
      global.mainWindow.webContents.send('terminal:exit', {
        sessionId,
        code,
        timestamp: new Date()
      });
    }
  }

  /**
   * Handle session error
   */
  handleError(sessionId, error) {
    if (global.mainWindow) {
      global.mainWindow.webContents.send('terminal:error', {
        sessionId,
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  /**
   * Log command for AI analysis
   */
  async logCommand(sessionId, command) {
    try {
      // Remove trailing newline
      command = command.toString().trim();
      
      // Don't log empty commands
      if (!command || command.length === 0) {
        return;
      }

      // Log to database
      await this.db.run(`
        INSERT INTO command_logs (session_id, command, timestamp)
        VALUES (?, ?, ?)
      `, [sessionId, command, new Date().toISOString()]);

    } catch (error) {
      log.error('Failed to log command:', error);
    }
  }

  /**
   * Get active sessions
   */
  getActiveSessions() {
    const sessions = [];
    
    for (const [id, session] of this.sessions) {
      sessions.push({
        id,
        cwd: session.cwd,
        created: session.created,
        lastActivity: session.lastActivity,
        pid: session.process.pid
      });
    }
    
    return sessions;
  }
}

module.exports = new CommandExecutor();