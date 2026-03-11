const DatabaseService = require('../DatabaseService');

class AISuggestionModel {
  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * Create suggestion entry
   */
  async create(suggestionData) {
    const {
      command, error_message, suggestion, confidence, user_id
    } = suggestionData;
    
    const result = await this.db.run(`
      INSERT INTO ai_suggestions 
      (command, error_message, suggestion, confidence, user_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [command, error_message, suggestion, confidence, user_id, new Date().toISOString()]);

    return {
      id: result.lastID,
      ...suggestionData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get suggestions for command
   */
  async getForCommand(command, limit = 5) {
    return this.db.all(`
      SELECT * FROM ai_suggestions 
      WHERE command LIKE ? 
      ORDER BY used_count DESC, confidence DESC 
      LIMIT ?
    `, [`%${command}%`, limit]);
  }

  /**
   * Mark suggestion as used
   */
  async markUsed(id) {
    return this.db.run(`
      UPDATE ai_suggestions 
      SET used_count = used_count + 1 
      WHERE id = ?
    `, [id]);
  }

  /**
   * Add user feedback
   */
  async addFeedback(id, rating) {
    return this.db.run(`
      UPDATE ai_suggestions 
      SET feedback_score = ? 
      WHERE id = ?
    `, [rating, id]);
  }

  /**
   * Get successful suggestions
   */
  async getSuccessful(limit = 20) {
    return this.db.all(`
      SELECT * FROM ai_suggestions 
      WHERE used_count > 0 
      ORDER BY used_count DESC, confidence DESC 
      LIMIT ?
    `, [limit]);
  }

  /**
   * Get suggestions by user
   */
  async getUserSuggestions(user_id, limit = 50) {
    return this.db.all(`
      SELECT * FROM ai_suggestions 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [user_id, limit]);
  }

  /**
   * Get suggestion stats
   */
  async getStats() {
    return this.db.get(`
      SELECT 
        COUNT(*) as total_suggestions,
        AVG(confidence) as avg_confidence,
        SUM(used_count) as total_used,
        AVG(feedback_score) as avg_feedback
      FROM ai_suggestions
    `);
  }
}

module.exports = new AISuggestionModel();