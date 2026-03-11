import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  Skull, 
  Info,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

/**
 * Suspicious Alert Component
 * Displays security alerts for suspicious network activity
 */
const SuspiciousAlert = ({ alert, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);

  const getAlertIcon = (type) => {
    switch(type) {
      case 'POSSIBLE_PORT_SCAN':
        return <Skull className="w-5 h-5 text-red-500" />;
      case 'SUSPICIOUS_PORT':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Shield className="w-5 h-5 text-cyan-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch(type) {
      case 'POSSIBLE_PORT_SCAN':
        return 'border-red-500 bg-red-500/10';
      case 'SUSPICIOUS_PORT':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-cyan-500 bg-cyan-500/10';
    }
  };

  const getSeverityLevel = (type) => {
    switch(type) {
      case 'POSSIBLE_PORT_SCAN':
        return { label: 'HIGH', color: 'text-red-500' };
      case 'SUSPICIOUS_PORT':
        return { label: 'MEDIUM', color: 'text-yellow-500' };
      default:
        return { label: 'LOW', color: 'text-cyan-500' };
    }
  };

  const severity = getSeverityLevel(alert.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`border rounded-lg overflow-hidden ${getAlertColor(alert.type)}`}
    >
      {/* Header */}
      <div className="p-3 flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getAlertIcon(alert.type)}
          
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-mono text-cyber-primary">
                {alert.type.replace(/_/g, ' ')}
              </span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full 
                             bg-current/20 ${severity.color}`}>
                {severity.label}
              </span>
            </div>
            
            <p className="text-sm text-cyber-primary/80">
              {alert.source} → {alert.target}
            </p>
            
            <div className="flex items-center space-x-4 mt-2 text-xs">
              {alert.packets && (
                <span className="text-cyber-primary/60">
                  Packets: {alert.packets}
                </span>
              )}
              {alert.port && (
                <span className="text-cyber-primary/60">
                  Port: {alert.port}
                </span>
              )}
              <span className="text-cyber-primary/60">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-cyber-primary/10 rounded"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-cyber-primary/60" />
            ) : (
              <ChevronDown className="w-4 h-4 text-cyber-primary/60" />
            )}
          </button>
          
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 hover:bg-cyber-primary/10 rounded"
            >
              <X className="w-4 h-4 text-cyber-primary/60" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-3 border-t border-current/10 bg-cyber-dark/50">
          <h4 className="text-xs text-cyber-primary/60 font-mono mb-2">
            RECOMMENDED ACTIONS
          </h4>
          
          <ul className="space-y-2 text-sm">
            {alert.type === 'POSSIBLE_PORT_SCAN' && (
              <>
                <li className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-cyber-primary/40 flex-shrink-0 mt-0.5" />
                  <span className="text-cyber-primary/80">
                    Block the source IP address: {alert.source}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-cyber-primary/40 flex-shrink-0 mt-0.5" />
                  <span className="text-cyber-primary/80">
                    Review firewall rules and rate limiting
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-cyber-primary/40 flex-shrink-0 mt-0.5" />
                  <span className="text-cyber-primary/80">
                    Check for compromised services
                  </span>
                </li>
              </>
            )}

            {alert.type === 'SUSPICIOUS_PORT' && (
              <>
                <li className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-cyber-primary/40 flex-shrink-0 mt-0.5" />
                  <span className="text-cyber-primary/80">
                    Investigate traffic on port {alert.port}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-cyber-primary/40 flex-shrink-0 mt-0.5" />
                  <span className="text-cyber-primary/80">
                    Verify if this port should be publicly accessible
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-cyber-primary/40 flex-shrink-0 mt-0.5" />
                  <span className="text-cyber-primary/80">
                    Consider implementing port knocking or moving to non-standard ports
                  </span>
                </li>
              </>
            )}
          </ul>

          {/* Quick Actions */}
          <div className="mt-4 flex space-x-2">
            <button className="px-3 py-1.5 bg-cyber-primary/20 border border-cyber-primary 
                             rounded text-cyber-primary text-xs font-mono
                             hover:bg-cyber-primary hover:text-cyber-dark transition-colors">
              BLOCK IP
            </button>
            <button className="px-3 py-1.5 bg-cyber-dark border border-cyber-border 
                             rounded text-cyber-primary/60 text-xs font-mono
                             hover:border-cyber-primary hover:text-cyber-primary transition-colors">
              INVESTIGATE
            </button>
            <button className="px-3 py-1.5 bg-cyber-dark border border-cyber-border 
                             rounded text-cyber-primary/60 text-xs font-mono
                             hover:border-cyber-primary hover:text-cyber-primary transition-colors">
              IGNORE
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SuspiciousAlert;