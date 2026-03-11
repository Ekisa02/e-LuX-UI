const si = require('systeminformation');
const EventEmitter = require('events');
const log = require('../utils/logger');
const DatabaseService = require('../database/DatabaseService');

/**
 * System Monitoring Service
 * Provides real-time system metrics using systeminformation library
 */
class SystemMonitor extends EventEmitter {
  constructor() {
    super();
    this.interval = null;
    this.updateInterval = 1000; // 1 second
    this.db = DatabaseService.getInstance();
    this.cachedStats = null;
    this.subscribers = new Set();
  }

  /**
   * Start monitoring
   */
  start(interval = 1000) {
    if (this.interval) {
      this.stop();
    }

    this.updateInterval = interval;
    log.info(`Starting system monitoring (interval: ${interval}ms)`);

    this.interval = setInterval(async () => {
      try {
        const stats = await this.getStats();
        this.cachedStats = stats;
        
        // Emit to all subscribers
        this.emit('stats', stats);
        
        // Store in database
        await this.storeMetrics(stats);
        
      } catch (error) {
        log.error('System monitoring error:', error);
        this.emit('error', error);
      }
    }, this.updateInterval);

    return this;
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      log.info('System monitoring stopped');
    }
  }

  /**
   * Get current system stats
   */
  async getStats() {
    try {
      const [cpu, mem, disk, network, osInfo, processLoad] = await Promise.all([
        this.getCPUStats(),
        this.getMemoryStats(),
        this.getDiskStats(),
        this.getNetworkStats(),
        this.getOSInfo(),
        si.currentLoad()
      ]);

      const stats = {
        timestamp: new Date().toISOString(),
        cpu,
        memory: mem,
        disk,
        network,
        os: osInfo,
        processes: {
          total: processLoad.currentLoad,
          running: processLoad.running
        }
      };

      return stats;
    } catch (error) {
      log.error('Failed to get system stats:', error);
      throw error;
    }
  }

  /**
   * Get CPU statistics
   */
  async getCPUStats() {
    const [cpu, cpuSpeed, cpuTemp] = await Promise.all([
      si.cpu(),
      si.cpuCurrentSpeed(),
      si.cpuTemperature()
    ]);

    return {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
      speed: cpuSpeed.avg,
      minSpeed: cpuSpeed.min,
      maxSpeed: cpuSpeed.max,
      temperature: cpuTemp.main || 0,
      usage: await this.getCPUUsage()
    };
  }

  /**
   * Get CPU usage per core
   */
  async getCPUUsage() {
    const load = await si.currentLoad();
    return {
      average: load.currentLoad,
      perCore: load.cpus.map(cpu => cpu.load)
    };
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats() {
    const mem = await si.mem();
    
    return {
      total: mem.total,
      free: mem.free,
      used: mem.used,
      active: mem.active,
      available: mem.available,
      swapTotal: mem.swaptotal,
      swapUsed: mem.swapused,
      swapFree: mem.swapfree,
      usagePercentage: (mem.used / mem.total) * 100
    };
  }

  /**
   * Get disk statistics
   */
  async getDiskStats() {
    const disks = await si.fsSize();
    
    return disks.map(disk => ({
      fs: disk.fs,
      type: disk.type,
      size: disk.size,
      used: disk.used,
      available: disk.available,
      use: disk.use,
      mount: disk.mount
    }));
  }

  /**
   * Get network statistics
   */
  async getNetworkStats() {
    const [interfaces, stats] = await Promise.all([
      si.networkInterfaces(),
      si.networkStats()
    ]);

    return {
      interfaces: interfaces.map(iface => ({
        name: iface.iface,
        ip4: iface.ip4,
        ip6: iface.ip6,
        mac: iface.mac,
        type: iface.type,
        speed: iface.speed
      })),
      stats: stats.map(stat => ({
        iface: stat.iface,
        rxBytes: stat.rx_bytes,
        txBytes: stat.tx_bytes,
        rxSec: stat.rx_sec,
        txSec: stat.tx_sec,
        rxErrors: stat.rx_errors,
        txErrors: stat.tx_errors,
        rxDropped: stat.rx_dropped,
        txDropped: stat.tx_dropped
      }))
    };
  }

  /**
   * Get OS information
   */
  async getOSInfo() {
    const [os, system] = await Promise.all([
      si.osInfo(),
      si.system()
    ]);

    return {
      platform: os.platform,
      distro: os.distro,
      release: os.release,
      kernel: os.kernel,
      arch: os.arch,
      hostname: os.hostname,
      uptime: os.uptime,
      manufacturer: system.manufacturer,
      model: system.model,
      version: system.version
    };
  }

  /**
   * Get cached stats (no new request)
   */
  getCachedStats() {
    return this.cachedStats;
  }

  /**
   * Subscribe to updates
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    this.on('stats', callback);
    
    return () => {
      this.subscribers.delete(callback);
      this.off('stats', callback);
    };
  }

  /**
   * Store metrics in database
   */
  async storeMetrics(stats) {
    try {
      await this.db.run(`
        INSERT INTO system_metrics (
          timestamp, cpu_usage, cpu_temp, memory_used, 
          memory_total, disk_used, disk_total, network_rx, network_tx
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        stats.timestamp,
        stats.cpu.usage.average,
        stats.cpu.temperature,
        stats.memory.used,
        stats.memory.total,
        stats.disk[0]?.used || 0,
        stats.disk[0]?.size || 0,
        stats.network.stats[0]?.rxSec || 0,
        stats.network.stats[0]?.txSec || 0
      ]);
    } catch (error) {
      log.error('Failed to store metrics:', error);
    }
  }

  /**
   * Get historical metrics
   */
  async getHistoricalMetrics(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    return this.db.all(`
      SELECT * FROM system_metrics 
      WHERE timestamp >= ? 
      ORDER BY timestamp DESC
    `, [cutoff]);
  }
}

module.exports = new SystemMonitor();