import React, { useState, useEffect } from 'react';
import { AdvancedSecurityMonitor } from './AdvancedSecurityMonitor';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { SecurityModeIndicator, SecurityModeSelector } from './SecurityModeIndicator';

export const SecurityDebugComponent: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [isTerminated, setIsTerminated] = useState(false);
  const [sessionId, setSessionId] = useState<string>('debug-session-' + Date.now());

  const handleSecurityViolation = (event: any) => {
    console.log('Security violation detected:', event);
    setSecurityEvents(prev => [...prev, event]);
    
    // Show immediate feedback
    if (event.severity === 'critical') {
      alert(`CRITICAL VIOLATION DETECTED: ${event.type}\n\nDetails: ${event.details}\n\nThis should trigger immediate termination.`);
    }
  };

  const handleAutoSubmit = () => {
    console.log('Auto-submit triggered');
    setIsActive(false);
  };

  const handleImmediateTermination = (reason: string) => {
    console.log('Immediate termination:', reason);
    setIsTerminated(true);
    setIsActive(false);
  };

  const startSecurityTest = () => {
    setSecurityEvents([]);
    setIsTerminated(false);
    setIsActive(true);
    setSessionId('debug-session-' + Date.now());
  };

  const stopSecurityTest = () => {
    setIsActive(false);
  };

  const testTabSwitch = () => {
    // Simulate tab switch
    window.open('about:blank', '_blank');
  };

  const testFullscreenExit = () => {
    // Try to exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const testCopyPaste = () => {
    // Try to copy something
    navigator.clipboard.writeText('test');
  };

  const testRightClick = () => {
    // Simulate right click
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    document.dispatchEvent(event);
  };

  const testDevTools = () => {
    // Try to open dev tools (this won't work due to browser restrictions)
    console.log('Attempting to open dev tools...');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Security System Debug Tool</CardTitle>
            <SecurityModeIndicator showDetails={true} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Control Panel */}
            <div className="flex space-x-4">
              <Button 
                onClick={startSecurityTest}
                disabled={isActive}
                variant="primary"
              >
                Start Security Test
              </Button>
              <Button 
                onClick={stopSecurityTest}
                disabled={!isActive}
                variant="outline"
              >
                Stop Security Test
              </Button>
            </div>

            {/* Test Buttons */}
            {isActive && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Test Security Violations:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button 
                    onClick={testTabSwitch}
                    variant="outline"
                    size="sm"
                  >
                    Test Tab Switch
                  </Button>
                  <Button 
                    onClick={testFullscreenExit}
                    variant="outline"
                    size="sm"
                  >
                    Test Fullscreen Exit
                  </Button>
                  <Button 
                    onClick={testCopyPaste}
                    variant="outline"
                    size="sm"
                  >
                    Test Copy/Paste
                  </Button>
                  <Button 
                    onClick={testRightClick}
                    variant="outline"
                    size="sm"
                  >
                    Test Right Click
                  </Button>
                  <Button 
                    onClick={testDevTools}
                    variant="outline"
                    size="sm"
                  >
                    Test Dev Tools
                  </Button>
                </div>
              </div>
            )}

            {/* Status Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Status</h3>
                <div className="space-y-1 text-sm">
                  <div>Active: <span className={isActive ? 'text-green-600' : 'text-red-600'}>{isActive ? 'Yes' : 'No'}</span></div>
                  <div>Terminated: <span className={isTerminated ? 'text-red-600' : 'text-green-600'}>{isTerminated ? 'Yes' : 'No'}</span></div>
                  <div>Session ID: <span className="text-gray-600 font-mono text-xs">{sessionId}</span></div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Events</h3>
                <div className="text-sm">
                  <div>Total Events: <span className="font-semibold">{securityEvents.length}</span></div>
                  <div>Critical: <span className="text-red-600 font-semibold">{securityEvents.filter(e => e.severity === 'critical').length}</span></div>
                  <div>High: <span className="text-orange-600 font-semibold">{securityEvents.filter(e => e.severity === 'high').length}</span></div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Environment</h3>
                <div className="space-y-1 text-sm">
                  <div>User Agent: <span className="text-gray-600 text-xs truncate block">{navigator.userAgent.substring(0, 50)}...</span></div>
                  <div>Screen: <span className="text-gray-600">{screen.width}x{screen.height}</span></div>
                  <div>Window: <span className="text-gray-600">{window.innerWidth}x{window.innerHeight}</span></div>
                </div>
              </div>
            </div>

            {/* Event Log */}
            {securityEvents.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Event Log</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {securityEvents.map((event, index) => (
                    <div key={index} className={`p-2 rounded text-sm ${
                      event.severity === 'critical' ? 'bg-red-100 border border-red-200' :
                      event.severity === 'high' ? 'bg-orange-100 border border-orange-200' :
                      event.severity === 'medium' ? 'bg-yellow-100 border border-yellow-200' :
                      'bg-blue-100 border border-blue-200'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold">{event.type}</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            event.severity === 'critical' ? 'bg-red-200 text-red-800' :
                            event.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                            event.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {event.severity}
                          </span>
                        </div>
                        <span className="text-gray-500 text-xs">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-700 mt-1">{event.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Mode Configuration */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3 text-gray-800">Security Mode Configuration</h3>
              <SecurityModeSelector />
            </div>

            {/* Instructions */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-2 text-blue-800">Instructions</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>1. Select your desired security mode above</p>
                <p>2. Click "Start Security Test" to activate the security monitor</p>
                <p>3. Use the test buttons to simulate various security violations</p>
                <p>4. Try switching tabs, right-clicking, or using keyboard shortcuts</p>
                <p>5. Monitor the event log for detected violations</p>
                <p>6. In Development mode, violations are logged but don't terminate</p>
                <p>7. In Production mode, any violation immediately terminates the session</p>
                <p>8. Use "Export Debug Data" to save all information for analysis</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Monitor */}
      {isActive && (
        <AdvancedSecurityMonitor
          onViolation={handleSecurityViolation}
          onAutoSubmit={handleAutoSubmit}
          onImmediateTermination={handleImmediateTermination}
          isActive={isActive && !isTerminated}
          config={{
            enableFullscreen: true,
            enableTabSwitchDetection: true,
            enableCopyPasteBlocking: true,
            enableRightClickBlocking: true,
            enableDevToolsBlocking: true,
            enableScreenshotDetection: true,
            enableMultipleWindowDetection: true,
            enableNetworkMonitoring: true,
            enableProcessMonitoring: true,
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
            maxViolations: 3,
            autoSubmitOnViolation: true,
            logToServer: false, // Disable server logging for debugging
            zeroTolerance: false,
            immediateTermination: false
          }}
        />
      )}
    </div>
  );
}; 