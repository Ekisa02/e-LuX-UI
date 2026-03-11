import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading Spinner Component
 */
const Loader = ({ 
  size = 'md', // sm, md, lg
  fullScreen = false,
  text = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-cyber-primary/30 border-t-cyber-primary rounded-full animate-spin`} />
      {text && (
        <motion.p 
          className="mt-4 text-cyber-primary/60 font-mono text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-cyber-dark/90 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;