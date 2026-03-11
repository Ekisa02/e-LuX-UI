import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import FaceLogin from '../components/auth/FaceLogin';
import { Cpu, Shield, Activity } from 'lucide-react';

/**
 * Login Page Component
 * Handles user authentication via face recognition
 */
const LoginPage = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const handleLogin = (user) => {
    dispatch(login(user));
  };

  const handleLoginError = (err) => {
    setError(err.message);
  };

  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full matrix-bg" />
        <div className="absolute top-0 left-0 w-full h-full scanline" />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex p-4 bg-cyber-primary/20 border-2 border-cyber-primary 
                       rounded-full mb-4"
          >
            <Cpu className="w-12 h-12 text-cyber-primary" />
          </motion.div>
          
          <h1 className="text-3xl font-cyber text-cyber-primary mb-2 glitch" data-text="e-LuX-UI">
            e-LuX-UI
          </h1>
          
          <p className="text-sm text-cyber-primary/60 font-mono">
            Enhanced Logic-driven Universal eXecution Interface
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-cyber-panel border-2 border-cyber-border rounded-lg p-6 
                     shadow-2xl relative overflow-hidden"
        >
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-primary" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-primary" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-primary" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-primary" />

          {/* Security Badge */}
          <div className="absolute top-4 right-4 flex items-center space-x-2
                        bg-cyber-dark/50 border border-cyber-border rounded-full px-3 py-1">
            <Shield className="w-3 h-3 text-cyber-primary" />
            <span className="text-xs font-mono text-cyber-primary">SECURE</span>
          </div>

          {/* Face Login Component */}
          <FaceLogin 
            onLogin={handleLogin}
            onError={handleLoginError}
            className="mt-4"
          />

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded"
            >
              <p className="text-sm text-red-500 font-mono text-center">{error}</p>
            </motion.div>
          )}

          {/* System Status */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-3 h-3 text-cyber-primary/40" />
              <span className="text-xs font-mono text-cyber-primary/40">
                System Ready
              </span>
            </div>
            <div className="w-1 h-1 bg-cyber-primary/40 rounded-full" />
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyber-primary rounded-full animate-pulse" />
              <span className="text-xs font-mono text-cyber-primary/40">
                AI Online
              </span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-cyber-primary/30 font-mono">
          © 2024 e-LuX-UI • Secure Biometric Authentication
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;