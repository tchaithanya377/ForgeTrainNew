import React, { useState } from 'react';
import { AntiCheatingMonitor } from '../components/security/AntiCheatingMonitor';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ComputerDesktopIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';

export const AntiCheatingTestPage: React.FC = () => {
  const [showViolationSimulator, setShowViolationSimulator] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const handleViolation = (violation: any) => {
    console.log('Violation detected:', violation);
    if (debugMode) {
      alert(`Violation: ${violation.description} (${violation.severity})`);
    }
  };

  const handleTermination = (reason: string) => {
    console.log('Session terminated:', reason);
    alert(`Session terminated: ${reason}`);
  };

  const handleError = (error: string) => {
    console.error('Anti-cheating error:', error);
    if (debugMode) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Anti-Cheating System Test
            </h1>
            <p className="text-gray-600 mb-6">
              Test the comprehensive anti-cheating system with face detection, voice monitoring, and screen capture.
            </p>
          </div>
          <Button
            variant={debugMode ? "default" : "outline"}
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
            className="flex items-center space-x-2"
          >
            <BugAntIcon className="h-4 w-4" />
            <span>{debugMode ? 'Debug ON' : 'Debug OFF'}</span>
          </Button>
        </div>
      </div>

      {/* Debug Information */}
      {debugMode && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <div className="p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug Mode Active</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Violations will show alerts</li>
              <li>• Errors will show alerts</li>
              <li>• Check browser console for detailed logs</li>
              <li>• Face detection intervals: 5 seconds</li>
              <li>• Voice detection intervals: 4 seconds</li>
              <li>• Screen detection intervals: 2 seconds</li>
            </ul>
          </div>
        </Card>
      )}

      {/* Face Detection Test Section */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <VideoCameraIcon className="h-5 w-5 mr-2 text-blue-500" />
            Face Detection Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Instructions:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Allow camera access when prompted</li>
                <li>• Look directly at the camera</li>
                <li>• Try covering your face to test no-face detection</li>
                <li>• Have someone else join to test multiple face detection</li>
                <li>• Check the detection statistics below</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Expected Behavior:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Face detection should work with proper models</li>
                <li>• No-face violations after 3 consecutive detections</li>
                <li>• Multiple face violations after 2 consecutive detections</li>
                <li>• Detection stats should increment properly</li>
                <li>• Rate limiting prevents excessive violations</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Anti-Cheating Monitor */}
      <div className="mb-6">
        <AntiCheatingMonitor
          isActive={true}
          onViolation={handleViolation}
          onTermination={handleTermination}
          onError={handleError}
          showControls={true}
          showViolations={true}
          showStats={true}
        />
      </div>

      {/* Violation Simulator */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Violation Simulator</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowViolationSimulator(!showViolationSimulator)}
            >
              {showViolationSimulator ? 'Hide' : 'Show'} Simulator
            </Button>
          </div>
          
          {showViolationSimulator && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Use these buttons to manually trigger different types of violations for testing purposes.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Simulate face violation
                    const event = new CustomEvent('simulate-violation', {
                      detail: {
                        type: 'face',
                        severity: 'medium',
                        description: 'No face detected (simulated)'
                      }
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Simulate Face Violation
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Simulate voice violation
                    const event = new CustomEvent('simulate-violation', {
                      detail: {
                        type: 'voice',
                        severity: 'low',
                        description: 'Voice anomaly detected (simulated)'
                      }
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Simulate Voice Violation
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Simulate screen violation
                    const event = new CustomEvent('simulate-violation', {
                      detail: {
                        type: 'screen',
                        severity: 'high',
                        description: 'Tab switch detected (simulated)'
                      }
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Simulate Screen Violation
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Simulate critical violation
                    const event = new CustomEvent('simulate-violation', {
                      detail: {
                        type: 'system',
                        severity: 'critical',
                        description: 'Critical security breach (simulated)'
                      }
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Simulate Critical Violation
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Face Detection Testing:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Look directly at your camera</li>
                <li>• Cover your face for 3+ seconds</li>
                <li>• Have someone else join the frame</li>
                <li>• Check if face detection counts increase</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Voice Detection Testing:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Speak normally into your microphone</li>
                <li>• Make sudden loud noises</li>
                <li>• Have multiple people speak</li>
                <li>• Check voice detection statistics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Screen Monitoring Testing:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Switch to another tab</li>
                <li>• Minimize the browser window</li>
                <li>• Use Alt+Tab to switch applications</li>
                <li>• Check focus and tab switch counts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">System Testing:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use the violation simulator above</li>
                <li>• Check if violations are counted correctly</li>
                <li>• Test the reset and clear functions</li>
                <li>• Monitor the risk level changes</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 