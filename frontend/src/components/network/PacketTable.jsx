import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

/**
 * Packet Table Component
 * Displays captured network packets in a table
 */
const PacketTable = ({ packets = [] }) => {
  const [expandedPacket, setExpandedPacket] = useState(null);
  const [filter, setFilter] = useState('');

  const filteredPackets = packets.filter(packet => {
    if (!filter) return true;
    const searchStr = filter.toLowerCase();
    return (
      packet.src?.ip?.toLowerCase().includes(searchStr) ||
      packet.dst?.ip?.toLowerCase().includes(searchStr) ||
      packet.protocol?.toLowerCase().includes(searchStr)
    );
  });

  const getProtocolColor = (protocol) => {
    switch(protocol) {
      case 'TCP': return 'text-cyber-primary';
      case 'UDP': return 'text-yellow-500';
      case 'ICMP': return 'text-purple-500';
      default: return 'text-cyber-primary/60';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filter Bar */}
      <div className="p-2 border-b border-cyber-border">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by IP or protocol..."
          className="w-full bg-cyber-dark border border-cyber-border rounded 
                   px-3 py-1.5 text-sm font-mono text-cyber-primary
                   focus:border-cyber-primary focus:outline-none"
        />
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 p-3 border-b border-cyber-border 
                    bg-cyber-dark/50 text-xs font-mono text-cyber-primary/60">
        <div className="col-span-1">#</div>
        <div className="col-span-2">Time</div>
        <div className="col-span-1">Protocol</div>
        <div className="col-span-3">Source</div>
        <div className="col-span-3">Destination</div>
        <div className="col-span-1">Length</div>
        <div className="col-span-1"></div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto">
        {filteredPackets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-cyber-primary/30 font-mono text-sm">
              No packets captured
            </p>
          </div>
        ) : (
          filteredPackets.map((packet, index) => (
            <div key={index}>
              {/* Packet Row */}
              <div 
                className={`grid grid-cols-12 gap-2 p-3 text-sm font-mono 
                           border-b border-cyber-border/30 hover:bg-cyber-primary/5 
                           cursor-pointer transition-colors ${
                  expandedPacket === index ? 'bg-cyber-primary/10' : ''
                }`}
                onClick={() => setExpandedPacket(expandedPacket === index ? null : index)}
              >
                <div className="col-span-1 text-cyber-primary/40">
                  {filteredPackets.length - index}
                </div>
                <div className="col-span-2 text-cyber-primary/60">
                  {formatTimestamp(packet.timestamp)}
                </div>
                <div className={`col-span-1 ${getProtocolColor(packet.protocol)}`}>
                  {packet.protocol}
                </div>
                <div className="col-span-3 text-cyber-primary truncate">
                  {packet.src?.ip || 'Unknown'}
                  {packet.src?.port && `:${packet.src.port}`}
                </div>
                <div className="col-span-3 text-cyber-primary truncate">
                  {packet.dst?.ip || 'Unknown'}
                  {packet.dst?.port && `:${packet.dst.port}`}
                </div>
                <div className="col-span-1 text-cyber-primary/60">
                  {packet.length} B
                </div>
                <div className="col-span-1 text-cyber-primary/40">
                  {expandedPacket === index ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedPacket === index && (
                <div className="p-4 bg-cyber-dark/50 border-b border-cyber-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs text-cyber-primary/40 font-mono mb-2">
                        PACKET DETAILS
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-cyber-primary/60">Timestamp:</span>
                          <span className="text-cyber-primary">
                            {new Date(packet.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyber-primary/60">Protocol:</span>
                          <span className={getProtocolColor(packet.protocol)}>
                            {packet.protocol}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyber-primary/60">Length:</span>
                          <span className="text-cyber-primary">{packet.length} bytes</span>
                        </div>
                        {packet.ttl && (
                          <div className="flex justify-between">
                            <span className="text-cyber-primary/60">TTL:</span>
                            <span className="text-cyber-primary">{packet.ttl}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs text-cyber-primary/40 font-mono mb-2">
                        FLAGS
                      </h4>
                      {packet.flags ? (
                        <div className="space-y-1 text-sm">
                          {Object.entries(packet.flags).map(([flag, value]) => (
                            <div key={flag} className="flex justify-between">
                              <span className="text-cyber-primary/60 uppercase">{flag}:</span>
                              <span className={value ? 'text-cyber-primary' : 'text-cyber-primary/30'}>
                                {value ? '✓' : '✗'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-cyber-primary/40 text-sm">No flags available</p>
                      )}
                    </div>
                  </div>

                  {/* Raw Packet Data (if available) */}
                  {packet.raw && (
                    <div className="mt-4">
                      <h4 className="text-xs text-cyber-primary/40 font-mono mb-2">
                        RAW DATA
                      </h4>
                      <pre className="bg-cyber-dark p-3 rounded text-xs text-cyber-primary/60 
                                    overflow-x-auto font-mono">
                        {packet.raw}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-cyber-border bg-cyber-dark/30 
                    text-xs text-cyber-primary/40 font-mono">
        Showing {filteredPackets.length} of {packets.length} packets
      </div>
    </div>
  );
};

export default PacketTable;