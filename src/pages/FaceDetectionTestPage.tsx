import React, { useState } from 'react';
import { FaceObjectDetection } from '../components/security/FaceObjectDetection';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CameraIcon, EyeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function FaceDetectionTestPage() {
  const [isActive, setIsActive] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleDetection = (result: any) => {
    console.log('Detection result:', result);
    setLastResult(result);
    setDetectionResults(prev => [...prev, result]);
  };

  const handleError = (error: string) => {
    console.error('Detection error:', error);
    alert(`Detection Error: ${error}`);
  };

  const toggleDetection = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setDetectionResults([]);
      setLastResult(null);
    }
  };

  const clearResults = () => {
    setDetectionResults([]);
    setLastResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Face & Object Detection Test
          </h1>
          <p className="text-gray-600">
            Test the face and object detection system for anti-cheating security
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detection Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CameraIcon className="h-6 w-6" />
                <span>Camera Detection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    onClick={toggleDetection}
                    className={`flex items-center space-x-2 ${
                      isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <CameraIcon className="h-4 w-4" />
                    <span>{isActive ? 'Stop Detection' : 'Start Detection'}</span>
                  </Button>
                  
                  <Button
                    onClick={clearResults}
                    variant="outline"
                    disabled={detectionResults.length === 0}
                  >
                    Clear Results
                  </Button>
                </div>

                <div className="text-sm text-gray-600">
                  <p>• Allow camera access when prompted</p>
                  <p>• The system will detect faces and suspicious objects</p>
                  <p>• Multiple faces or suspicious objects will trigger violations</p>
                  <p>• Detection runs every 3 seconds</p>
                </div>

                {/* Detection Component */}
                <FaceObjectDetection
                  isActive={isActive}
                  onDetection={handleDetection}
                  onError={handleError}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <EyeIcon className="h-6 w-6" />
                <span>Detection Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Last Result */}
                {lastResult && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Latest Detection</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Faces Detected:</span>
                        <span className="font-medium">{lastResult.faces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Objects Detected:</span>
                        <span className="font-medium">{lastResult.objects.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Risk Level:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          lastResult.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                          lastResult.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                          lastResult.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {lastResult.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Confidence:</span>
                        <span className="font-medium">{Math.round(lastResult.confidence * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Time:</span>
                        <span className="font-medium">{lastResult.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Violations */}
                    {lastResult.violations && lastResult.violations.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center space-x-2 text-red-700 mb-2">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          <span className="font-medium">Violations Detected:</span>
                        </div>
                        <ul className="text-sm text-red-600 space-y-1">
                          {lastResult.violations.map((violation: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-red-500 mt-1">•</span>
                              <span>{violation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Objects List */}
                    {lastResult.objects && lastResult.objects.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                        <h4 className="font-medium text-gray-700 mb-2">Detected Objects:</h4>
                        <div className="flex flex-wrap gap-2">
                          {lastResult.objects.map((obj: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Detection History */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Detection History</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {detectionResults.length === 0 ? (
                      <p className="text-gray-500 text-sm">No detections yet. Start the camera to begin.</p>
                    ) : (
                      detectionResults.map((result, index) => (
                        <div key={index} className="p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                          <div className="flex justify-between items-center">
                            <span>{result.timestamp.toLocaleTimeString()}</span>
                            <span className={`px-2 py-1 rounded ${
                              result.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                              result.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                              result.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {result.riskLevel}
                            </span>
                          </div>
                          <div className="mt-1 text-gray-600">
                            Faces: {result.faces} | Objects: {result.objects.length} | 
                            Confidence: {Math.round(result.confidence * 100)}%
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Test Scenarios</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Single Face:</strong> Normal behavior - should show 1 face, low risk</li>
                  <li>• <strong>Multiple Faces:</strong> Have someone else in frame - should trigger critical violation</li>
                  <li>• <strong>No Face:</strong> Turn away from camera - should trigger high risk after 3 detections</li>
                  <li>• <strong>Bright Screen:</strong> Hold phone/tablet - should detect bright screen object</li>
                  <li>• <strong>Dark Object:</strong> Hold dark device - should detect dark object</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Security Features</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Face Detection:</strong> Uses skin tone analysis to detect faces</li>
                  <li>• <strong>Object Detection:</strong> Analyzes brightness and color patterns</li>
                  <li>• <strong>Risk Assessment:</strong> Evaluates multiple factors for risk level</li>
                  <li>• <strong>Real-time Monitoring:</strong> Continuous detection every 3 seconds</li>
                  <li>• <strong>Violation Tracking:</strong> Logs all detected violations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 