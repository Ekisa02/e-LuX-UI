import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Card Component with cyberpunk styling
 */
const Card = ({ 
  children, 
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  variant = 'default', // default, gradient, bordered
  hover = true,
  padding = true
}) => {
  const baseClasses = 'bg-cyber-panel border border-cyber-border rounded-lg overflow-hidden';
  
  const variantClasses = {
    default: '',
    gradient: 'bg-gradient-cyber',
    bordered: 'border-2 border-cyber-primary/30'
  };

  const hoverClasses = hover ? 'hover:border-cyber-primary/50 transition-colors' : '';

  return (
    <motion.div 
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div className="px-4 py-3 border-b border-cyber-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-cyber-primary font-cyber text-lg">{title}</h3>}
            {subtitle && <p className="text-cyber-primary/60 text-sm">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      {/* Content */}
      <div className={padding ? 'p-4' : ''}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-4 py-3 border-t border-cyber-border bg-cyber-dark/30">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;