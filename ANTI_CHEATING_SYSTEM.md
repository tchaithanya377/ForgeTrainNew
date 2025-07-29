# Anti-Cheating System Implementation

## Overview

This document describes the comprehensive anti-cheating system implemented for the ForgeTrain platform. The system uses multiple detection methods to ensure academic integrity during online assessments and learning activities.

## Features

### 🎯 Detection Methods

| Purpose | Library/Tool | Status | Free |
|---------|-------------|--------|------|
| Face detection | `face-api.js` | ✅ Implemented | ✅ |
| Webcam access | `getUserMedia` (native) | ✅ Implemented | ✅ |
| Microphone voice detection | Web Audio API | ✅ Implemented | ✅ |
| Screen capture monitoring | `getDisplayMedia` | ✅ Implemented | ✅ |
| Recording capabilities | `MediaRecorder` API | ✅ Implemented | ✅ |
| Alerts / Logs Storage | Supabase Realtime + DB | ✅ Implemented | ✅ |

### 🔒 Security Levels

- **Low**: Minor violations (suspicious expressions, brief silence)
- **Medium**: Moderate violations (no face detected, tab switching)
- **High**: Serious violations (multiple voices, extended violations)
- **Critical**: Immediate termination (multiple people detected)

## Architecture

### Core Components

1. **AntiCheatingSystem** (`src/lib/antiCheatingSystem.ts`)
   - Main system class handling all detection logic
   - Manages media streams and detection intervals
   - Handles violation tracking and session termination

2. **useAntiCheating Hook** (`src/hooks/useAntiCheating.ts`)
   - React hook for easy integration
   - State management and lifecycle handling
   - Callback management for violations and errors

3. **AntiCheatingMonitor** (`src/components/security/AntiCheatingMonitor.tsx`)
   - UI component for monitoring and control
   - Real-time violation display
   - Statistics and configuration options

### Database Schema

```sql
-- Security events table
CREATE TABLE security_events (
    id UUID PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    violations JSONB NOT NULL,
    risk_level TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL,
    terminated BOOLEAN NOT NULL,
    reason TEXT
);
```

## Implementation Details

### Face Detection

```typescript
// Uses face-api.js for accurate face detection
const detections = await faceapi.detectAllFaces(
  canvas,
  new faceapi.TinyFaceDetectorOptions()
);

// Checks for multiple people
if (detections.length > maxFaces) {
  addViolation({
    type: 'face',
    severity: 'critical',
    description: `Multiple people detected (${detections.length} faces)`
  });
}
```

### Voice Detection

```typescript
// Uses Web Audio API for voice analysis
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const dataArray = new Uint8Array(bufferLength);

// Analyzes frequency patterns for multiple voices
const frequencyVariance = calculateFrequencyVariance(dataArray);
if (frequencyVariance > sensitivity) {
  addViolation({
    type: 'voice',
    severity: 'high',
    description: 'Multiple voices detected'
  });
}
```

### Screen Monitoring

```typescript
// Monitors tab focus and keyboard shortcuts
if (!document.hasFocus()) {
  addViolation({
    type: 'screen',
    severity: 'medium',
    description: 'Tab/window lost focus'
  });
}

// Detects suspicious keyboard shortcuts
document.addEventListener('keydown', (event) => {
  const suspiciousShortcuts = ['Alt+Tab', 'Ctrl+Tab', 'F11', 'F12'];
  // Check for violations...
});
```

## Usage

### Basic Integration

```typescript
import { useAntiCheating } from '../hooks/useAntiCheating';

function MyComponent() {
  const {
    isActive,
    violations,
    riskLevel,
    start,
    stop,
    clearViolations
  } = useAntiCheating({
    autoStart: true,
    onViolation: (violation) => {
      console.log('Violation detected:', violation);
    },
    onTermination: (reason) => {
      alert(`Session terminated: ${reason}`);
    }
  });

  return (
    <div>
      <button onClick={isActive ? stop : start}>
        {isActive ? 'Stop' : 'Start'} Monitoring
      </button>
      <div>Risk Level: {riskLevel}</div>
      <div>Violations: {violations.length}</div>
    </div>
  );
}
```

### Advanced Configuration

```typescript
const config = {
  faceDetection: {
    enabled: true,
    interval: 3000,
    maxFaces: 1,
    minConfidence: 0.6,
    checkForMultiplePeople: true,
    checkForNoFace: true,
  },
  voiceDetection: {
    enabled: true,
    interval: 2000,
    sensitivity: 0.7,
    checkForMultipleVoices: true,
    checkForSilence: false,
  },
  screenCapture: {
    enabled: true,
    interval: 1000,
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

const { start } = useAntiCheating({ config });
```

### UI Component

```typescript
import { AntiCheatingMonitor } from '../components/security/AntiCheatingMonitor';

function QuizPage() {
  return (
    <div>
      <h1>Quiz</h1>
      <AntiCheatingMonitor
        isActive={true}
        showControls={true}
        showViolations={true}
        showStats={true}
        onViolation={(violation) => {
          // Handle violation
        }}
        onTermination={(reason) => {
          // Handle termination
        }}
      />
      {/* Quiz content */}
    </div>
  );
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install face-api.js
```

### 2. Download Face Detection Models

```bash
node scripts/download-face-models.js
```

This will download the required face-api.js models to `public/models/`.

### 3. Run Database Migration

```bash
npx supabase db push
```

This creates the `security_events` table and related functions.

### 4. Configure Supabase Storage

Create a storage bucket for recordings:

```sql
-- In Supabase dashboard or via SQL
INSERT INTO storage.buckets (id, name, public) 
VALUES ('security-recordings', 'security-recordings', false);
```

### 5. Set Up RLS Policies

The migration includes Row Level Security policies for data protection.

## Testing

### Test Page

Visit `/anti-cheating-test` to test the system:

- **Face Detection**: Move away from camera, have multiple people in frame
- **Voice Detection**: Speak loudly, have multiple people speak
- **Screen Monitoring**: Switch tabs, use keyboard shortcuts
- **Violation Simulator**: Test different violation types and severities

### Manual Testing

```typescript
// Simulate violations for testing
const simulateViolation = (type, severity) => {
  const violation = {
    id: crypto.randomUUID(),
    type,
    severity,
    description: `Simulated ${type} violation`,
    timestamp: new Date(),
    metadata: { simulated: true },
    confidence: 0.8
  };
  handleViolation(violation);
};
```

## Security Considerations

### Privacy

- **Local Processing**: Face detection runs locally in the browser
- **Minimal Data**: Only violation metadata is sent to server
- **User Consent**: Clear permission requests for camera/microphone
- **Data Retention**: Configurable retention policies

### Performance

- **Efficient Detection**: Optimized intervals and detection algorithms
- **Resource Management**: Automatic cleanup of media streams
- **Graceful Degradation**: System continues with available features

### Reliability

- **Error Handling**: Comprehensive error handling and recovery
- **Fallback Mechanisms**: Multiple detection methods for redundancy
- **Session Recovery**: Ability to resume monitoring after interruptions

## Configuration Options

### Detection Sensitivity

```typescript
const sensitiveConfig = {
  faceDetection: {
    interval: 1000, // More frequent checks
    minConfidence: 0.8, // Higher confidence threshold
  },
  voiceDetection: {
    sensitivity: 0.5, // Lower sensitivity
  }
};
```

### Production Settings

```typescript
const productionConfig = {
  faceDetection: {
    enabled: true,
    interval: 3000,
    maxFaces: 1,
  },
  voiceDetection: {
    enabled: true,
    interval: 2000,
    sensitivity: 0.7,
  },
  screenCapture: {
    enabled: true,
    interval: 1000,
  },
  recording: {
    enabled: true, // Enable recording for evidence
    maxDuration: 60,
  },
  logging: {
    logToServer: true,
    maxEvents: 1000,
  },
};
```

## Troubleshooting

### Common Issues

1. **Camera Access Denied**
   - Ensure HTTPS is used (required for getUserMedia)
   - Check browser permissions
   - Clear site data and retry

2. **Face Detection Models Not Loading**
   - Verify models are in `public/models/`
   - Check network connectivity
   - Run the download script again

3. **High False Positives**
   - Adjust sensitivity settings
   - Increase confidence thresholds
   - Review detection intervals

4. **Performance Issues**
   - Reduce detection frequency
   - Disable unused features
   - Check browser compatibility

### Debug Mode

```typescript
const debugConfig = {
  logging: {
    logToConsole: true,
    logToServer: false,
  },
  faceDetection: {
    interval: 5000, // Slower for debugging
  }
};
```

## Future Enhancements

### Planned Features

- **AI-Powered Detection**: Machine learning for better accuracy
- **Behavioral Analysis**: Typing patterns and mouse movements
- **Network Monitoring**: Detect external communication
- **Proctoring Dashboard**: Admin interface for monitoring
- **Mobile Support**: Optimized for mobile devices

### Integration Opportunities

- **LMS Integration**: Canvas, Moodle, Blackboard
- **Video Conferencing**: Zoom, Teams integration
- **Analytics**: Advanced reporting and insights
- **API Access**: REST API for external systems

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review browser console for errors
3. Test with the provided test page
4. Check Supabase logs for server-side issues

## License

This anti-cheating system is part of the ForgeTrain platform and follows the same licensing terms. 