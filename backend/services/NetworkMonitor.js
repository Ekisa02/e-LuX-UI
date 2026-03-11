const pcap = require('node-pcap');
const EventEmitter = require('events');
const log = require('../utils/logger');
const DatabaseService = require('../database/DatabaseService');

/**
 * Network Monitoring Service
 * Captures and analyzes network traffic using node-pcap
 */
class NetworkMonitor extends EventEmitter {
  constructor() {
    super();
    this.session = null;
    this.packets = [];
    this.filter = '';
    this.isCapturing = false;
    this.db = DatabaseService.getInstance();
    this.stats = {
      totalPackets: 0,
      totalBytes: 0,
      startTime: null,
      protocols: {},
      suspiciousIPs: new Map()
    };
  }

  /**
   * Start packet capture
   */
  startCapture(interface = 'any', filter = '') {
    try {
      if (this.isCapturing) {
        this.stopCapture();
      }

      log.info(`Starting packet capture on ${interface} with filter: ${filter}`);

      // Create pcap session
      this.session = pcap.createSession(interface, filter);
      this.filter = filter;
      this.isCapturing = true;
      this.stats.startTime = new Date();

      // Handle incoming packets
      this.session.on('packet', (rawPacket) => {
        try {
          const packet = pcap.decode.packet(rawPacket);
          this.processPacket(packet);
        } catch (error) {
          log.error('Packet decoding error:', error);
        }
      });

      // Handle errors
      this.session.on('error', (error) => {
        log.error('Pcap session error:', error);
        this.emit('error', error);
      });

      // Emit start event
      this.emit('started', { interface, filter });

      return { success: true, interface, filter };

    } catch (error) {
      log.error('Failed to start capture:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop packet capture
   */
  stopCapture() {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    
    this.isCapturing = false;
    
    // Emit final stats
    this.emit('stopped', this.getStats());
    
    log.info('Packet capture stopped');
    return { success: true };
  }

  /**
   * Process captured packet
   */
  processPacket(packet) {
    try {
      // Update stats
      this.stats.totalPackets++;
      this.stats.totalBytes += packet.length || 0;

      // Extract packet info
      const packetInfo = this.extractPacketInfo(packet);
      
      // Check for suspicious activity
      this.checkSuspicious(packetInfo);

      // Store in buffer (keep last 1000 packets)
      this.packets.unshift(packetInfo);
      if (this.packets.length > 1000) {
        this.packets.pop();
      }

      // Emit packet
      this.emit('packet', packetInfo);

      // Batch insert to database every 100 packets
      if (this.stats.totalPackets % 100 === 0) {
        this.storeBatch();
      }

    } catch (error) {
      log.error('Packet processing error:', error);
    }
  }

  /**
   * Extract relevant packet information
   */
  extractPacketInfo(packet) {
    const info = {
      timestamp: new Date().toISOString(),
      length: packet.length,
      protocol: 'unknown',
      src: {},
      dst: {},
      details: {}
    };

    try {
      // Ethernet
      if (packet.payload && packet.payload.constructor.name === 'Ethernet') {
        const eth = packet.payload;
        
        // IPv4
        if (eth.payload && eth.payload.constructor.name === 'IPv4') {
          const ip = eth.payload;
          info.protocol = 'IPv4';
          info.src.ip = ip.saddr;
          info.dst.ip = ip.daddr;
          info.ttl = ip.ttl;

          // TCP
          if (ip.payload && ip.payload.constructor.name === 'TCP') {
            const tcp = ip.payload;
            info.protocol = 'TCP';
            info.src.port = tcp.sport;
            info.dst.port = tcp.dport;
            info.flags = {
              syn: tcp.flags.syn,
              ack: tcp.flags.ack,
              fin: tcp.flags.fin,
              rst: tcp.flags.rst
            };
            
            // Update protocol stats
            this.stats.protocols.tcp = (this.stats.protocols.tcp || 0) + 1;
          }

          // UDP
          if (ip.payload && ip.payload.constructor.name === 'UDP') {
            const udp = ip.payload;
            info.protocol = 'UDP';
            info.src.port = udp.sport;
            info.dst.port = udp.dport;
            
            this.stats.protocols.udp = (this.stats.protocols.udp || 0) + 1;
          }

          // ICMP
          if (ip.payload && ip.payload.constructor.name === 'ICMP') {
            info.protocol = 'ICMP';
            this.stats.protocols.icmp = (this.stats.protocols.icmp || 0) + 1;
          }
        }
      }
    } catch (error) {
      log.debug('Packet extraction error:', error);
    }

    return info;
  }

  /**
   * Check for suspicious activity
   */
  checkSuspicious(packet) {
    const suspicious = [];

    // Port scanning detection (many packets to different ports)
    if (packet.dst && packet.dst.port) {
      const key = `${packet.src.ip}:${packet.dst.ip}`;
      const count = this.stats.suspiciousIPs.get(key) || 0;
      this.stats.suspiciousIPs.set(key, count + 1);

      if (count > 100) { // More than 100 packets to same destination
        suspicious.push({
          type: 'POSSIBLE_PORT_SCAN',
          source: packet.src.ip,
          target: packet.dst.ip,
          packets: count
        });
      }
    }

    // Suspicious ports
    const suspiciousPorts = [22, 23, 3389, 445, 1433, 3306];
    if (packet.dst && suspiciousPorts.includes(packet.dst.port)) {
      suspicious.push({
        type: 'SUSPICIOUS_PORT',
        source: packet.src.ip,
        target: `${packet.dst.ip}:${packet.dst.port}`,
        port: packet.dst.port
      });
    }

    if (suspicious.length > 0) {
      this.emit('suspicious', suspicious);
    }
  }

  /**
   * Store batch of packets in database
   */
  async storeBatch() {
    try {
      // Store summary stats
      await this.db.run(`
        INSERT INTO network_metrics 
        (timestamp, total_packets, total_bytes, tcp_packets, udp_packets, icmp_packets)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        new Date().toISOString(),
        this.stats.totalPackets,
        this.stats.totalBytes,
        this.stats.protocols.tcp || 0,
        this.stats.protocols.udp || 0,
        this.stats.protocols.icmp || 0
      ]);

    } catch (error) {
      log.error('Failed to store network metrics:', error);
    }
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      ...this.stats,
      recentPackets: this.packets.slice(0, 50),
      duration: this.stats.startTime ? 
        (new Date() - this.stats.startTime) / 1000 : 0
    };
  }

  /**
   * Set capture filter
   */
  setFilter(filter) {
    this.filter = filter;
    if (this.isCapturing) {
      this.stopCapture();
      this.startCapture('any', filter);
    }
    return { success: true };
  }

  /**
   * Get recent packets
   */
  getRecentPackets(limit = 100) {
    return this.packets.slice(0, limit);
  }

  /**
   * Clear packet buffer
   */
  clearBuffer() {
    this.packets = [];
    this.stats.suspiciousIPs.clear();
    return { success: true };
  }
}

module.exports = new NetworkMonitor();