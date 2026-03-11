import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';

/**
 * Camera Feed Component
 * Manages webcam access and video stream
 */
const CameraFeed = forwardRef(({ 
  onStreamReady, 
  onStreamError,
  className = '',
  width = 640,
  height = 480
}, ref) => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  
  const localVideoRef = useRef(null);
  const videoRef = ref || localVideoRef;

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
      }
    };

    getDevices();
  }, []);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        // Check for media support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported in this browser');
        }

        // Request camera permission
        const constraints = {
          video: selectedDevice ? {
            deviceId: { exact: selectedDevice }
          } : {
            width: { ideal: width },
            height: { ideal: height }
          },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        setStream(mediaStream);
        setPermission('granted');
        setError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
          
          if (onStreamReady) {
            onStreamReady(mediaStream);
          }
        }
      } catch (err) {
        console.error('Camera error:', err);
        
        if (err.name === 'NotAllowedError') {
          setPermission('denied');
          setError('Camera access denied. Please enable in settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device');
        } else {
          setError(`Camera error: ${err.message}`);
        }

        if (onStreamError) {
          onStreamError(err);
        }
      }
    };

    initCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDevice, width, height, onStreamReady, onStreamError]);

  const switchCamera = () => {
    if (devices.length < 2) return;

    const currentIndex = devices.findIndex(d => d.deviceId === selectedDevice);
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDevice(devices[nextIndex].deviceId);
  };

  const retryPermission = () => {
    setPermission(null);
    setError(null);
  };

  if (error) {
    return (
      <div className={`bg-cyber-panel border border-cyber-border rounded-lg 
                      p-8 text-center ${className}`}
           style={{ minHeight: height }}>
        <CameraOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 font-mono text-sm mb-4">{error}</p>
        
        {permission === 'denied' && (
          <button
            onClick={retryPermission}
            className="px-4 py-2 bg-cyber-primary/20 border border-cyber-primary 
                     rounded text-cyber-primary hover:bg-cyber-primary/30 
                     transition-colors font-mono text-sm"
          >
            RETRY
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={width}
        height={height}
        className="w-full h-auto bg-cyber-dark rounded-lg"
      />

      {/* Camera Controls */}
      {devices.length > 1 && (
        <button
          onClick={switchCamera}
          className="absolute bottom-4 right-4 p-2 bg-cyber-panel/80 
                   border border-cyber-border rounded-full
                   hover:bg-cyber-primary/20 transition-colors"
          title="Switch camera"
        >
          <RefreshCw className="w-4 h-4 text-cyber-primary" />
        </button>
      )}

      {/* Camera Indicator */}
      <div className="absolute top-4 left-4 flex items-center space-x-2
                    bg-cyber-dark/80 border border-cyber-border rounded-full px-3 py-1">
        <Camera className="w-3 h-3 text-cyber-primary" />
        <span className="text-xs font-mono text-cyber-primary">LIVE</span>
      </div>
    </div>
  );
});

CameraFeed.displayName = 'CameraFeed';

export default CameraFeed;