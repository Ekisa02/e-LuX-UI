/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format timestamp to relative time
 */
export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (seconds > 10) return `${seconds} seconds ago`;
  return 'just now';
};

/**
 * Format date to local string
 */
export const formatDate = (timestamp, options = {}) => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  });
};

/**
 * Format duration in milliseconds
 */
export const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);
  
  return parts.join(' ') || '0s';
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format speed (bytes per second)
 */
export const formatSpeed = (bytesPerSecond) => {
  return `${formatBytes(bytesPerSecond)}/s`;
};

/**
 * Format frequency (Hz)
 */
export const formatFrequency = (hz) => {
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(2)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(2)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(2)} KHz`;
  return `${hz.toFixed(2)} Hz`;
};

/**
 * Format temperature
 */
export const formatTemperature = (celsius) => {
  return `${celsius.toFixed(1)}°C`;
};

/**
 * Format uptime
 */
export const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

/**
 * Format MAC address
 */
export const formatMacAddress = (mac) => {
  if (!mac) return 'Unknown';
  return mac.match(/.{2}/g)?.join(':').toUpperCase() || mac;
};

/**
 * Format IP address (truncate IPv6)
 */
export const formatIpAddress = (ip) => {
  if (!ip) return 'Unknown';
  if (ip.includes(':') && ip.length > 20) {
    return ip.split(':').slice(0, 4).join(':') + '...';
  }
  return ip;
};

/**
 * Format command output (truncate long lines)
 */
export const formatCommandOutput = (output, maxLines = 50, maxLineLength = 200) => {
  const lines = output.split('\n');
  
  if (lines.length > maxLines) {
    return [...lines.slice(0, maxLines), `... and ${lines.length - maxLines} more lines`].join('\n');
  }
  
  return lines.map(line => {
    if (line.length > maxLineLength) {
      return line.substring(0, maxLineLength) + '...';
    }
    return line;
  }).join('\n');
};