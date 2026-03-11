import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  X,
  Camera
} from 'lucide-react';

/**
 * Login Overlay Component
 * Displays login/registration dialogs
 */
const LoginOverlay = ({ 
  type = 'login', // 'login', 'register', 'success', 'error'
  onClose, 
  onConfirm,
  username,
  onUsernameChange,
  isProcessing = false
}) => {
  const getContent = () => {
    switch(type) {
      case 'login':
        return {
          icon: Shield,
          title: 'Face Login',
          message: 'Position your face in the frame to log in',
          confirmText: 'START RECOGNITION',
          showInput: false
        };
      
      case 'register':
        return {
          icon: User,
          title: 'Register New Face',
          message: 'Enter a username and look at the camera to register',
          confirmText: 'REGISTER FACE',
          showInput: true,
          inputPlaceholder: 'Enter username...'
        };
      
      case 'success':
        return {
          icon: CheckCircle,
          title: 'Success!',
          message: username ? `Welcome, ${username}!` : 'Authentication successful',
          confirmText: 'CONTINUE',
          showInput: false,
          autoClose: true
        };
      
      case 'error':
        return {
          icon: AlertCircle,
          title: 'Authentication Failed',
          message: 'Could not verify your face. Please try again.',
          confirmText: 'TRY AGAIN',
          showInput: false
        };
      
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative bg-cyber-panel border border-cyber-border 
                   rounded-lg w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className={`p-6 text-center border-b border-cyber-border ${
          type === 'success' ? 'bg-green-500/10' : 
          type === 'error' ? 'bg-red-500/10' : 
          'bg-cyber-primary/5'
        }`}>
          <div className={`inline-flex p-3 rounded-full mb-4 ${
            type === 'success' ? 'bg-green-500/20' :
            type === 'error' ? 'bg-red-500/20' :
            'bg-cyber-primary/20'
          }`}>
            <Icon className={`w-8 h-8 ${
              type === 'success' ? 'text-green-500' :
              type === 'error' ? 'text-red-500' :
              'text-cyber-primary'
            }`} />
          </div>
          
          <h2 className={`text-xl font-cyber mb-2 ${
            type === 'success' ? 'text-green-500' :
            type === 'error' ? 'text-red-500' :
            'text-cyber-primary'
          }`}>
            {content.title}
          </h2>
          
          <p className="text-sm text-cyber-primary/60 font-mono">
            {content.message}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {isProcessing ? (
            <div className="text-center py-8">
              <Loader className="w-12 h-12 text-cyber-primary animate-spin mx-auto mb-4" />
              <p className="text-sm font-mono text-cyber-primary/60">
                Processing...
              </p>
            </div>
          ) : (
            <>
              {content.showInput && (
                <div className="mb-6">
                  <label className="block text-xs text-cyber-primary/60 font-mono mb-2">
                    USERNAME
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    placeholder={content.inputPlaceholder}
                    className="w-full bg-cyber-dark border border-cyber-border 
                             rounded px-4 py-3 text-cyber-primary font-mono text-sm
                             focus:border-cyber-primary focus:outline-none"
                    autoFocus
                  />
                </div>
              )}

              <div className="flex space-x-3">
                {type !== 'success' && (
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-cyber-dark border border-cyber-border 
                             rounded text-cyber-primary/60 font-mono text-sm
                             hover:border-cyber-primary hover:text-cyber-primary
                             transition-colors"
                  >
                    CANCEL
                  </button>
                )}

                {onConfirm && (
                  <button
                    onClick={onConfirm}
                    disabled={content.showInput && !username?.trim()}
                    className={`flex-1 py-3 rounded font-mono text-sm
                              transition-colors flex items-center justify-center space-x-2
                              ${type === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                type === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' :
                                'bg-cyber-primary/20 border border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark'
                              } disabled:opacity-50`}
                  >
                    {type === 'login' && <Camera className="w-4 h-4" />}
                    <span>{content.confirmText}</span>
                  </button>
                )}
              </div>

              {type === 'register' && (
                <p className="mt-4 text-xs text-cyber-primary/40 font-mono text-center">
                  Your face data will be encrypted and stored locally
                </p>
              )}
            </>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-cyber-primary/10 rounded"
        >
          <X className="w-5 h-5 text-cyber-primary/60" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LoginOverlay;