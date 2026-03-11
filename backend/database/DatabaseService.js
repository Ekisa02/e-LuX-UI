const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;
const log = require('../utils/logger');

/**
 * Database Service
 * Manages SQLite database connections and operations
 */
class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = process.env.DB_PATH || path.join(__dirname, '../../../database/elux-ui.db');
  }

  /**
   * Initialize database connection
   */
  async initialize() {
    try {
      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      // Create database connection
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          log.error('Database connection failed:', err);
          throw err;
        }
        log.info(`Connected to database: ${this.dbPath}`);
      });

      // Enable foreign keys
      this.db.run('PRAGMA foreign_keys = ON');

      // Initialize schema
      await this.initializeSchema();

      return this.db;
    } catch (error) {
      log.error('Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize database schema
   */
  async initializeSchema() {
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    
    try {
      const schema = await fs.readFile(schemaPath, 'utf8');
      
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .filter(stmt => stmt.trim().length > 0);

      // Execute each statement
      for (const statement of statements) {
        await this.run(statement);
      }

      log.info('Database schema initialized');
      
    } catch (error) {
      log.error('Schema initialization failed:', error);
      throw error;
    }
  }

  /**
   * Run a query with parameters
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          log.error('Query error:', err, sql);
          reject(err);
        } else {
          resolve({
            lastID: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  /**
   * Get a single row
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          log.error('Query error:', err, sql);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Get multiple rows
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          log.error('Query error:', err, sql);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Execute multiple queries in transaction
   */
  transaction(queries) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.run('BEGIN TRANSACTION');
        
        for (const { sql, params } of queries) {
          await this.run(sql, params);
        }
        
        await this.run('COMMIT');
        resolve({ success: true });
      } catch (error) {
        await this.run('ROLLBACK');
        reject(error);
      }
    });
  }

  /**
   * Close database connection
   */
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          log.error('Error closing database:', err);
          reject(err);
        } else {
          log.info('Database connection closed');
          resolve();
        }
      });
    });
  }

  /**
   * Get database stats
   */
  async getStats() {
    const stats = {
      users: await this.get('SELECT COUNT(*) as count FROM users'),
      commands: await this.get('SELECT COUNT(*) as count FROM command_logs'),
      metrics: await this.get('SELECT COUNT(*) as count FROM system_metrics'),
      suggestions: await this.get('SELECT COUNT(*) as count FROM ai_suggestions')
    };

    return stats;
  }

  /**
   * Backup database
   */
  async backup(backupPath) {
    try {
      await this.run('VACUUM INTO ?', [backupPath]);
      log.info(`Database backed up to: ${backupPath}`);
      return { success: true, path: backupPath };
    } catch (error) {
      log.error('Backup failed:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new DatabaseService();
    }
    return instance;
  }
};