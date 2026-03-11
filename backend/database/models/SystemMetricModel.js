const DatabaseService = require('../DatabaseService');

class SystemMetricModel {
  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * Create metric entry
   */
  async create(metricData) {
    const {
      cpu_usage, cpu_temp, memory_used, memory_total,
      disk_used, disk_total, network_rx, network_tx
    } = metricData;
    
    const result = await this.db.run(`
      INSERT INTO system_metrics 
      (timestamp, cpu_usage, cpu_temp, memory_used, memory_total, 
       disk_used, disk_total, network_rx, network_tx)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      new Date().toISOString(),
      cpu_usage,
      cpu_temp,
      memory_used,
      memory_total,
      disk_used,
      disk_total,
      network_rx,
      network_tx
    ]);

    return {
      id: result.lastID,
      ...metricData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get metrics for time range
   */
  async getMetrics(timeRange = '1h') {
    let interval;
    switch(timeRange) {
      case '1h':
        interval = "datetime('now', '-1 hour')";
        break;
      case '6h':
        interval = "datetime('now', '-6 hours')";
        break;
      case '24h':
        interval = "datetime('now', '-24 hours')";
        break;
      case '7d':
        interval = "datetime('now', '-7 days')";
        break;
      default:
        interval = "datetime('now', '-1 hour')";
    }

    return this.db.all(`
      SELECT * FROM system_metrics 
      WHERE timestamp >= ${interval}
      ORDER BY timestamp ASC
    `);
  }

  /**
   * Get latest metric
   */
  async getLatest() {
    return this.db.get(`
      SELECT * FROM system_metrics 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
  }

  /**
   * Get average metrics for period
   */
  async getAverages(period = '1h') {
    let interval;
    switch(period) {
      case '1h':
        interval = "datetime('now', '-1 hour')";
        break;
      case '24h':
        interval = "datetime('now', '-24 hours')";
        break;
      default:
        interval = "datetime('now', '-1 hour')";
    }

    return this.db.get(`
      SELECT 
        AVG(cpu_usage) as avg_cpu,
        AVG(cpu_temp) as avg_cpu_temp,
        AVG(memory_used) as avg_memory_used,
        AVG(memory_total) as avg_memory_total,
        AVG(disk_used) as avg_disk_used,
        AVG(disk_total) as avg_disk_total,
        AVG(network_rx) as avg_network_rx,
        AVG(network_tx) as avg_network_tx
      FROM system_metrics 
      WHERE timestamp >= ${interval}
    `);
  }

  /**
   * Delete old metrics
   */
  async cleanOldMetrics(days = 30) {
    const result = await this.db.run(`
      DELETE FROM system_metrics 
      WHERE timestamp < datetime('now', ?)
    `, [`-${days} days`]);

    return result.changes;
  }
}

module.exports = new SystemMetricModel();