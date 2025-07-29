# Anti-Cheating System Usage Guide

## Quick Start

### 1. Basic Integration

```typescript
import { useAntiCheating } from '../hooks/useAntiCheating';

function MySecureComponent() {
  const { isActive, violations, start, stop } = useAntiCheating({
    autoStart: true,
    onViolation: (violation) => {
      console.log('Violation detected:', violation);
    }
  });

  return (
    <div>
      <button onClick={isActive ? stop : start}>
        {isActive ? 'Stop' : 'Start'} Monitoring
      </button>
      <div>Violations: {violations.length}</div>
    </div>
  );
}
```

### 2. UI Component Integration

```typescript
import { AntiCheatingMonitor } from '../components/security/AntiCheatingMonitor';

function QuizPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quiz Content */}
      <div className="lg:col-span-2">
        {/* Your quiz content here */}
      </div>
      
      {/* Security Monitor */}
      <div className="lg:col-span-1">
        <AntiCheatingMonitor
          isActive={true}
          showControls={false}
          showViolations={true}
          showStats={true}
        />
      </div>
    </div>
  );
}
```

## Integration Examples

### Quiz Integration

```typescript
import { SecureQuizInterface } from '../components/quiz/SecureQuizInterface';

const sampleQuestions = [
  {
    id: '1',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2
  },
  // ... more questions
];

function QuizPage() {
  const handleComplete = (answers, violations) => {
    console.log('Quiz completed with violations:', violations);
    // Handle quiz completion
  };

  return (
    <SecureQuizInterface
      questions={sampleQuestions}
      timeLimit={30}
      onComplete={handleComplete}
      onViolation={(violation) => {
        console.log('Violation during quiz:', violation);
      }}
    />
  );
}
```

### Coding Challenge Integration

```typescript
import { useAntiCheating } from '../hooks/useAntiCheating';
import { AntiCheatingMonitor } from '../components/security/AntiCheatingMonitor';

function CodingChallengePage() {
  const { isActive, violations, start, stop } = useAntiCheating({
    config: {
      faceDetection: { enabled: true, interval: 2000 },
      voiceDetection: { enabled: true, interval: 1000 },
      screenCapture: { enabled: true, interval: 500 },
      recording: { enabled: true, maxDuration: 60 }
    },
    onViolation: (violation) => {
      if (violation.severity === 'critical') {
        // Auto-submit challenge
        submitChallenge();
      }
    }
  });

  useEffect(() => {
    start(); // Start monitoring when challenge begins
    return () => stop(); // Stop when component unmounts
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Code Editor */}
      <div className="lg:col-span-3">
        {/* Your code editor component */}
      </div>
      
      {/* Security Monitor */}
      <div className="lg:col-span-1">
        <AntiCheatingMonitor
          isActive={isActive}
          showControls={false}
          showViolations={true}
          showStats={true}
        />
      </div>
    </div>
  );
}
```

### Exam Integration

```typescript
import { useAntiCheating } from '../hooks/useAntiCheating';

function ExamPage() {
  const { isActive, violations, riskLevel, start, stop } = useAntiCheating({
    config: {
      faceDetection: {
        enabled: true,
        interval: 1000, // More frequent checks for exams
        maxFaces: 1,
        checkForMultiplePeople: true,
        checkForNoFace: true
      },
      voiceDetection: {
        enabled: true,
        interval: 1000,
        sensitivity: 0.8, // Higher sensitivity
        checkForMultipleVoices: true
      },
      screenCapture: {
        enabled: true,
        interval: 500,
        checkForTabSwitch: true,
        checkForWindowFocus: true
      },
      recording: {
        enabled: true, // Record for evidence
        video: true,
        audio: true,
        maxDuration: 120 // 2 hours
      }
    },
    onViolation: (violation) => {
      if (violation.severity === 'critical') {
        // Immediate termination
        terminateExam();
      } else if (violations.length >= 3) {
        // Auto-submit after 3 violations
        submitExam();
      }
    }
  });

  return (
    <div>
      {/* Exam content */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`p-2 rounded-lg ${
          riskLevel === 'critical' ? 'bg-red-500 text-white' :
          riskLevel === 'high' ? 'bg-orange-500 text-white' :
          riskLevel === 'medium' ? 'bg-yellow-500 text-black' :
          'bg-green-500 text-white'
        }`}>
          Risk Level: {riskLevel.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
```

## Configuration Options

### Development Mode

```typescript
const devConfig = {
  faceDetection: {
    enabled: true,
    interval: 5000, // Slower for development
    maxFaces: 1,
    checkForMultiplePeople: false, // Disable for testing
  },
  voiceDetection: {
    enabled: false, // Disable for development
  },
  screenCapture: {
    enabled: true,
    interval: 2000,
  },
  recording: {
    enabled: false, // No recording in dev
  },
  logging: {
    logToConsole: true,
    logToServer: false,
  }
};
```

### Production Mode

```typescript
const productionConfig = {
  faceDetection: {
    enabled: true,
    interval: 2000,
    maxFaces: 1,
    minConfidence: 0.7,
    checkForMultiplePeople: true,
    checkForNoFace: true,
  },
  voiceDetection: {
    enabled: true,
    interval: 1000,
    sensitivity: 0.8,
    checkForMultipleVoices: true,
    checkForSilence: false,
  },
  screenCapture: {
    enabled: true,
    interval: 500,
    checkForTabSwitch: true,
    checkForWindowFocus: true,
  },
  recording: {
    enabled: true,
    video: true,
    audio: true,
    maxDuration: 60,
  },
  logging: {
    enabled: true,
    logToServer: true,
    logToConsole: false,
    maxEvents: 1000,
  }
};
```

### High Security Mode

```typescript
const highSecurityConfig = {
  faceDetection: {
    enabled: true,
    interval: 1000, // Very frequent
    maxFaces: 1,
    minConfidence: 0.8,
    checkForMultiplePeople: true,
    checkForNoFace: true,
  },
  voiceDetection: {
    enabled: true,
    interval: 500,
    sensitivity: 0.9, // Very sensitive
    checkForMultipleVoices: true,
    checkForSilence: true,
  },
  screenCapture: {
    enabled: true,
    interval: 250, // Very frequent
    checkForTabSwitch: true,
    checkForWindowFocus: true,
  },
  recording: {
    enabled: true,
    video: true,
    audio: true,
    maxDuration: 180, // 3 hours
  }
};
```

## Event Handling

### Violation Handling

```typescript
const handleViolation = (violation: SecurityViolation) => {
  switch (violation.type) {
    case 'face':
      if (violation.severity === 'critical') {
        // Multiple people detected - immediate action
        terminateSession();
      } else if (violation.severity === 'medium') {
        // No face detected - warning
        showWarning('Please ensure your face is visible');
      }
      break;
      
    case 'voice':
      if (violation.severity === 'high') {
        // Multiple voices - serious violation
        showWarning('Multiple voices detected');
      }
      break;
      
    case 'screen':
      if (violation.severity === 'medium') {
        // Tab switching - moderate violation
        showWarning('Please stay on this page');
      }
      break;
  }
  
  // Log violation
  logViolation(violation);
};
```

### Session Termination

```typescript
const handleTermination = (reason: string) => {
  // Stop all monitoring
  stop();
  
  // Show termination message
  showTerminationModal(reason);
  
  // Auto-submit current work
  autoSubmit();
  
  // Log termination
  logTermination(reason);
};
```

## Database Integration

### Logging Violations

```typescript
import { supabase } from '../lib/supabase';

const logViolation = async (violation: SecurityViolation) => {
  try {
    const { error } = await supabase
      .from('security_events')
      .insert({
        session_id: sessionId,
        user_id: userId,
        violations: [violation],
        risk_level: violation.severity,
        timestamp: new Date().toISOString(),
        terminated: false
      });

    if (error) {
      console.error('Failed to log violation:', error);
    }
  } catch (error) {
    console.error('Error logging violation:', error);
  }
};
```

### Retrieving Security Data

```typescript
const getSecurityAnalytics = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_violation_stats', { p_user_id: userId });

    if (error) {
      console.error('Failed to get security analytics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting security analytics:', error);
    return null;
  }
};
```

## Testing

### Manual Testing

```typescript
// Test different violation types
const testViolations = () => {
  // Test face detection
  simulateViolation('face', 'critical'); // Multiple people
  
  // Test voice detection
  simulateViolation('voice', 'high'); // Multiple voices
  
  // Test screen monitoring
  simulateViolation('screen', 'medium'); // Tab switching
};

// Test system termination
const testTermination = () => {
  // Simulate critical violation
  simulateViolation('face', 'critical');
  // Should trigger termination
};
```

### Automated Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AntiCheatingMonitor } from '../components/security/AntiCheatingMonitor';

test('Anti-cheating monitor starts correctly', () => {
  const mockOnViolation = jest.fn();
  
  render(
    <AntiCheatingMonitor
      isActive={true}
      onViolation={mockOnViolation}
    />
  );
  
  expect(screen.getByText('Anti-Cheating Monitor')).toBeInTheDocument();
});
```

## Best Practices

### 1. User Experience

- **Clear Warnings**: Always inform users about security measures
- **Graceful Degradation**: System should work even if some features fail
- **Performance**: Don't impact user experience with excessive monitoring
- **Privacy**: Be transparent about data collection

### 2. Security

- **HTTPS Required**: Always use HTTPS for media access
- **Permission Handling**: Gracefully handle denied permissions
- **Data Protection**: Encrypt sensitive data
- **Audit Trail**: Maintain complete logs for review

### 3. Performance

- **Efficient Detection**: Use appropriate intervals for detection
- **Resource Management**: Clean up resources properly
- **Memory Management**: Avoid memory leaks
- **Network Optimization**: Minimize server communication

### 4. Reliability

- **Error Handling**: Handle all potential errors
- **Fallback Mechanisms**: Provide alternatives when features fail
- **Recovery**: Allow system recovery after failures
- **Monitoring**: Monitor system health

## Troubleshooting

### Common Issues

1. **Camera Access Denied**
   ```typescript
   // Check permissions
   navigator.permissions.query({ name: 'camera' }).then(result => {
     if (result.state === 'denied') {
       showPermissionError();
     }
   });
   ```

2. **Face Detection Not Working**
   ```typescript
   // Check if models are loaded
   if (!faceapi.nets.tinyFaceDetector.isLoaded) {
     console.error('Face detection models not loaded');
   }
   ```

3. **High False Positives**
   ```typescript
   // Adjust sensitivity
   const config = {
     faceDetection: {
       minConfidence: 0.8, // Increase confidence threshold
       interval: 5000, // Increase interval
     }
   };
   ```

### Debug Mode

```typescript
const debugConfig = {
  logging: {
    logToConsole: true,
    logToServer: false,
  },
  faceDetection: {
    interval: 10000, // Very slow for debugging
  },
  voiceDetection: {
    enabled: false, // Disable for debugging
  }
};
```

## Support

For additional support:

1. Check the main documentation: `ANTI_CHEATING_SYSTEM.md`
2. Test with the provided test page: `/anti-cheating-test`
3. Review browser console for errors
4. Check Supabase logs for server-side issues
5. Verify face detection models are properly loaded 