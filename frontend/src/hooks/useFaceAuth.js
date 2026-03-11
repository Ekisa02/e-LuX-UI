import { useState, useEffect, useCallback, useRef } from 'react';
import * as faceapi from 'face-api.js';

/**
 * Custom hook for face authentication
 * Manages face detection, recognition, and authentication
 */
export const useFaceAuth = () => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detections, setDetections] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(null); // 'authenticated', 'failed', 'processing'
  const [confidence, setConfidence] = useState(0);
  const [registeredFaces, setRegisteredFaces] = useState([]);

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

  // Load registered faces from database
  useEffect(() => {
    const loadRegisteredFaces = async () => {
      try {
        const users = await window.api.invoke('auth:listUsers');
        setRegisteredFaces(users);
      } catch (error) {
        console.error('Failed to load registered faces:', error);
      }
    };

    if (!isModelLoading) {
      loadRegisteredFaces();
    }
  }, [isModelLoading]);

  // Detect faces from video stream
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || isModelLoading) {
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      setDetections(detections);
      
      if (detections.length > 0) {
        setFaceDetected(true);
        setConfidence(detections[0].detection.score);

        // Draw detections on canvas
        if (canvasRef.current) {
          const displaySize = { 
            width: videoRef.current.videoWidth, 
            height: videoRef.current.videoHeight 
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        }
      } else {
        setFaceDetected(false);
        setConfidence(0);
        
        // Clear canvas
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }

    requestAnimationFrame(detectFaces);
  }, [isModelLoading]);

  // Start face detection
  const startDetection = useCallback((video) => {
    if (video) {
      videoRef.current = video;
      setIsDetecting(true);
      detectFaces();
    }
  }, [detectFaces]);

  // Stop detection
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    setFaceDetected(false);
    setDetections([]);
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  // Capture face image
  const captureFace = useCallback(() => {
    if (!videoRef.current || detections.length === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    return canvas.toDataURL('image/jpeg');
  }, [detections]);

  // Authenticate face
  const authenticate = useCallback(async () => {
    if (!faceDetected || detections.length === 0) {
      return { success: false, error: 'No face detected' };
    }

    setAuthStatus('processing');

    try {
      const imageData = captureFace();
      const result = await window.api.invoke('auth:login', { imageData });

      if (result.success) {
        setAuthStatus('authenticated');
        setCurrentUser(result.user);
        return result;
      } else {
        setAuthStatus('failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      setAuthStatus('failed');
      return { success: false, error: error.message };
    }
  }, [faceDetected, detections, captureFace]);

  // Register new face
  const register = useCallback(async (username) => {
    if (!faceDetected || detections.length === 0) {
      return { success: false, error: 'No face detected' };
    }

    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    setAuthStatus('processing');

    try {
      const imageData = captureFace();
      const result = await window.api.invoke('auth:register', { 
        imageData, 
        username: username.trim() 
      });

      if (result.success) {
        setAuthStatus('authenticated');
        setCurrentUser({ username: username.trim(), id: result.userId });
        
        // Refresh registered faces
        const users = await window.api.invoke('auth:listUsers');
        setRegisteredFaces(users);
        
        return result;
      } else {
        setAuthStatus('failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      setAuthStatus('failed');
      return { success: false, error: error.message };
    }
  }, [faceDetected, detections, captureFace]);

  // Verify current user
  const verify = useCallback(async () => {
    if (!faceDetected || detections.length === 0 || !currentUser) {
      return { success: false, error: 'No face detected or not logged in' };
    }

    try {
      const imageData = captureFace();
      const result = await window.api.invoke('auth:verify', { imageData });

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [faceDetected, detections, captureFace, currentUser]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await window.api.invoke('auth:logout');
      setCurrentUser(null);
      setAuthStatus(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  return {
    // State
    isModelLoading,
    modelError,
    isDetecting,
    faceDetected,
    detections,
    currentUser,
    authStatus,
    confidence,
    registeredFaces,
    
    // Refs
    videoRef,
    canvasRef,
    
    // Methods
    startDetection,
    stopDetection,
    captureFace,
    authenticate,
    register,
    verify,
    logout
  };
};