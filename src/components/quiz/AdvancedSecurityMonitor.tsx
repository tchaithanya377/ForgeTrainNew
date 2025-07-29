import React, { useEffect, useRef, useState } from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  EyeIcon, 
  LockClosedIcon,
  ComputerDesktopIcon,
  DocumentDuplicateIcon,
  CursorArrowRaysIcon,
  KeyIcon,
  XCircleIcon,
  StopIcon,
  AlertTriangleIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { getSecurityConfig, isDevelopmentMode } from '../../config/security';
import { FaceObjectDetection } from '../security/FaceObjectDetection';

interface SecurityEvent {
  type: 'tab_switch' | 'fullscreen_exit' | 'copy_paste' | 'dev_tools' | 'right_click' | 'keyboard_shortcut' | 'screenshot' | 'multiple_windows' | 'inspect_element' | 'console_access' | 'network_monitoring' | 'process_monitoring' | 'virtual_machine' | 'debugger_detected' | 'automation_tool' | 'screen_sharing' | 'remote_access' | 'browser_extension' | 'incognito_mode' | 'time_manipulation' | 'face_detection' | 'object_detection';
  timestamp: Date;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  screenResolution?: string;
  windowSize?: string;
  mousePosition?: { x: number; y: number };
  keyboardEvents?: string[];
  networkActivity?: any;
  metadata?: any;
}

interface SecurityConfig {
  enableFullscreen: boolean;
  enableTabSwitchDetection: boolean;
  enableCopyPasteBlocking: boolean;
  enableRightClickBlocking: boolean;
  enableDevToolsBlocking: boolean;
  enableScreenshotDetection: boolean;
  enableMultipleWindowDetection: boolean;
  enableNetworkMonitoring: boolean;
  enableProcessMonitoring: boolean;
  enableMouseTracking: boolean;
  enableKeyboardTracking: boolean;
  enableScreenRecordingDetection: boolean;
  enableVirtualMachineDetection: boolean;
  enableDebuggerDetection: boolean;
  enableAutomationDetection: boolean;
  enableScreenSharingDetection: boolean;
  enableRemoteAccessDetection: boolean;
  enableExtensionDetection: boolean;
  enableIncognitoDetection: boolean;
  enableTimeManipulationDetection: boolean;
  enableFaceObjectDetection: boolean;
  maxViolations: number;
  autoSubmitOnViolation: boolean;
  logToServer: boolean;
  zeroTolerance: boolean;
  immediateTermination: boolean;
  developmentMode?: boolean; // New option for development/testing
}

interface AdvancedSecurityMonitorProps {
  onViolation: (event: SecurityEvent) => void;
  onAutoSubmit: () => void;
  onImmediateTermination?: (reason: string) => void;
  config?: Partial<SecurityConfig>;
  isActive: boolean;
}

export const AdvancedSecurityMonitor: React.FC<AdvancedSecurityMonitorProps> = ({
  onViolation,
  onAutoSubmit,
  onImmediateTermination,
  config = {},
  isActive
}) => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [violationCount, setViolationCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [mousePositions, setMousePositions] = useState<Array<{x: number, y: number, timestamp: number}>>([]);
  const [keyboardEvents, setKeyboardEvents] = useState<string[]>([]);
  const [windowFocus, setWindowFocus] = useState(true);
  const [fullscreenState, setFullscreenState] = useState(false);
  const [networkConnections, setNetworkConnections] = useState<any[]>([]);
  const [suspiciousProcesses, setSuspiciousProcesses] = useState<string[]>([]);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const [fullscreenRequested, setFullscreenRequested] = useState(false);
  const [faceDetectionData, setFaceDetectionData] = useState<any>(null);
  const [showFaceDetection, setShowFaceDetection] = useState(false);

  const securityConfig = getSecurityConfig();
  
  const defaultConfig: SecurityConfig = {
    enableFullscreen: true,
    enableTabSwitchDetection: true,
    enableCopyPasteBlocking: true,
    enableRightClickBlocking: true,
    enableDevToolsBlocking: true,
    enableScreenshotDetection: true,
    enableMultipleWindowDetection: true,
    enableNetworkMonitoring: true,
    enableProcessMonitoring: true,
    enableFaceObjectDetection: true,
    enableMouseTracking: true,
    enableKeyboardTracking: true,
    enableScreenRecordingDetection: true,
    enableVirtualMachineDetection: true,
    enableDebuggerDetection: true,
    enableAutomationDetection: true,
    enableScreenSharingDetection: true,
    enableRemoteAccessDetection: true,
    enableExtensionDetection: true,
    enableIncognitoDetection: true,
    enableTimeManipulationDetection: true,
    maxViolations: securityConfig.maxViolations,
    autoSubmitOnViolation: true,
    logToServer: securityConfig.logToServer,
    zeroTolerance: securityConfig.zeroTolerance,
    immediateTermination: securityConfig.immediateTermination,
    developmentMode: securityConfig.developmentMode
  };

  const finalConfig = { ...defaultConfig, ...config };
  const violationCountRef = useRef(0);
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mouseTrackingRef = useRef<NodeJS.Timeout | null>(null);
  const keyboardTrackingRef = useRef<NodeJS.Timeout | null>(null);
  const networkMonitoringRef = useRef<NodeJS.Timeout | null>(null);
  const processMonitoringRef = useRef<NodeJS.Timeout | null>(null);
  const securityCheckRef = useRef<NodeJS.Timeout | null>(null);
  const fullscreenCheckRef = useRef<NodeJS.Timeout | null>(null);
  const debuggerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize security monitoring with zero tolerance
  useEffect(() => {
    if (!isActive || isTerminated) return;

    const initializeSecurity = async () => {
      // Setup all security measures
      setupEventListeners();
      startMonitoringTimers();
      initializeAdvancedMonitoring();
      
      // Add initial security warning
      setSecurityWarnings(prev => [...prev, 'ZERO TOLERANCE: Any security violation will result in immediate termination']);
    };

    initializeSecurity();

    return () => {
      // Handle async cleanup properly
      enhancedCleanup().catch(error => {
        console.warn('Error during cleanup:', error);
      });
    };
  }, [isActive, isTerminated]);

  // Request fullscreen after user interaction
  useEffect(() => {
    if (isActive && finalConfig.enableFullscreen && !fullscreenRequested) {
      // Request fullscreen on next user interaction
      const requestFullscreenOnInteraction = async () => {
        try {
          // Check if already in fullscreen
          if (document.fullscreenElement || 
              (document as any).webkitFullscreenElement ||
              (document as any).mozFullScreenElement ||
              (document as any).msFullscreenElement) {
            setFullscreenState(true);
            setFullscreenRequested(true);
            return;
          }

          // Request fullscreen with proper error handling
          await document.documentElement.requestFullscreen();
          setFullscreenState(true);
          setFullscreenRequested(true);
        } catch (error) {
          console.warn('Fullscreen request failed:', error);
          // Don't terminate for fullscreen failure, just log it
          handleSecurityViolation({
            type: 'fullscreen_exit',
            timestamp: new Date(),
            details: 'Fullscreen mode not available - continuing with enhanced monitoring',
            severity: 'medium',
            metadata: { error: error.message }
          });
        }
      };

      // Request fullscreen on first click or keypress
      const handleUserInteraction = () => {
        requestFullscreenOnInteraction();
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };

      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);

      return () => {
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };
    }
  }, [isActive, finalConfig.enableFullscreen, fullscreenRequested]);

  // Enhanced security violation handler with zero tolerance
  const handleSecurityViolation = (event: SecurityEvent) => {
    if (isTerminated) return;

    setSecurityEvents(prev => [...prev, event]);
    setViolationCount(prev => prev + 1);
    violationCountRef.current += 1;

    // Log to server immediately (disabled for debugging)
    if (finalConfig.logToServer) {
      // Temporarily disable server logging to prevent 404 errors
      // logViolationToServer(event);
      console.log('Security violation (server logging disabled):', event);
    }

    // Zero tolerance: Immediate termination on ANY violation (unless in development mode)
    if (finalConfig.zeroTolerance && finalConfig.immediateTermination && !finalConfig.developmentMode) {
      setIsTerminated(true);
      setIsLocked(true);
      
      const terminationReason = `IMMEDIATE TERMINATION: ${event.type.toUpperCase()} detected - ${event.details}`;
      setSecurityWarnings(prev => [...prev, terminationReason]);
      
      // Call termination handler if provided
      if (onImmediateTermination) {
        onImmediateTermination(terminationReason);
      }
      
      // Auto-submit immediately
      if (onAutoSubmit) {
        onAutoSubmit();
      }
      
      return;
    }

    // Development mode: Log violations but don't terminate
    if (finalConfig.developmentMode) {
      console.log('🔧 DEVELOPMENT MODE: Security violation detected but not terminating:', event);
      setSecurityWarnings(prev => [...prev, `DEV MODE: ${event.type} - ${event.details}`]);
    }

    // Standard violation handling (fallback)
    if (violationCountRef.current >= finalConfig.maxViolations) {
      setIsLocked(true);
      if (onAutoSubmit) {
        onAutoSubmit();
      }
    }

    onViolation(event);
  };

  // Handle face/object detection results
  const handleFaceObjectDetection = (result: any) => {
    setFaceDetectionData(result);
    
    // Create security events based on detection results
    if (result.violations && result.violations.length > 0) {
      const event: SecurityEvent = {
        type: result.riskLevel === 'critical' ? 'face_detection' : 'object_detection',
        timestamp: new Date(),
        details: result.violations.join(', '),
        severity: result.riskLevel,
        metadata: {
          faces: result.faces,
          objects: result.objects,
          confidence: result.confidence
        }
      };
      
      handleSecurityViolation(event);
    }
  };

  // Handle face/object detection errors
  const handleFaceObjectError = (error: string) => {
    console.error('Face/Object detection error:', error);
    // Don't treat camera errors as security violations
    if (!error.includes('Camera access denied') && !error.includes('Camera error')) {
      handleSecurityViolation({
        type: 'face_detection',
        timestamp: new Date(),
        details: `Detection system error: ${error}`,
        severity: 'medium'
      });
    }
  };

  // Enhanced event listeners with stricter detection
  const setupEventListeners = () => {
    // Visibility change detection - Enhanced tab switching detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Page focus/blur detection
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    // Fullscreen change detection
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Copy/paste blocking
    if (finalConfig.enableCopyPasteBlocking) {
      document.addEventListener('copy', handleCopyPaste, true);
      document.addEventListener('paste', handleCopyPaste, true);
      document.addEventListener('cut', handleCopyPaste, true);
    }
    
    // Right-click blocking
    if (finalConfig.enableRightClickBlocking) {
      document.addEventListener('contextmenu', handleRightClick, true);
    }
    
    // Keyboard shortcuts blocking
    if (finalConfig.enableDevToolsBlocking) {
      document.addEventListener('keydown', handleKeyDown, true);
    }
    
    // Mouse tracking
    if (finalConfig.enableMouseTracking) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleMouseClick);
    }
    
    // Keyboard tracking
    if (finalConfig.enableKeyboardTracking) {
      document.addEventListener('keydown', handleKeyboardTracking);
    }
    
    // Screenshot detection
    if (finalConfig.enableScreenshotDetection) {
      document.addEventListener('keydown', handleScreenshotDetection);
    }
    
    // Storage change detection
    window.addEventListener('storage', handleStorageChange);
    
    // Before unload detection
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Page hide/show detection
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
  };

  const cleanupEventListeners = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleWindowFocus);
    window.removeEventListener('blur', handleWindowBlur);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    document.removeEventListener('copy', handleCopyPaste, true);
    document.removeEventListener('paste', handleCopyPaste, true);
    document.removeEventListener('cut', handleCopyPaste, true);
    document.removeEventListener('contextmenu', handleRightClick, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleMouseClick);
    document.removeEventListener('keydown', handleKeyboardTracking);
    document.removeEventListener('keydown', handleScreenshotDetection);
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('pagehide', handlePageHide);
    window.removeEventListener('pageshow', handlePageShow);
  };

  const startMonitoringTimers = () => {
    // Activity monitoring
    activityTimerRef.current = setInterval(() => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
      
      if (timeSinceLastActivity > 30000) { // 30 seconds of inactivity
        handleSecurityViolation({
          type: 'process_monitoring',
          timestamp: now,
          details: 'Extended period of inactivity detected - possible cheating attempt',
          severity: 'high'
        });
      }
    }, 5000); // Check every 5 seconds

    // Mouse pattern analysis
    if (finalConfig.enableMouseTracking) {
      mouseTrackingRef.current = setInterval(() => {
        analyzeMousePatterns();
      }, 10000); // Analyze every 10 seconds
    }

    // Keyboard pattern analysis
    if (finalConfig.enableKeyboardTracking) {
      keyboardTrackingRef.current = setInterval(() => {
        analyzeKeyboardPatterns();
      }, 10000); // Analyze every 10 seconds
    }

    // Network monitoring
    if (finalConfig.enableNetworkMonitoring) {
      networkMonitoringRef.current = setInterval(() => {
        setupNetworkMonitoring();
      }, 15000); // Check every 15 seconds
    }

    // Process monitoring
    if (finalConfig.enableProcessMonitoring) {
      processMonitoringRef.current = setInterval(() => {
        setupProcessMonitoring();
      }, 20000); // Check every 20 seconds
    }

    // Continuous security checks
    securityCheckRef.current = setInterval(() => {
      performContinuousSecurityChecks();
    }, 3000); // Check every 3 seconds

    // Fullscreen monitoring
    if (finalConfig.enableFullscreen) {
      fullscreenCheckRef.current = setInterval(() => {
        checkFullscreenStatus();
      }, 2000); // Check every 2 seconds
    }
  };

  const cleanupTimers = () => {
    if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    if (mouseTrackingRef.current) clearInterval(mouseTrackingRef.current);
    if (keyboardTrackingRef.current) clearInterval(keyboardTrackingRef.current);
    if (networkMonitoringRef.current) clearInterval(networkMonitoringRef.current);
    if (processMonitoringRef.current) clearInterval(processMonitoringRef.current);
    if (securityCheckRef.current) clearInterval(securityCheckRef.current);
    if (fullscreenCheckRef.current) clearInterval(fullscreenCheckRef.current);
    if (debuggerIntervalRef.current) clearInterval(debuggerIntervalRef.current);
  };

  // Enhanced cleanup with fullscreen exit
  const enhancedCleanup = async () => {
    try {
      cleanupEventListeners();
      cleanupTimers();
      await safeExitFullscreen();
    } catch (error) {
      console.warn('Error during enhanced cleanup:', error);
    }
  };

  const initializeAdvancedMonitoring = () => {
    // Detect virtual machines
    if (finalConfig.enableVirtualMachineDetection) {
      detectVirtualEnvironment();
    }

    // Detect debugging tools
    if (finalConfig.enableDebuggerDetection) {
      detectDebuggingTools();
    }

    // Detect automation tools
    if (finalConfig.enableAutomationDetection) {
      detectAutomationTools();
    }

    // Detect screen sharing
    if (finalConfig.enableScreenSharingDetection) {
      detectScreenSharing();
    }

    // Detect remote access
    if (finalConfig.enableRemoteAccessDetection) {
      detectRemoteAccess();
    }

    // Detect browser extensions
    if (finalConfig.enableExtensionDetection) {
      detectSuspiciousExtensions();
    }

    // Detect incognito mode
    if (finalConfig.enableIncognitoDetection) {
      detectIncognitoMode();
    }

    // Detect time manipulation
    if (finalConfig.enableTimeManipulationDetection) {
      detectTimeManipulation();
    }
  };

  // Enhanced violation handlers
  const handleVisibilityChange = () => {
    if (document.hidden) {
      handleSecurityViolation({
        type: 'tab_switch',
        timestamp: new Date(),
        details: 'Tab/window switch detected - immediate termination',
        severity: 'critical'
      });
    }
  };

  const handleWindowFocus = () => {
    setWindowFocus(true);
    setLastActivity(new Date());
  };

  const handleWindowBlur = () => {
    setWindowFocus(false);
    
    // Immediate termination on window blur
    handleSecurityViolation({
      type: 'multiple_windows',
      timestamp: new Date(),
      details: 'Window lost focus - possible cheating attempt - immediate termination',
      severity: 'critical'
    });
  };

  const handleFullscreenChange = () => {
    const isFullscreen = !!document.fullscreenElement || 
                        !!(document as any).webkitFullscreenElement ||
                        !!(document as any).mozFullScreenElement ||
                        !!(document as any).msFullscreenElement;
    
    setFullscreenState(isFullscreen);
    
    if (!isFullscreen && finalConfig.enableFullscreen && fullscreenRequested) {
      handleSecurityViolation({
        type: 'fullscreen_exit',
        timestamp: new Date(),
        details: 'Fullscreen mode exited - immediate termination',
        severity: 'critical'
      });
    }
  };

  const checkFullscreenStatus = () => {
    const isFullscreen = !!document.fullscreenElement || 
                        !!(document as any).webkitFullscreenElement ||
                        !!(document as any).mozFullScreenElement ||
                        !!(document as any).msFullscreenElement;
    
    if (!isFullscreen && finalConfig.enableFullscreen && fullscreenRequested) {
      handleSecurityViolation({
        type: 'fullscreen_exit',
        timestamp: new Date(),
        details: 'Fullscreen mode lost - immediate termination',
        severity: 'critical'
      });
    }
  };

  // Safe fullscreen exit function
  const safeExitFullscreen = async () => {
    try {
      // Check if in fullscreen mode
      const isFullscreen = !!document.fullscreenElement || 
                          !!(document as any).webkitFullscreenElement ||
                          !!(document as any).mozFullScreenElement ||
                          !!(document as any).msFullscreenElement;
      
      if (isFullscreen) {
        // Try standard exit first
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.warn('Error exiting fullscreen:', error);
    }
  };

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // Prevent page unload during assessment
    e.preventDefault();
    e.returnValue = '';
    
    handleSecurityViolation({
      type: 'tab_switch',
      timestamp: new Date(),
      details: 'Page unload attempt detected - immediate termination',
      severity: 'critical'
    });
  };

  const handlePageHide = () => {
    handleSecurityViolation({
      type: 'tab_switch',
      timestamp: new Date(),
      details: 'Page hide detected - immediate termination',
      severity: 'critical'
    });
  };

  const handlePageShow = () => {
    setLastActivity(new Date());
  };

  const handleCopyPaste = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    
    handleSecurityViolation({
      type: 'copy_paste',
      timestamp: new Date(),
      details: 'Copy/paste action blocked and logged - immediate termination',
      severity: 'critical'
    });
    
    return false;
  };

  const handleRightClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    handleSecurityViolation({
      type: 'right_click',
      timestamp: new Date(),
      details: 'Right-click action blocked and logged - immediate termination',
      severity: 'critical'
    });
    
    return false;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Block developer tools shortcuts
    const devToolsShortcuts = [
      { key: 'F12', ctrl: false, shift: false },
      { key: 'I', ctrl: true, shift: false },
      { key: 'J', ctrl: true, shift: false },
      { key: 'C', ctrl: true, shift: false },
      { key: 'U', ctrl: true, shift: false },
      { key: 'S', ctrl: true, shift: false },
      { key: 'R', ctrl: true, shift: false },
      { key: 'F5', ctrl: false, shift: false },
      { key: 'F5', ctrl: true, shift: false }
    ];

    const isDevToolsShortcut = devToolsShortcuts.some(shortcut => 
      e.key === shortcut.key && 
      !!e.ctrlKey === shortcut.ctrl && 
      !!e.shiftKey === shortcut.shift
    );

    if (isDevToolsShortcut) {
      e.preventDefault();
      e.stopPropagation();
      
      handleSecurityViolation({
        type: 'dev_tools',
        timestamp: new Date(),
        details: `Developer tools shortcut detected: ${e.key} - immediate termination`,
        severity: 'critical'
      });
      
      return false;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    setMousePositions(prev => [...prev.slice(-50), { x: e.clientX, y: e.clientY, timestamp: Date.now() }]);
    setLastActivity(new Date());
  };

  const handleMouseClick = (e: MouseEvent) => {
    setLastActivity(new Date());
  };

  const handleKeyboardTracking = (e: KeyboardEvent) => {
    setKeyboardEvents(prev => [...prev.slice(-20), `${e.key}:${Date.now()}`]);
    setLastActivity(new Date());
  };

  const handleScreenshotDetection = (e: KeyboardEvent) => {
    const screenshotShortcuts = [
      { key: 'PrintScreen', ctrl: false, shift: false },
      { key: 'PrintScreen', ctrl: false, shift: true },
      { key: 'S', ctrl: true, shift: true }, // Windows + Shift + S
      { key: 'S', ctrl: false, shift: true, meta: true } // Cmd + Shift + S (Mac)
    ];

    const isScreenshotShortcut = screenshotShortcuts.some(shortcut => 
      e.key === shortcut.key && 
      !!e.ctrlKey === shortcut.ctrl && 
      !!e.shiftKey === shortcut.shift &&
      (shortcut.meta ? !!e.metaKey : true)
    );

    if (isScreenshotShortcut) {
      e.preventDefault();
      e.stopPropagation();
      
      handleSecurityViolation({
        type: 'screenshot',
        timestamp: new Date(),
        details: 'Screenshot attempt detected - immediate termination',
        severity: 'critical'
      });
      
      return false;
    }
  };

  const handleStorageChange = (e: StorageEvent) => {
    // Detect external storage modifications
    if (e.key && e.key.includes('security') || e.key.includes('cheat')) {
      handleSecurityViolation({
        type: 'process_monitoring',
        timestamp: new Date(),
        details: 'Suspicious storage modification detected - immediate termination',
        severity: 'critical'
      });
    }
  };

  // Enhanced detection methods
  const setupNetworkMonitoring = () => {
    // Monitor for suspicious network activity
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType === 'slow-2g') {
        handleSecurityViolation({
          type: 'network_monitoring',
          timestamp: new Date(),
          details: 'Suspicious network conditions detected - possible VPN/proxy',
          severity: 'high'
        });
      }
    }
  };

  const setupProcessMonitoring = () => {
    // Monitor for suspicious browser behavior
    if (performance.memory) {
      const memory = performance.memory;
      if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
        handleSecurityViolation({
          type: 'process_monitoring',
          timestamp: new Date(),
          details: 'Excessive memory usage detected - possible cheating tools',
          severity: 'high'
        });
      }
    }
  };

  const analyzeMousePatterns = () => {
    if (mousePositions.length < 10) return;

    // Detect automated mouse movements
    const recentPositions = mousePositions.slice(-10);
    const distances = [];
    
    for (let i = 1; i < recentPositions.length; i++) {
      const prev = recentPositions[i - 1];
      const curr = recentPositions[i];
      const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
      distances.push(distance);
    }

    // Check for too-perfect patterns
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((a, b) => a + Math.pow(b - avgDistance, 2), 0) / distances.length;
    
    if (variance < 1) { // Too consistent
      handleSecurityViolation({
        type: 'process_monitoring',
        timestamp: new Date(),
        details: 'Automated mouse movement pattern detected - immediate termination',
        severity: 'critical'
      });
    }
  };

  const analyzeKeyboardPatterns = () => {
    if (keyboardEvents.length < 5) return;

    // Detect automated typing patterns
    const recentEvents = keyboardEvents.slice(-5);
    const intervals = [];
    
    for (let i = 1; i < recentEvents.length; i++) {
      const prev = parseInt(recentEvents[i - 1].split(':')[1]);
      const curr = parseInt(recentEvents[i].split(':')[1]);
      intervals.push(curr - prev);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
    
    if (variance < 10) { // Too consistent timing
      handleSecurityViolation({
        type: 'process_monitoring',
        timestamp: new Date(),
        details: 'Automated keyboard pattern detected - immediate termination',
        severity: 'critical'
      });
    }
  };

  const detectScreenRecording = () => {
    // Detect screen recording attempts
    if ('getDisplayMedia' in navigator) {
      navigator.mediaDevices.getDisplayMedia({ video: true })
        .then(() => {
          handleSecurityViolation({
            type: 'screen_recording',
            timestamp: new Date(),
            details: 'Screen recording attempt detected - immediate termination',
            severity: 'critical'
          });
        })
        .catch(() => {
          // Expected error, screen recording blocked
        });
    }
  };

  const detectSuspiciousExtensions = () => {
    // Detect common cheating extensions
    const suspiciousExtensions = [
      'cheat',
      'hack',
      'bot',
      'auto',
      'script',
      'inject',
      'tamper',
      'bypass'
    ];

    // Check for suspicious extension names in user agent
    const userAgent = navigator.userAgent.toLowerCase();
    const hasSuspiciousExtension = suspiciousExtensions.some(ext => 
      userAgent.includes(ext)
    );

    if (hasSuspiciousExtension) {
      handleSecurityViolation({
        type: 'browser_extension',
        timestamp: new Date(),
        details: 'Suspicious browser extension detected - immediate termination',
        severity: 'critical'
      });
    }
  };

  const detectVirtualEnvironment = () => {
    // Detect virtual machines and emulators
    const vmIndicators = [
      'vmware',
      'virtualbox',
      'parallels',
      'qemu',
      'xen',
      'hyper-v',
      'docker',
      'wine'
    ];

    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    const vendor = (navigator as any).vendor?.toLowerCase() || '';

    const isVM = vmIndicators.some(indicator => 
      userAgent.includes(indicator) || 
      platform.includes(indicator) || 
      vendor.includes(indicator)
    );

    if (isVM) {
      handleSecurityViolation({
        type: 'virtual_machine',
        timestamp: new Date(),
        details: 'Virtual machine environment detected - immediate termination',
        severity: 'critical'
      });
    }
  };

  const detectDebuggingTools = () => {
    // Detect debugging tools
    const debuggerCheck = () => {
      const startTime = performance.now();
      debugger;
      const endTime = performance.now();
      
      if (endTime - startTime > 100) {
        handleSecurityViolation({
          type: 'debugger_detected',
          timestamp: new Date(),
          details: 'Debugger detected - immediate termination',
          severity: 'critical'
        });
      }
    };

    // Run debugger check periodically
    debuggerIntervalRef.current = setInterval(debuggerCheck, 1000);
  };

  const detectAutomationTools = () => {
    // Detect automation tools like Selenium
    const automationIndicators = [
      'selenium',
      'webdriver',
      'phantomjs',
      'headless',
      'automation',
      'bot'
    ];

    const userAgent = navigator.userAgent.toLowerCase();
    const hasAutomation = automationIndicators.some(indicator => 
      userAgent.includes(indicator)
    );

    if (hasAutomation) {
      handleSecurityViolation({
        type: 'automation_tool',
        timestamp: new Date(),
        details: 'Automation tool detected - immediate termination',
        severity: 'critical'
      });
    }
  };

  const detectScreenSharing = () => {
    // Detect screen sharing software
    const screenSharingIndicators = [
      'teamviewer',
      'anydesk',
      'vnc',
      'rdp',
      'remote',
      'share'
    ];

    const userAgent = navigator.userAgent.toLowerCase();
    const hasScreenSharing = screenSharingIndicators.some(indicator => 
      userAgent.includes(indicator)
    );

    if (hasScreenSharing) {
      handleSecurityViolation({
        type: 'screen_sharing',
        timestamp: new Date(),
        details: 'Screen sharing software detected - immediate termination',
        severity: 'critical'
      });
    }
  };

  const detectRemoteAccess = () => {
    // Detect remote access tools
    const remoteAccessIndicators = [
      'remote',
      'rdp',
      'vnc',
      'ssh',
      'telnet',
      'teamviewer',
      'anydesk'
    ];

    const userAgent = navigator.userAgent.toLowerCase();
    const hasRemoteAccess = remoteAccessIndicators.some(indicator => 
      userAgent.includes(indicator)
    );

    if (hasRemoteAccess) {
      handleSecurityViolation({
        type: 'remote_access',
        timestamp: new Date(),
        details: 'Remote access tool detected - immediate termination',
        severity: 'critical'
      });
    }
  };

  const detectIncognitoMode = () => {
    // Detect incognito/private browsing
    const isIncognito = () => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return false;
      } catch (e) {
        return true;
      }
    };

    if (isIncognito()) {
      handleSecurityViolation({
        type: 'incognito_mode',
        timestamp: new Date(),
        details: 'Incognito/private browsing detected - immediate termination',
        severity: 'critical'
      });
    }
  };

  const detectTimeManipulation = () => {
    // Detect time manipulation
    const startTime = Date.now();
    
    setTimeout(() => {
      const endTime = Date.now();
      const expectedTime = startTime + 1000;
      const tolerance = 100; // 100ms tolerance
      
      if (Math.abs(endTime - expectedTime) > tolerance) {
        handleSecurityViolation({
          type: 'time_manipulation',
          timestamp: new Date(),
          details: 'Time manipulation detected - immediate termination',
          severity: 'critical'
        });
      }
    }, 1000);
  };

  const performContinuousSecurityChecks = () => {
    // Continuous security monitoring
    if (!document.hasFocus()) {
      handleSecurityViolation({
        type: 'multiple_windows',
        timestamp: new Date(),
        details: 'Window focus lost - immediate termination',
        severity: 'critical'
      });
    }

    if (document.hidden) {
      handleSecurityViolation({
        type: 'tab_switch',
        timestamp: new Date(),
        details: 'Page hidden - immediate termination',
        severity: 'critical'
      });
    }
  };

  const logViolationToServer = async (event: SecurityEvent) => {
    try {
      // Import security utilities
      const { logSecurityEvent } = await import('../../lib/securityUtils');
      
      // Log to server
      await logSecurityEvent(
        'session-id', // This should be passed from parent component
        event.type,
        event.severity,
        event.details,
        event.metadata
      );
    } catch (error) {
      console.error('Failed to log security violation:', error);
      // Don't terminate for logging failures - just log locally
    }
  };

  // Don't render anything if terminated (unless in development mode)
  if (isTerminated && !finalConfig.developmentMode) {
    return (
      <div className="fixed inset-0 bg-red-900 z-[9999] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">SECURITY VIOLATION DETECTED</h2>
          <p className="text-red-700 mb-4">
            Your session has been terminated due to a security violation.
          </p>
          <p className="text-sm text-gray-600">
            All actions have been logged and reported.
          </p>
        </div>
      </div>
    );
  }

  // Security status display
  return (
    <>
      {/* Face/Object Detection Component */}
      {finalConfig.enableFaceObjectDetection && isActive && (
        <div className="fixed bottom-4 left-4 z-[9997]">
          <FaceObjectDetection
            isActive={isActive && !isTerminated}
            onDetection={handleFaceObjectDetection}
            onError={handleFaceObjectError}
            className="w-80"
          />
        </div>
      )}

      {/* Security Status Panel */}
      <div className="fixed top-4 right-4 z-[9998]">
        <div className={`rounded-lg shadow-lg border p-4 max-w-sm ${
          finalConfig.developmentMode 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-white border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            <ShieldCheckIcon className={`h-5 w-5 ${
              finalConfig.developmentMode ? 'text-yellow-600' : 'text-red-600'
            }`} />
            <span className={`font-semibold ${
              finalConfig.developmentMode ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {finalConfig.developmentMode ? 'DEV MODE SECURITY' : 'ZERO TOLERANCE SECURITY'}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${isLocked ? 'text-red-600' : 'text-green-600'}`}>
                {isLocked ? 'LOCKED' : 'ACTIVE'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Violations:</span>
              <span className="font-medium text-red-600">{violationCount}/{finalConfig.maxViolations}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Fullscreen:</span>
              <span className={`font-medium ${fullscreenState ? 'text-green-600' : 'text-red-600'}`}>
                {fullscreenState ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Focus:</span>
              <span className={`font-medium ${windowFocus ? 'text-green-600' : 'text-red-600'}`}>
                {windowFocus ? 'ACTIVE' : 'LOST'}
              </span>
            </div>

            {/* Face Detection Status */}
            {finalConfig.enableFaceObjectDetection && faceDetectionData && (
              <div className="flex justify-between">
                <span className="text-gray-600">Face Detection:</span>
                <div className="flex items-center space-x-1">
                  <CameraIcon className="h-3 w-3" />
                  <span className="font-medium text-blue-600">
                    {faceDetectionData.faces} face{faceDetectionData.faces !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {securityWarnings.length > 0 && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <div className="text-xs text-red-700 font-medium mb-1">WARNINGS:</div>
              {securityWarnings.slice(-3).map((warning, index) => (
                <div key={index} className="text-xs text-red-600 mb-1">
                  • {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};