const DatabaseService = require('../DatabaseService');

class CommandLogModel {
  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * Create command log entry
   */
  async create(logData) {
    const { session_id, command, directory, exit_code, user_id } = logData;
    
    const result = await this.db.run(`
      INSERT INTO command_logs 
      (session_id, command, directory, exit_code, user_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [session_id, command, directory, exit_code, user_id, new Date().toISOString()]);

    return {
      id: result.lastID,
      ...logData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get command history for session
   */
  async getSessionHistory(session_id, limit = 100) {
    return this.db.all(`
      SELECT * FROM command_logs 
      WHERE session_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [session_id, limit]);
  }

  /**
   * Get recent commands
   */
  async getRecent(limit = 50) {
    return this.db.all(`
      SELECT * FROM command_logs 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [limit]);
  }

  /**
   * Get failed commands (exit_code != 0)
   */
  async getFailedCommands(limit = 50) {
    return this.db.all(`
      SELECT * FROM command_logs 
      WHERE exit_code != 0 AND exit_code IS NOT NULL
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [limit]);
  }

  /**
   * Get popular commands
   */
  async getPopularCommands(limit = 20) {
    return this.db.all(`
      SELECT command, COUNT(*) as count, 
             AVG(CASE WHEN exit_code = 0 THEN 1 ELSE 0 END) as success_rate
      FROM command_logs 
      GROUP BY command 
      ORDER BY count DESC 
      LIMIT ?
    `, [limit]);
  }

  /**
   * Get command stats by user
   */
  async getUserStats(user_id) {
    return this.db.get(`
      SELECT 
        COUNT(*) as total_commands,
        SUM(CASE WHEN exit_code = 0 THEN 1 ELSE 0 END) as successful_commands,
        COUNT(DISTINCT command) as unique_commands,
        MAX(timestamp) as last_command_time
      FROM command_logs 
      WHERE user_id = ?
    `, [user_id]);
  }
}

module.exports = new CommandLogModel();