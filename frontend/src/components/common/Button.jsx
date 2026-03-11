import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Button Component with cyberpunk styling
 */
const Button = ({ 
  children, 
  variant = 'primary', // primary, secondary, danger, warning, success
  size = 'md', // sm, md, lg
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  className = '',
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'font-mono rounded transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-cyber-primary/20 border border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark',
    secondary: 'bg-cyber-panel border border-cyber-border text-cyber-primary/70 hover:border-cyber-primary hover:text-cyber-primary',
    danger: 'bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white',
    warning: 'bg-yellow-500/20 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black',
    success: 'bg-green-500/20 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black'
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className} 
                 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {Icon && <Icon className="w-4 h-4" />}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </motion.button>
  );
};

export default Button;