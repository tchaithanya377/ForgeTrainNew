import { useState, useEffect, useCallback, useRef } from 'react';
import AntiCheatingSystem, { 
  SecurityViolation, 
  SecurityEvent, 
  DetectionConfig,
  DetectionStats
} from '../lib/antiCheatingSystem';
import { useAuthStore } from '../stores/authStore';

interface UseAntiCheatingOptions {
  config?: Partial<DetectionConfig>;
  autoStart?: boolean;
  onViolation?: (violation: SecurityViolation) => void;
  onTermination?: (reason: string) => void;
  onError?: (error: string) => void;
}

interface AntiCheatingState {
  isActive: boolean;
  isInitialized: boolean;
  violations: SecurityViolation[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sessionId: string;
  error: string | null;
  isRecording: boolean;
  stats: DetectionStats;
}

export const useAntiCheating = (options: UseAntiCheatingOptions = {}) => {
  const { user } = useAuthStore();
  const [state, setState] = useState<AntiCheatingState>({
    isActive: false,
    isInitialized: false,
    violations: [],
    riskLevel: 'low',
    sessionId: '',
    error: null,
    isRecording: false,
    stats: {
      faceDetections: 0,
      voiceDetections: 0,
      screenDetections: 0,
      totalViolations: 0,
      lastDetection: null,
      noFaceCount: 0,
      multipleFaceCount: 0,
      voiceAnomalies: 0,
      tabSwitches: 0,
      focusLosses: 0
    }
  });

  const antiCheatingRef = useRef<AntiCheatingSystem | null>(null);
  const sessionIdRef = useRef<string>('');

  // Generate session ID
  const generateSessionId = useCallback(() => {
    return `session_${user?.id || 'anonymous'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, [user?.id]);

  // Initialize the anti-cheating system
  const initialize = useCallback(async () => {
    if (state.isInitialized || antiCheatingRef.current) {
      console.warn('Anti-cheating system already initialized');
      return true;
    }

    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return false;
    }

    try {
      const sessionId = generateSessionId();
      const antiCheating = new AntiCheatingSystem(sessionId, user.id, options.config);

      // Set up callbacks
      antiCheating.setCallbacks({
        onViolation: (violation) => {
          setState(prev => ({
            ...prev,
            violations: [...prev.violations, violation],
            riskLevel: calculateRiskLevel([...prev.violations, violation])
          }));
          options.onViolation?.(violation);
        },
        onTermination: (reason) => {
          setState(prev => ({ 
            ...prev, 
            isActive: false,
            error: `Session terminated: ${reason}`
          }));
          options.onTermination?.(reason);
        },
        onError: (error) => {
          setState(prev => ({ ...prev, error }));
          options.onError?.(error);
        }
      });

      // Initialize the system
      await antiCheating.initialize();

      antiCheatingRef.current = antiCheating;

      setState(prev => ({
        ...prev,
        isActive: true,
        isInitialized: true,
        sessionId,
        error: null
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, [user?.id, generateSessionId, options, state.isInitialized]);

  // Start the anti-cheating system
  const start = useCallback(async () => {
    if (!state.isInitialized) {
      return await initialize();
    }
    return true;
  }, [state.isInitialized, initialize]);

  // Stop the anti-cheating system
  const stop = useCallback(() => {
    if (antiCheatingRef.current) {
      antiCheatingRef.current.stop();
      setState(prev => ({ ...prev, isActive: false }));
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!antiCheatingRef.current) {
      setState(prev => ({ ...prev, error: 'System not initialized' }));
      return false;
    }

    try {
      await antiCheatingRef.current.startRecording();
      setState(prev => ({ ...prev, isRecording: true }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, []);

  // Get current status
  const getStatus = useCallback(() => {
    if (!antiCheatingRef.current) {
      return {
        isActive: false,
        violations: [],
        riskLevel: 'low' as const,
        sessionId: '',
        userId: user?.id || '',
        stats: {
          faceDetections: 0,
          voiceDetections: 0,
          screenDetections: 0,
          totalViolations: 0,
          lastDetection: null,
          noFaceCount: 0,
          multipleFaceCount: 0,
          voiceAnomalies: 0,
          tabSwitches: 0,
          focusLosses: 0
        },
        isFullscreen: false,
        hasCamera: false,
        hasMicrophone: false
      };
    }
    return antiCheatingRef.current.getStatus();
  }, [user?.id]);

  // Calculate risk level from violations
  const calculateRiskLevel = useCallback((violations: SecurityViolation[]): 'low' | 'medium' | 'high' | 'critical' => {
    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const highCount = violations.filter(v => v.severity === 'high').length;
    const mediumCount = violations.filter(v => v.severity === 'medium').length;

    if (criticalCount > 0) return 'critical';
    if (highCount >= 2) return 'high';
    if (highCount >= 1 || mediumCount >= 3) return 'medium';
    return 'low';
  }, []);

  // Clear violations
  const clearViolations = useCallback(() => {
    if (antiCheatingRef.current) {
      antiCheatingRef.current.clearViolations();
      setState(prev => ({
        ...prev,
        violations: [],
        riskLevel: 'low'
      }));
    }
  }, []);

  // Reset the entire system
  const reset = useCallback(() => {
    if (antiCheatingRef.current) {
      antiCheatingRef.current.reset();
      setState(prev => ({
        ...prev,
        violations: [],
        riskLevel: 'low',
        stats: {
          faceDetections: 0,
          voiceDetections: 0,
          screenDetections: 0,
          totalViolations: 0,
          lastDetection: null,
          noFaceCount: 0,
          multipleFaceCount: 0,
          voiceAnomalies: 0,
          tabSwitches: 0,
          focusLosses: 0
        }
      }));
    }
  }, []);

  // Get violation statistics
  const getViolationStats = useCallback(() => {
    const violations = state.violations;
    return {
      total: violations.length,
      byType: {
        face: violations.filter(v => v.type === 'face').length,
        voice: violations.filter(v => v.type === 'voice').length,
        screen: violations.filter(v => v.type === 'screen').length,
        behavior: violations.filter(v => v.type === 'behavior').length,
        system: violations.filter(v => v.type === 'system').length,
      },
      bySeverity: {
        low: violations.filter(v => v.severity === 'low').length,
        medium: violations.filter(v => v.severity === 'medium').length,
        high: violations.filter(v => v.severity === 'high').length,
        critical: violations.filter(v => v.severity === 'critical').length,
      }
    };
  }, [state.violations]);

  // Update stats periodically
  useEffect(() => {
    if (!state.isActive) return;

    const updateStats = () => {
      if (antiCheatingRef.current) {
        const status = antiCheatingRef.current.getStatus();
        setState(prev => ({
          ...prev,
          stats: status.stats
        }));
      }
    };

    const interval = setInterval(updateStats, 1000); // Update every second
    return () => clearInterval(interval);
  }, [state.isActive]);

  // Auto-start if enabled
  useEffect(() => {
    if (options.autoStart && user?.id && !state.isInitialized) {
      initialize();
    }
  }, [options.autoStart, user?.id, state.isInitialized, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (antiCheatingRef.current) {
        antiCheatingRef.current.stop();
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    initialize,
    start,
    stop,
    startRecording,
    clearViolations,
    reset,
    
    // Utilities
    getStatus,
    getViolationStats,
    
    // System reference
    system: antiCheatingRef.current,
  };
}; 