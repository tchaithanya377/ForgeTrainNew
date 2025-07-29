import * as faceapi from 'face-api.js';
import { supabase } from './supabase';

// Types for the anti-cheating system
export interface SecurityViolation {
  id: string;
  type: 'face' | 'voice' | 'screen' | 'behavior' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  metadata: Record<string, any>;
  confidence: number;
}

export interface SecurityEvent {
  id: string;
  sessionId: string;
  userId: string;
  violations: SecurityViolation[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  duration: number;
  terminated: boolean;
  reason?: string;
}

export interface DetectionStats {
  faceDetections: number;
  voiceDetections: number;
  screenDetections: number;
  totalViolations: number;
  lastDetection: Date | null;
  noFaceCount: number;
  multipleFaceCount: number;
  voiceAnomalies: number;
  tabSwitches: number;
  focusLosses: number;
}

export interface DetectionConfig {
  faceDetection: {
    enabled: boolean;
    interval: number; // milliseconds
    maxFaces: number;
    minConfidence: number;
    checkForMultiplePeople: boolean;
    checkForNoFace: boolean;
  };
  voiceDetection: {
    enabled: boolean;
    interval: number;
    sensitivity: number;
    checkForMultipleVoices: boolean;
    checkForSilence: boolean;
  };
  screenCapture: {
    enabled: boolean;
    interval: number;
    checkForTabSwitch: boolean;
    checkForWindowFocus: boolean;
  };
  recording: {
    enabled: boolean;
    video: boolean;
    audio: boolean;
    maxDuration: number; // minutes
  };
  logging: {
    enabled: boolean;
    logToServer: boolean;
    logToConsole: boolean;
    maxEvents: number;
  };
}

// Default configuration
export const DEFAULT_DETECTION_CONFIG: DetectionConfig = {
  faceDetection: {
    enabled: true,
    interval: 5000, // Changed from 3000 to 5000ms (5 seconds)
    maxFaces: 1,
    minConfidence: 0.6,
    checkForMultiplePeople: true,
    checkForNoFace: true,
  },
  voiceDetection: {
    enabled: true,
    interval: 4000, // Changed from 2000 to 4000ms (4 seconds)
    sensitivity: 0.7,
    checkForMultipleVoices: true,
    checkForSilence: false,
  },
  screenCapture: {
    enabled: true,
    interval: 2000, // Changed from 1000 to 2000ms (2 seconds)
    checkForTabSwitch: true,
    checkForWindowFocus: true,
  },
  recording: {
    enabled: false,
    video: true,
    audio: true,
    maxDuration: 30,
  },
  logging: {
    enabled: true,
    logToServer: true,
    logToConsole: true,
    maxEvents: 1000,
  },
};

class AntiCheatingSystem {
  private config: DetectionConfig;
  private isActive: boolean = false;
  private sessionId: string;
  private userId: string;
  private violations: SecurityViolation[] = [];
  private events: SecurityEvent[] = [];
  private detectionStats: DetectionStats = {
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
  };

  // Media streams
  private videoStream: MediaStream | null = null;
  private audioStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;

  // Detection intervals
  private faceDetectionInterval: NodeJS.Timeout | null = null;
  private voiceDetectionInterval: NodeJS.Timeout | null = null;
  private screenDetectionInterval: NodeJS.Timeout | null = null;

  // Recording
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Callbacks
  private onViolation?: (violation: SecurityViolation) => void;
  private onTermination?: (reason: string) => void;
  private onError?: (error: string) => void;

  // Face-api.js models loaded status
  private modelsLoaded: boolean = false;

  constructor(
    sessionId: string,
    userId: string,
    config: Partial<DetectionConfig> = {}
  ) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.config = { ...DEFAULT_DETECTION_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.isActive) {
      console.warn('Anti-cheating system already initialized');
      return;
    }

    try {
      console.log('Initializing anti-cheating system...');

      // Load face-api.js models
      await this.loadFaceApiModels();

      // Initialize media streams
      await this.initializeMediaStreams();

      // Start detection loops
      this.startDetectionLoops();

      this.isActive = true;
      console.log('Anti-cheating system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize anti-cheating system:', error);
      this.onError?.(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  private async loadFaceApiModels(): Promise<void> {
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      console.log('Face-api.js models loaded successfully');
      this.modelsLoaded = true;
    } catch (error) {
      console.error('Failed to load face-api.js models:', error);
      console.warn('Face detection will be disabled due to model loading failure');
      this.modelsLoaded = false;
      // Disable face detection if models fail to load
      this.config.faceDetection.enabled = false;
    }
  }

  private async initializeMediaStreams(): Promise<void> {
    try {
      // Initialize video stream for face detection
      if (this.config.faceDetection.enabled) {
        try {
          this.videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user'
            }
          });
          console.log('Video stream initialized successfully');
        } catch (error) {
          console.error('Failed to initialize video stream:', error);
          this.onError?.(`Camera access denied: ${error.message}. Please allow camera access to continue.`);
          // Don't disable face detection, just log the error
        }
      }

      // Initialize audio stream for voice detection
      if (this.config.voiceDetection.enabled) {
        try {
          this.audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          console.log('Audio stream initialized successfully');
        } catch (error) {
          console.error('Failed to initialize audio stream:', error);
          this.onError?.(`Microphone access denied: ${error.message}. Please allow microphone access to continue.`);
          // Don't disable voice detection, just log the error
        }
      }

      // Initialize screen capture for screen monitoring
      if (this.config.screenCapture.enabled) {
        try {
          this.screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
          });
          console.log('Screen capture initialized successfully');
        } catch (error) {
          console.warn('Screen capture not available:', error);
          // Screen capture is optional, don't show error
        }
      }
    } catch (error) {
      console.error('Failed to initialize media streams:', error);
      this.onError?.(`Media stream initialization failed: ${error.message}`);
    }
  }

  private startDetectionLoops(): void {
    // Start face detection loop
    if (this.config.faceDetection.enabled && this.videoStream && this.modelsLoaded) {
      this.faceDetectionInterval = setInterval(() => {
        this.performFaceDetection();
      }, this.config.faceDetection.interval);
    }

    // Start voice detection loop
    if (this.config.voiceDetection.enabled && this.audioStream) {
      this.voiceDetectionInterval = setInterval(() => {
        this.performVoiceDetection();
      }, this.config.voiceDetection.interval);
    }

    // Start screen detection loop
    if (this.config.screenCapture.enabled) {
      this.screenDetectionInterval = setInterval(() => {
        this.performScreenDetection();
      }, this.config.screenCapture.interval);
    }
  }

  private async performFaceDetection(): Promise<void> {
    // Don't perform face detection if no video stream or models not loaded
    if (!this.videoStream || !this.modelsLoaded) {
      this.detectionStats.faceDetections++;
      return;
    }

    try {
      const video = document.createElement('video');
      video.srcObject = this.videoStream;
      await video.play();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Detect faces
      const detections = await faceapi.detectAllFaces(
        canvas,
        new faceapi.TinyFaceDetectorOptions()
      );

      this.detectionStats.faceDetections++;
      this.detectionStats.lastDetection = new Date();

      // Check for no face - only if we have a valid video stream
      if (detections.length === 0 && this.config.faceDetection.checkForNoFace && video.videoWidth > 0) {
        this.detectionStats.noFaceCount++;
        if (this.detectionStats.noFaceCount >= 5) { // Increased from 3 to 5 consecutive detections
          this.addViolation({
            type: 'face',
            severity: 'medium',
            description: 'No face detected in camera',
            metadata: { consecutiveCount: this.detectionStats.noFaceCount },
            confidence: 0.8
          });
          this.detectionStats.noFaceCount = 0; // Reset counter
        }
      } else {
        this.detectionStats.noFaceCount = 0; // Reset counter
      }

      // Check for multiple faces
      if (detections.length > 1 && this.config.faceDetection.checkForMultiplePeople) {
        this.detectionStats.multipleFaceCount++;
        if (this.detectionStats.multipleFaceCount >= 3) { // Increased from 2 to 3 consecutive detections
          this.addViolation({
            type: 'face',
            severity: 'high',
            description: `Multiple faces detected (${detections.length})`,
            metadata: { 
              faceCount: detections.length,
              consecutiveCount: this.detectionStats.multipleFaceCount 
            },
            confidence: 0.9
          });
          this.detectionStats.multipleFaceCount = 0; // Reset counter
        }
      } else {
        this.detectionStats.multipleFaceCount = 0; // Reset counter
      }

      // Clean up
      video.pause();
      video.srcObject = null;
    } catch (error) {
      console.error('Face detection error:', error);
      this.detectionStats.faceDetections++;
      // Don't add violations on face detection errors
    }
  }

  private async performVoiceDetection(): Promise<void> {
    if (!this.audioStream) return;

    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(this.audioStream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 2048;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Calculate audio level
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const variance = this.calculateFrequencyVariance(dataArray);

      this.detectionStats.voiceDetections++;
      this.detectionStats.lastDetection = new Date();

      // Check for voice anomalies
      if (variance > this.config.voiceDetection.sensitivity * 100) {
        this.detectionStats.voiceAnomalies++;
        if (this.detectionStats.voiceAnomalies >= 3) {
          this.addViolation({
            type: 'voice',
            severity: 'high',
            description: 'Suspicious voice pattern detected',
            metadata: { 
              variance,
              sensitivity: this.config.voiceDetection.sensitivity,
              voiceAnomalies: this.detectionStats.voiceAnomalies 
            },
            confidence: 0.7
          });
          this.detectionStats.voiceAnomalies = 0; // Reset counter
        }
      } else {
        this.detectionStats.voiceAnomalies = 0;
      }

      audioContext.close();
    } catch (error) {
      console.error('Voice detection error:', error);
    }
  }

  private calculateFrequencyVariance(dataArray: Uint8Array): number {
    const mean = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const variance = dataArray.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / dataArray.length;
    return variance;
  }

  private performScreenDetection(): void {
    this.detectionStats.screenDetections++;
    this.detectionStats.lastDetection = new Date();

    // Check for tab switch
    if (this.config.screenCapture.checkForTabSwitch) {
      if (!document.hasFocus()) {
        this.detectionStats.tabSwitches++;
        if (this.detectionStats.tabSwitches >= 2) { // 2 consecutive detections
          this.addViolation({
            type: 'screen',
            severity: 'high',
            description: 'Tab switch detected',
            metadata: { consecutiveCount: this.detectionStats.tabSwitches },
            confidence: 0.9
          });
          this.detectionStats.tabSwitches = 0; // Reset counter
        }
      } else {
        this.detectionStats.tabSwitches = 0; // Reset counter
      }
    }

    // Check for window focus loss
    if (this.config.screenCapture.checkForWindowFocus) {
      if (!document.hasFocus()) {
        this.detectionStats.focusLosses++;
        if (this.detectionStats.focusLosses >= 3) { // 3 consecutive detections
          this.addViolation({
            type: 'screen',
            severity: 'medium',
            description: 'Window focus lost',
            metadata: { consecutiveCount: this.detectionStats.focusLosses },
            confidence: 0.8
          });
          this.detectionStats.focusLosses = 0; // Reset counter
        }
      } else {
        this.detectionStats.focusLosses = 0; // Reset counter
      }
    }
  }

  // Request fullscreen mode
  async requestFullscreen(): Promise<boolean> {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        console.log('Fullscreen mode activated');
        return true;
      }
      return true;
    } catch (error) {
      console.error('Failed to enter fullscreen mode:', error);
      this.onError?.(`Fullscreen request failed: ${error.message}`);
      return false;
    }
  }

  // Exit fullscreen mode
  exitFullscreen(): void {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        console.log('Fullscreen mode exited');
      }
    } catch (error) {
      console.error('Failed to exit fullscreen mode:', error);
    }
  }

  // Check if in fullscreen mode
  isFullscreen(): boolean {
    return !!document.fullscreenElement;
  }

  // Add a security violation
  private addViolation(violationData: Omit<SecurityViolation, 'id' | 'timestamp'>): void {
    // Maximum violation limit to prevent infinite accumulation
    if (this.violations.length >= 50) {
      console.warn('Maximum violation limit reached (50), skipping new violations');
      return;
    }

    // Rate limiting: prevent too many violations in a short time
    const now = Date.now();
    const recentViolations = this.violations.filter(v => 
      now - v.timestamp.getTime() < 15000 // Last 15 seconds (increased from 10)
    );
    
    if (recentViolations.length >= 3) { // Reduced from 5 to 3
      console.warn('Too many violations in short time, skipping:', violationData.description);
      return;
    }

    // Check for duplicate violations of the same type in the last 60 seconds
    const recentSameType = this.violations.filter(v => 
      v.type === violationData.type && 
      now - v.timestamp.getTime() < 60000 // Last 60 seconds (increased from 30)
    );
    
    if (recentSameType.length >= 2) { // Reduced from 3 to 2
      console.warn('Too many violations of same type, skipping:', violationData.description);
      return;
    }

    const violation: SecurityViolation = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...violationData
    };

    this.violations.push(violation);
    this.detectionStats.totalViolations = this.violations.length;
    
    // Log violation
    if (this.config.logging.logToConsole) {
      console.warn('Security violation detected:', violation);
    }

    // Call violation callback
    this.onViolation?.(violation);

    // Check if termination is needed
    this.checkForTermination();
  }

  // Check if session should be terminated
  private checkForTermination(): void {
    const criticalViolations = this.violations.filter(v => v.severity === 'critical');
    const highViolations = this.violations.filter(v => v.severity === 'high');
    
    if (criticalViolations.length >= 1) {
      this.terminateSession('Critical security violation detected');
    } else if (highViolations.length >= 2) {
      this.terminateSession('Multiple high-severity violations detected');
    } else if (this.violations.length >= 5) {
      this.terminateSession('Too many security violations');
    }
  }

  // Clear all violations (for testing/reset purposes)
  clearViolations(): void {
    this.violations = [];
    this.detectionStats.totalViolations = 0;
    this.detectionStats.noFaceCount = 0;
    this.detectionStats.multipleFaceCount = 0;
    this.detectionStats.voiceAnomalies = 0;
    this.detectionStats.tabSwitches = 0;
    this.detectionStats.focusLosses = 0;
    console.log('All violations cleared');
  }

  // Reset the entire system
  reset(): void {
    this.clearViolations();
    this.detectionStats = {
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
    };
    console.log('Anti-cheating system reset');
  }

  // Terminate the session
  private terminateSession(reason: string): void {
    this.stop();
    
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      sessionId: this.sessionId,
      userId: this.userId,
      violations: [...this.violations],
      riskLevel: this.calculateRiskLevel(),
      timestamp: new Date(),
      duration: Date.now() - new Date(this.violations[0]?.timestamp || Date.now()).getTime(),
      terminated: true,
      reason
    };

    this.events.push(event);
    
    // Log to server
    if (this.config.logging.logToServer) {
      this.logEventToServer(event);
    }

    // Call termination callback
    this.onTermination?.(reason);
  }

  // Calculate overall risk level
  private calculateRiskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = this.violations.filter(v => v.severity === 'critical').length;
    const highCount = this.violations.filter(v => v.severity === 'high').length;
    const mediumCount = this.violations.filter(v => v.severity === 'medium').length;

    if (criticalCount > 0) return 'critical';
    if (highCount >= 2) return 'high';
    if (highCount >= 1 || mediumCount >= 3) return 'medium';
    return 'low';
  }

  // Log event to server
  private async logEventToServer(event: SecurityEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_events')
        .insert({
          id: event.id,
          session_id: event.sessionId,
          user_id: event.userId,
          violations: event.violations,
          risk_level: event.riskLevel,
          timestamp: event.timestamp.toISOString(),
          duration: event.duration,
          terminated: event.terminated,
          reason: event.reason
        });

      if (error) {
        console.error('Failed to log security event to server:', error);
      }
    } catch (error) {
      console.error('Error logging to server:', error);
    }
  }

  // Start recording
  async startRecording(): Promise<void> {
    if (!this.config.recording.enabled) {
      throw new Error('Recording is not enabled in configuration');
    }

    try {
      const streams: MediaStreamTrack[] = [];
      
      if (this.config.recording.video && this.videoStream) {
        streams.push(...this.videoStream.getVideoTracks());
      }
      
      if (this.config.recording.audio && this.audioStream) {
        streams.push(...this.audioStream.getAudioTracks());
      }

      if (streams.length === 0) {
        throw new Error('No media tracks available for recording');
      }

      const combinedStream = new MediaStream(streams);
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      this.recordedChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.saveRecording(blob);
      };

      this.mediaRecorder.start();

      // Stop recording after max duration
      setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }, this.config.recording.maxDuration * 60 * 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError?.(`Recording failed: ${error.message}`);
    }
  }

  // Save recording
  private async saveRecording(blob: Blob): Promise<void> {
    try {
      const fileName = `recording_${this.sessionId}_${Date.now()}.webm`;
      const file = new File([blob], fileName, { type: 'video/webm' });

      const { error } = await supabase.storage
        .from('security-recordings')
        .upload(fileName, file);

      if (error) {
        console.error('Failed to save recording:', error);
      } else {
        console.log('Recording saved successfully');
      }
    } catch (error) {
      console.error('Error saving recording:', error);
    }
  }

  // Set callbacks
  setCallbacks(callbacks: {
    onViolation?: (violation: SecurityViolation) => void;
    onTermination?: (reason: string) => void;
    onError?: (error: string) => void;
  }): void {
    this.onViolation = callbacks.onViolation;
    this.onTermination = callbacks.onTermination;
    this.onError = callbacks.onError;
  }

  // Get current status with detailed statistics
  getStatus(): {
    isActive: boolean;
    violations: SecurityViolation[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    sessionId: string;
    userId: string;
    stats: DetectionStats;
    isFullscreen: boolean;
    hasCamera: boolean;
    hasMicrophone: boolean;
  } {
    return {
      isActive: this.isActive,
      violations: [...this.violations],
      riskLevel: this.calculateRiskLevel(),
      sessionId: this.sessionId,
      userId: this.userId,
      stats: { ...this.detectionStats },
      isFullscreen: this.isFullscreen(),
      hasCamera: !!this.videoStream,
      hasMicrophone: !!this.audioStream
    };
  }

  // Stop the anti-cheating system
  stop(): void {
    this.isActive = false;

    // Clear intervals
    if (this.faceDetectionInterval) {
      clearInterval(this.faceDetectionInterval);
      this.faceDetectionInterval = null;
    }
    if (this.voiceDetectionInterval) {
      clearInterval(this.voiceDetectionInterval);
      this.voiceDetectionInterval = null;
    }
    if (this.screenDetectionInterval) {
      clearInterval(this.screenDetectionInterval);
      this.screenDetectionInterval = null;
    }

    // Stop recording
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    // Stop media streams
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    console.log('Anti-cheating system stopped');
  }
}

export default AntiCheatingSystem; 