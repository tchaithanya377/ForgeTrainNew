import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  UserGroupIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import * as faceapi from 'face-api.js'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'
// REMOVE: import { openRouterClient } from '../../lib/openrouter'

interface SecurityViolation {
  id: string
  type: 'face' | 'audio' | 'object' | 'behavior' | 'device'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: Date
  evidence?: string
  aiConfidence?: number
}

interface AdvancedSecurityMonitorProps {
  onViolation: (violation: SecurityViolation) => void
  onSecurityUpdate: (status: any) => void
  isActive: boolean
}

export function AdvancedSecurityMonitor({ 
  onViolation, 
  onSecurityUpdate, 
  isActive 
}: AdvancedSecurityMonitorProps) {
  const [violations, setViolations] = React.useState<SecurityViolation[]>([])
  const [securityStatus, setSecurityStatus] = React.useState({
    faceDetection: 'initializing',
    audioMonitoring: 'initializing',
    objectDetection: 'initializing',
    behaviorAnalysis: 'initializing',
    overallRisk: 'low'
  })
  
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  
  // Face detection state
  const [faceDetectionActive, setFaceDetectionActive] = React.useState(false)
  const [lastFaceCheck, setLastFaceCheck] = React.useState<Date>(new Date())
  const [faceCount, setFaceCount] = React.useState(1)
  
  // Audio monitoring state
  const [audioLevel, setAudioLevel] = React.useState(0)
  const [voiceDetected, setVoiceDetected] = React.useState(false)
  const [suspiciousAudio, setSuspiciousAudio] = React.useState(false)
  
  // Object detection state
  const [suspiciousObjects, setSuspiciousObjects] = React.useState<string[]>([])
  const [deviceDetected, setDeviceDetected] = React.useState(false)

  // At the top of the component, add a state to track model loading
  const [modelsLoaded, setModelsLoaded] = React.useState(false)
  const [objectModel, setObjectModel] = React.useState<any>(null)

  // Load face-api.js and coco-ssd models on mount
  React.useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ])
      const cocoModel = await cocoSsd.load()
      setObjectModel(cocoModel)
      setModelsLoaded(true)
    }
    loadModels()
  }, [])

  // Initialize security monitoring
  React.useEffect(() => {
    if (isActive) {
      initializeSecuritySystems()
    } else {
      cleanupSecuritySystems()
    }

    return () => cleanupSecuritySystems()
  }, [isActive])

  const initializeSecuritySystems = async () => {
    try {
      // Request camera and microphone permissions
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      setStream(mediaStream)

      // Setup video stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }

      // Setup audio monitoring
      setupAudioMonitoring(mediaStream)
      
      // Start face detection
      startFaceDetection()
      
      // Start object detection
      startObjectDetection()
      
      // Update security status
      setSecurityStatus({
        faceDetection: 'active',
        audioMonitoring: 'active',
        objectDetection: 'active',
        behaviorAnalysis: 'active',
        overallRisk: 'low'
      })

      onSecurityUpdate({
        status: 'active',
        systems: ['face', 'audio', 'object', 'behavior'],
        timestamp: new Date()
      })

    } catch (error) {
      console.error('Failed to initialize security systems:', error)
      addViolation({
        type: 'device',
        severity: 'high',
        description: 'Failed to access camera/microphone - potential security bypass attempt'
      })
    }
  }

  const setupAudioMonitoring = (mediaStream: MediaStream) => {
    try {
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      
      const source = audioContext.createMediaStreamSource(mediaStream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      
      source.connect(analyser)
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      // Audio level monitoring
      const monitorAudio = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average)
        
        // Detect voice activity
        if (average > 30) {
          setVoiceDetected(true)
          setTimeout(() => setVoiceDetected(false), 1000)
        }
        
        // Detect suspicious audio levels (multiple voices, background noise)
        if (average > 80) {
          setSuspiciousAudio(true)
          addViolation({
            type: 'audio',
            severity: 'medium',
            description: 'High audio activity detected - possible conversation or external audio'
          })
        }
        
        if (isActive) {
          requestAnimationFrame(monitorAudio)
        }
      }
      
      monitorAudio()
      
      // Setup audio recording for AI analysis with fallback support
      try {
        // Check for supported MIME types
        const supportedTypes = [
          'audio/webm;codecs=opus',
          'audio/webm;codecs=vorbis',
          'audio/webm',
          'audio/mp4',
          'audio/ogg'
        ]
        
        let selectedMimeType = null
        for (const type of supportedTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            selectedMimeType = type
            break
          }
        }
        
        if (selectedMimeType) {
          const mediaRecorder = new MediaRecorder(mediaStream, {
            mimeType: selectedMimeType
          })
          mediaRecorderRef.current = mediaRecorder
          
          const audioChunks: Blob[] = []
          
          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data)
          }
          
          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: selectedMimeType })
            // REMOVE: await analyzeAudioWithAI(audioBlob)
          }
          
          // Record 10-second chunks for analysis
          const recordAudio = () => {
            if (mediaRecorder.state === 'inactive') {
              try {
                mediaRecorder.start()
                setTimeout(() => {
                  if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop()
                  }
                }, 10000)
              } catch (error) {
                console.warn('MediaRecorder start failed:', error)
              }
            }
            
            if (isActive) {
              setTimeout(recordAudio, 15000)
            }
          }
          
          recordAudio()
        } else {
          console.warn('No supported audio recording format found, skipping audio recording')
        }
      } catch (recordingError) {
        console.warn('Audio recording setup failed, continuing with basic monitoring:', recordingError)
      }
      
    } catch (error) {
      console.error('Audio monitoring setup failed:', error)
    }
  }

  // In startFaceDetection, update detectFaces to use face-api.js on video element
  const startFaceDetection = () => {
    setFaceDetectionActive(true)
    const detectFaces = async () => {
      if (!videoRef.current || !isActive || !modelsLoaded) return
      try {
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        setFaceCount(detections.length)
        setLastFaceCheck(new Date())
      } catch (error) {
        console.error('Face detection failed:', error)
      }
      if (isActive) {
        setTimeout(detectFaces, 2000)
      }
    }
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', detectFaces)
    }
  }

  // In startObjectDetection, use coco-ssd on video element
  const startObjectDetection = () => {
    const detectObjects = async () => {
      if (!videoRef.current || !isActive || !objectModel) return
      try {
        const predictions = await objectModel.detect(videoRef.current)
        const suspicious = predictions.filter(p => ['cell phone', 'laptop', 'book'].includes(p.class))
        setSuspiciousObjects(suspicious.map(p => p.class))
        setDeviceDetected(suspicious.some(p => p.class === 'cell phone' || p.class === 'laptop'))
      } catch (error) {
        console.error('Object detection failed:', error)
      }
      if (isActive) {
        setTimeout(detectObjects, 4000)
      }
    }
    setTimeout(detectObjects, 3000)
  }

  // REMOVE: const analyzeAudioWithAI = async (audioBlob: Blob) => { ... }

  const addViolation = (violation: Omit<SecurityViolation, 'id' | 'timestamp'>) => {
    const newViolation: SecurityViolation = {
      ...violation,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    
    setViolations(prev => [newViolation, ...prev.slice(0, 9)]) // Keep last 10
    onViolation(newViolation)
    
    // Update overall risk level
    const riskLevels = violations.map(v => v.severity)
    const hasHigh = riskLevels.includes('high') || riskLevels.includes('critical')
    const hasMedium = riskLevels.includes('medium')
    
    setSecurityStatus(prev => ({
      ...prev,
      overallRisk: hasHigh ? 'high' : hasMedium ? 'medium' : 'low'
    }))
  }

  const cleanupSecuritySystems = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    setFaceDetectionActive(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircleIcon
      case 'warning': return ExclamationTriangleIcon
      case 'error': return XCircleIcon
      default: return ClockIcon
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-blue-500'
    }
  }

  if (!isActive) return null

  return (
    <>
      {/* Hidden video and canvas for face-api.js */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
        muted
        width={320}
        height={240}
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={320}
        height={240}
      />
      {/* Security Status Overlay */}
      {/* Replace the main overlay panel with a compact, icon-based, color-coded panel */}
      <div className="fixed top-6 right-6 z-50">
        <div className="bg-white/90 shadow-xl rounded-2xl px-5 py-4 flex flex-col items-center min-w-[220px] border border-gray-200">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-semibold text-gray-800 text-base">Security</span>
            <span className="text-xs text-gray-400" title="Security system status">●</span>
          </div>
          <div className="flex flex-row items-center justify-between w-full space-x-4 mb-2">
            <div className="flex flex-col items-center" title={`Faces detected: ${faceCount}`}>
              <span className={`rounded-full p-2 ${faceCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>🧑‍🦱</span>
              <span className="text-xs mt-1">Face</span>
            </div>
            <div className="flex flex-col items-center" title={`Objects detected: ${suspiciousObjects.length}`}> 
              <span className={`rounded-full p-2 ${suspiciousObjects.length > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'}`}>📱</span>
              <span className="text-xs mt-1">Object</span>
            </div>
            <div className="flex flex-col items-center" title={`Audio: ${audioLevel > 80 ? 'High' : 'Normal'}`}> 
              <span className={`rounded-full p-2 ${audioLevel > 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>🎤</span>
              <span className="text-xs mt-1">Audio</span>
            </div>
            <div className="flex flex-col items-center" title={`Violations: ${violations.length}`}> 
              <span className={`rounded-full p-2 ${violations.length > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'}`}>⚠️</span>
              <span className="text-xs mt-1">Alerts</span>
            </div>
          </div>
          {/* Latest Alert */}
          {violations.length > 0 && (
            <div className="w-full mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 flex items-center space-x-2" title="Latest security alert">
              <span>⚠️</span>
              <span className="flex-1">{violations[0].description}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Real-time Face Detection Indicator */}
      {faceDetectionActive && (
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-full p-3"
          >
            <VideoCameraIcon className="h-6 w-6 text-green-400" />
          </motion.div>
        </div>
      )}
      
      {/* Audio Activity Indicator */}
      {voiceDetected && (
        <div className="absolute bottom-4 left-16 pointer-events-auto">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full p-3"
          >
            <MicrophoneIcon className="h-6 w-6 text-blue-400" />
          </motion.div>
        </div>
      )}
      
      {/* Device Detection Warning */}
      {deviceDetected && (
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-full p-3"
          >
            <DevicePhoneMobileIcon className="h-6 w-6 text-red-400" />
          </motion.div>
        </div>
      )}
    </>
  )
}