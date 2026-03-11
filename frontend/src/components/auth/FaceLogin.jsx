import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from 'face-api.js';
import { 
  Camera, 
  User, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Loader
} from 'lucide-react';
import CameraFeed from './CameraFeed';
import LoginOverlay from './LoginOverlay';

/**
 * Face Login Component
 * Handles facial recognition authentication
 */
const FaceLogin = ({ onLogin, onRegister, className = '' }) => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [authStatus, setAuthStatus] = useState(null); // 'success', 'failed', 'processing'
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayType, setOverlayType] = useState('login'); // 'login', 'register', 'success', 'error'
  const [username, setUsername] = useState('');
  const [confidence, setConfidence] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        
        // Load models from public directory
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        
        setIsModelLoading(false);
      } catch (error) {
        console.error('Failed to load face models:', error);
        setModelError('Failed to load face recognition models');
        setIsModelLoading(false);
      }
    };

    loadModels();
  }, []);

  // Detect faces from video stream
  useEffect(() => {
    if (!videoRef.current || isModelLoading) return;

    const detectFaces = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        return;
      }

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length > 0) {
          setFaceDetected(true);
          
          // Draw detections on canvas
          if (canvasRef.current) {
            const displaySize = { 
              width: videoRef.current.videoWidth, 
              height: videoRef.current.videoHeight 
            };
            faceapi.matchDimensions(canvasRef.current, displaySize);
            
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvasRef.current.getContext('2d').clearRect(
              0, 0, canvasRef.current.width, canvasRef.current.height
            );
            
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
          }

          // Auto-login if high confidence
          if (detections[0].detection.score > 0.8 && authStatus === null) {
            handleAutoLogin(detections[0]);
          }
        } else {
          setFaceDetected(false);
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }

      requestAnimationFrame(detectFaces);
    };

    const animationId = requestAnimationFrame(detectFaces);
    return () => cancelAnimationFrame(animationId);
  }, [isModelLoading, authStatus]);

  const handleAutoLogin = async (detection) => {
    setAuthStatus('processing');
    setConfidence(detection.detection.score);

    try {
      // Capture frame as image
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Attempt login
      const result = await window.api.invoke('auth:login', { imageData });
      
      if (result.success) {
        setAuthStatus('success');
        setOverlayType('success');
        setShowOverlay(true);
        
        setTimeout(() => {
          if (onLogin) {
            onLogin(result.user);
          }
        }, 1500);
      } else {
        setAuthStatus('failed');
        setOverlayType('error');
        setShowOverlay(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setAuthStatus('failed');
      setOverlayType('error');
      setShowOverlay(true);
    }
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setAuthStatus('processing');
    
    try {
      // Capture frame as image
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Register face
      const result = await window.api.invoke('auth:register', { 
        imageData, 
        username 
      });
      
      if (result.success) {
        setAuthStatus('success');
        setOverlayType('success');
        setShowOverlay(true);
        
        setTimeout(() => {
          setShowOverlay(false);
          setOverlayType('login');
          setUsername('');
        }, 2000);
      } else {
        setAuthStatus('failed');
        setOverlayType('error');
        setShowOverlay(true);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthStatus('failed');
      setOverlayType('error');
      setShowOverlay(true);
    }
  };

  const resetAuth = () => {
    setAuthStatus(null);
    setShowOverlay(false);
    setOverlayType('login');
  };

  if (isModelLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 
                      bg-cyber-panel border border-cyber-border rounded-lg ${className}`}>
        <Loader className="w-12 h-12 text-cyber-primary animate-spin mb-4" />
        <p className="text-cyber-primary font-mono text-sm">
          Loading face recognition models...
        </p>
      </div>
    );
  }

  if (modelError) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 
                      bg-red-500/10 border border-red-500 rounded-lg ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-500 font-mono text-sm text-center">
          {modelError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500 
                   rounded text-red-500 hover:bg-red-500 hover:text-white 
                   transition-colors font-mono text-sm"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Camera Feed */}
      <div className="relative rounded-lg overflow-hidden border-2 border-cyber-border">
        <CameraFeed
          ref={videoRef}
          onStreamReady={() => setIsDetecting(true)}
          className="w-full"
        />
        
        {/* Detection Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* Status Overlay */}
        <AnimatePresence>
          {!faceDetected && isDetecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-cyber-dark/80 flex items-center justify-center"
            >
              <div className="text-center">
                <Camera className="w-12 h-12 text-cyber-primary/50 mx-auto mb-3" />
                <p className="text-cyber-primary/60 font-mono text-sm">
                  Position your face in the frame
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Face Detected Indicator */}
        {faceDetected && (
          <div className="absolute top-4 left-4 bg-cyber-primary/20 border 
                        border-cyber-primary rounded-full px-3 py-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyber-primary rounded-full animate-pulse" />
              <span className="text-xs font-mono text-cyber-primary">
                Face Detected
              </span>
            </div>
          </div>
        )}

        {/* Confidence Indicator */}
        {confidence > 0 && (
          <div className="absolute top-4 right-4 bg-cyber-panel border 
                        border-cyber-border rounded-full px-3 py-1">
            <span className="text-xs font-mono text-cyber-primary">
              Confidence: {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-3">
        <button
          onClick={() => {
            setOverlayType('login');
            setShowOverlay(true);
          }}
          disabled={!faceDetected || authStatus === 'processing'}
          className="flex-1 py-3 bg-cyber-primary/20 border border-cyber-primary 
                   rounded text-cyber-primary font-mono text-sm
                   hover:bg-cyber-primary hover:text-cyber-dark
                   disabled:opacity-50 transition-colors
                   flex items-center justify-center space-x-2"
        >
          <Shield className="w-4 h-4" />
          <span>LOGIN WITH FACE</span>
        </button>

        <button
          onClick={() => {
            setOverlayType('register');
            setShowOverlay(true);
          }}
          disabled={authStatus === 'processing'}
          className="flex-1 py-3 bg-cyber-panel border border-cyber-border 
                   rounded text-cyber-primary/70 font-mono text-sm
                   hover:border-cyber-primary hover:text-cyber-primary
                   disabled:opacity-50 transition-colors
                   flex items-center justify-center space-x-2"
        >
          <User className="w-4 h-4" />
          <span>REGISTER NEW FACE</span>
        </button>
      </div>

      {/* Login Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <LoginOverlay
            type={overlayType}
            onClose={resetAuth}
            onConfirm={overlayType === 'register' ? handleRegister : null}
            username={username}
            onUsernameChange={setUsername}
            isProcessing={authStatus === 'processing'}
          />
        )}
      </AnimatePresence>

      {/* Hint Text */}
      <p className="mt-4 text-xs text-cyber-primary/40 font-mono text-center">
        Your face data is stored locally and never uploaded
      </p>
    </div>
  );
};

export default FaceLogin;