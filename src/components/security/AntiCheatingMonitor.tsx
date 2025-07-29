import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  ShieldCheckIcon, 
  ShieldExclamationIcon, 
  VideoCameraIcon,
  MicrophoneIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PlayIcon,
  StopIcon,
  EyeIcon,
  EyeSlashIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAntiCheating } from '../../hooks/useAntiCheating';
import { SecurityViolation } from '../../lib/antiCheatingSystem';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AntiCheatingMonitorProps {
  isActive?: boolean;
  onViolation?: (violation: SecurityViolation) => void;
  onTermination?: (reason: string) => void;
  onError?: (error: string) => void;
  showControls?: boolean;
  showViolations?: boolean;
  showStats?: boolean;
  showVideo?: boolean;
  className?: string;
}

export const AntiCheatingMonitor: React.FC<AntiCheatingMonitorProps> = ({
  isActive = false,
  onViolation,
  onTermination,
  onError,
  showControls = true,
  showViolations = true,
  showStats = true,
  showVideo = true,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Memoize the options to prevent infinite re-renders
  const options = useMemo(() => ({
    autoStart: isActive,
    onViolation,
    onTermination,
    onError
  }), [isActive, onViolation, onTermination, onError]);

  const {
    isActive: systemActive,
    isInitialized,
    violations,
    riskLevel,
    sessionId,
    error,
    isRecording,
    stats,
    initialize,
    start,
    stop,
    startRecording,
    clearViolations,
    reset,
    getViolationStats,
    getStatus
  } = useAntiCheating(options);

  // Get current status including media access
  const currentStatus = getStatus();

  // Initialize camera stream
  useEffect(() => {
    const initCamera = async () => {
      try {
        console.log('Attempting to initialize camera for monitor...');
        
        // First check if we have permission
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log('Camera permission status:', permissions.state);
        
        if (permissions.state === 'denied') {
          console.error('Camera permission denied');
          setVideoStream(null);
          return;
        }
        
        // Get a separate camera stream for the monitor (don't share with anti-cheating system)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
        console.log('Monitor camera stream obtained successfully');
        setVideoStream(stream);
        
        // Wait a bit for the video element to be ready
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            console.log('Monitor video element updated with stream');
            
            // Ensure video plays
            videoRef.current.play().catch(e => {
              console.error('Failed to play monitor video:', e);
            });
          } else {
            console.error('Monitor video ref not available');
          }
        }, 100);
        
      } catch (error) {
        console.error('Failed to access camera for monitor:', error);
        setVideoStream(null);
        
        // Show specific error message
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            console.log('Camera access denied for monitor');
          } else if (error.name === 'NotFoundError') {
            console.log('No camera found for monitor');
          } else {
            console.log(`Camera error for monitor: ${error.message}`);
          }
        }
      }
    };

    // Initialize camera immediately when component mounts
    if (showVideo) {
      initCamera();
    }

    return () => {
      if (videoStream) {
        console.log('Cleaning up monitor camera stream');
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showVideo]); // Removed systemActive dependency to initialize immediately

  // Auto-start when isActive prop changes - simplified to avoid infinite loop
  useEffect(() => {
    if (isActive && !systemActive) {
      start();
    } else if (!isActive && systemActive) {
      stop();
    }
  }, [isActive, systemActive]); // Removed start, stop from dependencies

  const violationStats = getViolationStats();

  // Check fullscreen status
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    checkFullscreen();
    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => document.removeEventListener('fullscreenchange', checkFullscreen);
  }, []);

  const handleRequestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  const handleExitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  };

  const handleRequestCamera = async () => {
    try {
      console.log('User requested camera access...');
      
      // Try different video constraints
      const constraints = [
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        },
        {
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          }
        },
        {
          video: true // Fallback to any available camera
        }
      ];
      
      let stream = null;
      let error = null;
      
      for (const constraint of constraints) {
        try {
          console.log('Trying constraint:', constraint);
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log('Camera access granted with constraint:', constraint);
          break;
        } catch (e) {
          error = e;
          console.log('Failed with constraint:', constraint, e);
          continue;
        }
      }
      
      if (!stream) {
        throw error || new Error('No camera available');
      }
      
      setVideoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Video element updated with new stream');
        
        // Force play
        try {
          await videoRef.current.play();
          console.log('Video playing successfully');
        } catch (playError) {
          console.error('Failed to play video:', playError);
        }
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
      setVideoStream(null);
      
      // Show specific error message
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Camera access denied. Please allow camera access in your browser settings and try again.');
        } else if (error.name === 'NotFoundError') {
          alert('No camera found. Please connect a camera and try again.');
        } else if (error.name === 'NotReadableError') {
          alert('Camera is in use by another application. Please close other apps using the camera.');
        } else {
          alert(`Camera error: ${error.message}`);
        }
      }
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <ShieldExclamationIcon className="h-4 w-4" />;
      case 'high': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'medium': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'low': return <ShieldCheckIcon className="h-4 w-4" />;
      default: return <ShieldCheckIcon className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'face': return <VideoCameraIcon className="h-4 w-4" />;
      case 'voice': return <MicrophoneIcon className="h-4 w-4" />;
      case 'screen': return <ComputerDesktopIcon className="h-4 w-4" />;
      default: return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const getViolationColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateRiskScore = () => {
    const criticalWeight = 100;
    const highWeight = 50;
    const mediumWeight = 25;
    const lowWeight = 10;

    const score = 
      violationStats.bySeverity.critical * criticalWeight +
      violationStats.bySeverity.high * highWeight +
      violationStats.bySeverity.medium * mediumWeight +
      violationStats.bySeverity.low * lowWeight;

    return Math.min(score, 100);
  };

  // Handle system reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the entire anti-cheating system? This will clear all violations and detection stats.')) {
      reset();
    }
  };

  // Handle clear violations
  const handleClearViolations = () => {
    if (window.confirm('Are you sure you want to clear all violations? This will reset the violation count but keep detection stats.')) {
      clearViolations();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Video Monitoring Window - Moved to top for visibility */}
      {showVideo && (
        <Card className="bg-black border-gray-700">
          <div className="p-2">
            <div className="text-white text-xs mb-2 font-medium">Live Camera Monitoring</div>
            <div className="relative">
              {videoStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-48 object-cover rounded bg-gray-900 border-2 border-green-500"
                  onLoadedMetadata={() => console.log('Monitor video metadata loaded')}
                  onCanPlay={() => console.log('Monitor video can play')}
                  onError={(e) => console.error('Monitor video error:', e)}
                  style={{ transform: 'scaleX(-1)' }} // Mirror the video
                />
              ) : (
                <div className="w-full h-48 bg-gray-900 rounded flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <VideoCameraIcon className="h-12 w-12 mx-auto mb-3" />
                    <div className="text-sm mb-2">Camera access denied</div>
                    <div className="text-xs mb-3">Please allow camera access to continue</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRequestCamera}
                      className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                    >
                      Enable Camera
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Manual camera test...');
                        console.log('Video ref:', videoRef.current);
                        console.log('Video stream:', videoStream);
                        if (videoRef.current) {
                          console.log('Video element properties:', {
                            srcObject: videoRef.current.srcObject,
                            readyState: videoRef.current.readyState,
                            videoWidth: videoRef.current.videoWidth,
                            videoHeight: videoRef.current.videoHeight
                          });
                        }
                      }}
                      className="mt-2 bg-gray-600 text-white border-gray-600 hover:bg-gray-700"
                    >
                      Debug Camera
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Refreshing camera...');
                        if (videoStream) {
                          videoStream.getTracks().forEach(track => track.stop());
                        }
                        setVideoStream(null);
                        setTimeout(() => {
                          handleRequestCamera();
                        }, 500);
                      }}
                      className="mt-2 bg-green-600 text-white border-green-600 hover:bg-green-700"
                    >
                      Refresh Camera
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Detection Overlay */}
              <div className="absolute bottom-2 left-2 text-white text-xs">
                <div className="flex items-center space-x-2">
                  <span>Faces: {stats.noFaceCount > 0 ? 0 : 1}</span>
                  <span>Objects: {stats.totalViolations > 0 ? 1 : 0}</span>
                </div>
                {stats.noFaceCount > 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <ExclamationTriangleIcon className="h-3 w-3 text-yellow-400" />
                    <span className="text-yellow-400">No face detected</span>
                    <Badge className="text-xs bg-yellow-600">MEDIUM</Badge>
                  </div>
                )}
              </div>
            </div>
            
            {/* Detection Stats */}
            <div className="text-white text-xs mt-2 space-y-1">
              <div>Detections: {stats.faceDetections + stats.voiceDetections + stats.screenDetections}</div>
              <div>Last: {stats.lastDetection ? stats.lastDetection.toLocaleTimeString() : 'None'}</div>
              <div>No Face Count: {stats.noFaceCount}</div>
              <div className={`flex items-center space-x-1 ${videoStream ? 'text-green-400' : 'text-red-400'}`}>
                <span>Camera:</span>
                <span>{videoStream ? '✓ Active' : '✗ Inactive'}</span>
              </div>
              <div className="text-white text-xs">
                <span>Browser: {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}</span>
              </div>
              <div className="text-white text-xs">
                <span>HTTPS: {window.location.protocol === 'https:' ? '✓' : '✗'}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Security Status Card */}
      <Card className="bg-white shadow-lg border-l-4 border-l-red-500">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ShieldExclamationIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                ZERO TOLERANCE SECURITY
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getRiskLevelColor(riskLevel)}>
                {getRiskLevelIcon(riskLevel)}
                <span className="ml-1">{riskLevel.toUpperCase()}</span>
              </Badge>
              {showControls && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <CogIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {violations.length}/3
              </div>
              <div className="text-sm text-gray-600">Violations</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isFullscreen ? 'text-green-600' : 'text-red-600'}`}>
                {isFullscreen ? 'ACTIVE' : 'INACTIVE'}
              </div>
              <div className="text-sm text-gray-600">Fullscreen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {document.hasFocus() ? 'ACTIVE' : 'LOST'}
              </div>
              <div className="text-sm text-gray-600">Focus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {calculateRiskScore()}%
              </div>
              <div className="text-sm text-gray-600">Risk Score</div>
            </div>
          </div>

          {/* Fullscreen Controls */}
          <div className="flex justify-center space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestFullscreen}
              disabled={isFullscreen}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Enter Fullscreen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExitFullscreen}
              disabled={!isFullscreen}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Exit Fullscreen
            </Button>
          </div>

          {/* Warnings */}
          {riskLevel === 'critical' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <span className="text-red-800 font-medium">
                  ZERO TOLERANCE: Any security violation will result in immediate termination
                </span>
              </div>
            </div>
          )}

          {/* High violation count warning */}
          {violations.length > 100 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                  <span className="text-orange-800 font-medium">
                    High violation count detected ({violations.length}). Consider resetting the system.
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearViolations}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    Clear Violations
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Force Reset
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Reset for Very High Violations */}
          {violations.length > 200 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-red-800 font-medium">
                    CRITICAL: Excessive violations ({violations.length}). System may be malfunctioning.
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReset}
                  className="bg-red-600 hover:bg-red-700"
                >
                  EMERGENCY RESET
                </Button>
              </div>
            </div>
          )}

          {/* Ultra High Violations - Immediate Reset Required */}
          {violations.length > 500 && (
            <div className="bg-red-900 border border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-300" />
                  <span className="text-red-100 font-bold text-lg">
                    SYSTEM MALFUNCTION: {violations.length} violations detected!
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleReset}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold"
                >
                  IMMEDIATE RESET REQUIRED
                </Button>
              </div>
              <div className="text-red-200 text-sm mt-2">
                The anti-cheating system has detected an abnormal number of violations. 
                This may indicate a system malfunction. Please reset immediately.
              </div>
            </div>
          )}

          {/* Detection Statistics */}
          {showStats && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <VideoCameraIcon className={`h-4 w-4 ${currentStatus.hasCamera ? 'text-blue-500' : 'text-red-500'}`} />
                  <span>Face: {stats.faceDetections}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MicrophoneIcon className={`h-4 w-4 ${currentStatus.hasMicrophone ? 'text-green-500' : 'text-red-500'}`} />
                  <span>Audio: {stats.voiceDetections}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ComputerDesktopIcon className="h-4 w-4 text-purple-500" />
                  <span>Screen: {stats.screenDetections}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="h-4 w-4 text-orange-500" />
                  <span>Total: {stats.totalViolations}</span>
                </div>
              </div>
              
              {/* Media Access Status */}
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <span>Camera:</span>
                  <span className={currentStatus.hasCamera ? 'text-green-600' : 'text-red-600'}>
                    {currentStatus.hasCamera ? '✓ Available' : '✗ Denied'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Microphone:</span>
                  <span className={currentStatus.hasMicrophone ? 'text-green-600' : 'text-red-600'}>
                    {currentStatus.hasMicrophone ? '✓ Available' : '✗ Denied'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Detailed Statistics */}
      {showDetails && (
        <Card className="bg-gray-50">
          <div className="p-4">
            <h4 className="font-semibold mb-3">Detection Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Face Detection</div>
                <div>Detections: {stats.faceDetections}</div>
                <div>No Face: {stats.noFaceCount}</div>
                <div>Multiple: {stats.multipleFaceCount}</div>
              </div>
              <div>
                <div className="font-medium">Voice Detection</div>
                <div>Detections: {stats.voiceDetections}</div>
                <div>Anomalies: {stats.voiceAnomalies}</div>
              </div>
              <div>
                <div className="font-medium">Screen Monitoring</div>
                <div>Detections: {stats.screenDetections}</div>
                <div>Tab Switches: {stats.tabSwitches}</div>
                <div>Focus Losses: {stats.focusLosses}</div>
              </div>
            </div>
            {stats.lastDetection && (
              <div className="mt-3 text-xs text-gray-600">
                Last Detection: {formatTimestamp(stats.lastDetection)}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Violations List */}
      {showViolations && violations.length > 0 && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Recent Violations</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearViolations}
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {violations.slice(-5).reverse().map((violation) => (
                <div
                  key={violation.id}
                  className={`p-3 rounded-lg border ${getViolationColor(violation.severity)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getViolationIcon(violation.type)}
                      <span className="font-medium">{violation.description}</span>
                    </div>
                    <Badge className="text-xs">
                      {violation.severity}
                    </Badge>
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    {formatTimestamp(violation.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Controls */}
      {showControls && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant={systemActive ? "destructive" : "default"}
                  size="sm"
                  onClick={systemActive ? stop : start}
                  disabled={!isInitialized}
                >
                  {systemActive ? (
                    <>
                      <StopIcon className="h-4 w-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Start
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? (
                    <>
                      <EyeSlashIcon className="h-4 w-4 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Show Details
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <CogIcon className="h-4 w-4 mr-1" />
                  Reset System
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                Session: {sessionId.slice(-8)}
              </div>
            </div>

            {error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                {error}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}; 