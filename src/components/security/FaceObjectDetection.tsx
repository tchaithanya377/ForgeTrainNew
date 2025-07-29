import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CameraIcon, ExclamationTriangleIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DetectionResult {
  faces: number;
  objects: string[];
  violations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: Date;
  imageData?: string;
}

interface FaceObjectDetectionProps {
  isActive: boolean;
  onDetection: (result: DetectionResult) => void;
  onError: (error: string) => void;
  className?: string;
}

export const FaceObjectDetection: React.FC<FaceObjectDetectionProps> = ({
  isActive,
  onDetection,
  onError,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastDetection, setLastDetection] = useState<DetectionResult | null>(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const [noFaceCount, setNoFaceCount] = useState(0);
  const [multipleFaceCount, setMultipleFaceCount] = useState(0);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });

        console.log('Camera started successfully');
        setCameraError(null);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Camera access denied. Please allow camera access to continue.'
        : `Camera error: ${error.message}`;
      setCameraError(errorMessage);
      onError(errorMessage);
    }
  }, [onError]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    console.log('Camera stopped');
  }, []);

  // Basic face detection using canvas analysis
  const detectFaces = useCallback((canvas: HTMLCanvasElement): number => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple skin tone detection (basic heuristic)
    let skinPixels = 0;
    let totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Basic skin tone detection
      if (r > 95 && g > 40 && b > 20 && 
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          Math.abs(r - g) > 15 && r > g && r > b) {
        skinPixels++;
      }
    }
    
    const skinPercentage = skinPixels / totalPixels;
    
    // Estimate number of faces based on skin percentage
    if (skinPercentage > 0.3) {
      return Math.max(1, Math.round(skinPercentage * 3)); // Rough estimate
    } else if (skinPercentage > 0.1) {
      return 1;
    }
    
    return 0;
  }, []);

  // Basic object detection using color and pattern analysis
  const detectObjects = useCallback((canvas: HTMLCanvasElement): string[] => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const objects: string[] = [];
    
    // Detect bright areas (potential screens/devices)
    let brightPixels = 0;
    let totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      if (brightness > 200) {
        brightPixels++;
      }
    }
    
    const brightPercentage = brightPixels / totalPixels;
    
    if (brightPercentage > 0.4) {
      objects.push('bright_screen');
    }
    
    // Detect dark areas (potential devices)
    let darkPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      if (brightness < 50) {
        darkPixels++;
      }
    }
    
    const darkPercentage = darkPixels / totalPixels;
    if (darkPercentage > 0.3) {
      objects.push('dark_object');
    }
    
    return objects;
  }, []);

  // Perform detection
  const performDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    try {
      setIsDetecting(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Perform basic detection
      const faces = detectFaces(canvas);
      const objects = detectObjects(canvas);
      
      // Check for violations
      const violations: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let confidence = 0.5;

      // Multiple faces detection
      if (faces > 1) {
        violations.push(`Multiple people detected (${faces} faces)`);
        riskLevel = 'critical';
        confidence = 0.8;
        setMultipleFaceCount(prev => prev + 1);
      } else {
        setMultipleFaceCount(0);
      }

      // No face detection
      if (faces === 0) {
        setNoFaceCount(prev => prev + 1);
        if (noFaceCount > 3) { // After 3 consecutive detections
          violations.push('No face detected - possible cheating attempt');
          riskLevel = 'high';
          confidence = 0.7;
        }
      } else {
        setNoFaceCount(0);
      }

      // Suspicious objects detection
      if (objects.includes('bright_screen')) {
        violations.push('Bright screen detected - possible secondary device');
        if (riskLevel === 'low') riskLevel = 'medium';
        confidence = Math.max(confidence, 0.6);
      }

      if (objects.includes('dark_object')) {
        violations.push('Dark object detected - possible phone/device');
        if (riskLevel === 'low') riskLevel = 'medium';
        confidence = Math.max(confidence, 0.6);
      }

      // Create detection result
      const result: DetectionResult = {
        faces,
        objects,
        violations,
        riskLevel,
        confidence,
        timestamp: new Date()
      };

      setLastDetection(result);
      setDetectionCount(prev => prev + 1);
      onDetection(result);

      // Draw detection overlay
      ctx.strokeStyle = riskLevel === 'critical' ? '#ff0000' : 
                       riskLevel === 'high' ? '#ff6600' : 
                       riskLevel === 'medium' ? '#ffff00' : '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Add text overlay
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = '16px Arial';
      ctx.fillText(`Faces: ${faces} | Objects: ${objects.length} | Risk: ${riskLevel.toUpperCase()}`, 10, 30);

    } catch (error) {
      console.error('Detection error:', error);
      onError(`Detection failed: ${error.message}`);
    } finally {
      setIsDetecting(false);
    }
  }, [detectFaces, detectObjects, onDetection, onError, noFaceCount]);

  // Start detection loop
  const startDetection = useCallback(() => {
    if (!isActive || !isInitialized) return;

    // Perform initial detection
    performDetection();

    // Set up detection interval (every 3 seconds)
    detectionIntervalRef.current = setInterval(performDetection, 3000);
  }, [isActive, isInitialized, performDetection]);

  // Stop detection loop
  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (isActive) {
      startCamera();
    }
    return () => {
      stopCamera();
      stopDetection();
    };
  }, [isActive, startCamera, stopCamera, stopDetection]);

  // Handle active state changes
  useEffect(() => {
    if (isActive && isInitialized) {
      startDetection();
    } else {
      stopDetection();
    }
  }, [isActive, isInitialized, startDetection, stopDetection]);

  if (!isActive) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Camera Feed */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-48 object-cover"
        />
        
        {/* Detection Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* Status Overlay */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          <div className="flex items-center space-x-1">
            <CameraIcon className="h-3 w-3" />
            <span>{isDetecting ? 'Detecting...' : 'Monitoring'}</span>
          </div>
        </div>

        {/* Detection Results */}
        {lastDetection && (
          <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <EyeIcon className="h-3 w-3" />
                <span>Faces: {lastDetection.faces}</span>
                <span>Objects: {lastDetection.objects.length}</span>
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                lastDetection.riskLevel === 'critical' ? 'bg-red-500' :
                lastDetection.riskLevel === 'high' ? 'bg-orange-500' :
                lastDetection.riskLevel === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}>
                {lastDetection.riskLevel.toUpperCase()}
              </div>
            </div>
            {lastDetection.violations.length > 0 && (
              <div className="mt-1 text-red-300">
                <ExclamationTriangleIcon className="h-3 w-3 inline mr-1" />
                {lastDetection.violations[0]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {cameraError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <XMarkIcon className="h-4 w-4" />
            <span className="text-sm">{cameraError}</span>
          </div>
        </div>
      )}

      {/* Detection Stats */}
      <div className="mt-2 text-xs text-gray-600">
        Detections: {detectionCount} | 
        Last: {lastDetection?.timestamp.toLocaleTimeString() || 'None'} |
        No Face Count: {noFaceCount} |
        Multiple Face Count: {multipleFaceCount}
      </div>
    </div>
  );
}; 