const DatabaseService = require('../DatabaseService');

class UserModel {
  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * Create new user
   */
  async create(userData) {
    const { username, face_descriptor, role = 'user' } = userData;
    
    const result = await this.db.run(`
      INSERT INTO users (username, face_descriptor, role, created_at)
      VALUES (?, ?, ?, ?)
    `, [username, JSON.stringify(face_descriptor), role, new Date().toISOString()]);

    return {
      id: result.lastID,
      username,
      role,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    return this.db.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  /**
   * Find user by username
   */
  async findByUsername(username) {
    return this.db.get('SELECT * FROM users WHERE username = ?', [username]);
  }

  /**
   * Update user
   */
  async update(id, updates) {
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'face_descriptor') {
        value = JSON.stringify(value);
      }
      fields.push(`${key} = ?`);
      values.push(value);
    });

    values.push(id);

    const result = await this.db.run(`
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `, values);

    return result.changes > 0;
  }

  /**
   * Delete user
   */
  async delete(id) {
    const result = await this.db.run('DELETE FROM users WHERE id = ?', [id]);
    return result.changes > 0;
  }

  /**
   * Get all users
   */
  async findAll() {
    return this.db.all('SELECT id, username, role, created_at FROM users');
  }

  /**
   * Update last login
   */
  async updateLastLogin(id) {
    return this.db.run(
      'UPDATE users SET last_login = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );
  }
}

module.exports = new UserModel();