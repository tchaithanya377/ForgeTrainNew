import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  LightBulbIcon,
  TagIcon,
  FireIcon,
  TrophyIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  UserIcon,
  CalendarIcon,
  ClipboardIcon,
  PlayIcon,
  ArrowRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  ComputerDesktopIcon,
  DocumentDuplicateIcon,
  CursorArrowRaysIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { AdvancedSecurityMonitor } from '../quiz/AdvancedSecurityMonitor';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category_id?: string;
  tags: string[];
  company_tags: string[];
  supported_languages: string[];
  starter_code: Record<string, any>;
  solution_code: Record<string, any>;
  test_cases: any[];
  constraints: string;
  hints: string[];
  time_complexity: string;
  space_complexity: string;
  acceptance_rate: number;
  total_submissions: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  step_by_step_solution?: string;
  time_limit_minutes?: number;
}

interface SecurityEvent {
  type: string;
  timestamp: Date;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const difficultyStyles: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  hard: 'bg-red-100 text-red-700 border-red-300',
};

export function EnhancedCodingChallengeComponent({ 
  challenge, 
  onComplete, 
  onProgress, 
  isCompleted = false,
  progress = 0,
  lastAttempt
}: { 
  challenge: Challenge;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  isCompleted?: boolean;
  progress?: number;
  lastAttempt?: any;
}) {
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(challenge.supported_languages[0] || 'javascript');
  const [isSolving, setIsSolving] = useState(false);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isCheatingDetected, setIsCheatingDetected] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [securitySessionId, setSecuritySessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    if (!isSolving) return;

    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSolving]);

  // Security violation handlers
  const handleSecurityViolation = (event: SecurityEvent) => {
    setSecurityEvents(prev => [...prev, event]);
    setIsCheatingDetected(true);
    addWarning(`Security violation: ${event.details}`);
    
    if (event.severity === 'critical') {
      setIsLocked(true);
      handleAutoSubmit();
    }
  };

  const handleAutoSubmit = () => {
    if (!startTime) return;
    const timeSpentMinutes = Math.round(timeSpent / 60);
    onComplete?.();
    setIsSolving(false);
    addWarning('Challenge auto-submitted due to security violations');
  };

  const handleImmediateTermination = (reason: string) => {
    setIsTerminated(true);
    setIsLocked(true);
    setIsCheatingDetected(true);
    addWarning(`IMMEDIATE TERMINATION: ${reason}`);
    
    // Force immediate submission
    if (startTime) {
      const timeSpentMinutes = Math.round(timeSpent / 60);
      onComplete?.();
      setIsSolving(false);
      console.log('Immediate termination - auto-submitting with time spent:', timeSpentMinutes);
    }
  };

  const addWarning = (message: string) => {
    setWarnings(prev => [...prev, message]);
    setTimeout(() => {
      setWarnings(prev => prev.slice(1));
    }, 5000);
  };

  // Copy starter code
  const handleCopy = () => {
    if (isSolving) {
      addWarning('Copy action blocked during challenge');
      return;
    }
    navigator.clipboard.writeText(challenge.starter_code?.[selectedLanguage] || '');
  };

  // Navigate to full code solving page
  const handleStartSolving = async () => {
    setIsSolving(true);
    setStartTime(new Date());
    setTimeSpent(0);
    
    // Start security session
    try {
      const { startSecuritySession } = await import('../../lib/securityUtils');
      const sessionId = await startSecuritySession('challenge', undefined, challenge.id);
      setSecuritySessionId(sessionId);
    } catch (error) {
      console.error('Failed to start security session:', error);
      setSecuritySessionId('challenge-session-' + Date.now());
    }
    
    // Get the current URL to extract course and lesson information
    const currentUrl = window.location.href;
    const courseMatch = currentUrl.match(/\/learn\/([^\/]+)/);
    
    if (courseMatch) {
      // If we're in a course context, pass the course ID and current lesson info
      const courseId = courseMatch[1];
      const urlParams = new URLSearchParams(window.location.search);
      const lessonIndex = urlParams.get('lesson') || '0';
      
      navigate(`/challenge/${challenge.id}/solve?courseId=${courseId}&lessonIndex=${lessonIndex}`);
    } else {
      // If not in course context, navigate normally
      navigate(`/challenge/${challenge.id}/solve`);
    }
  };

  // Helper for stepper in solution
  const solutionSteps = challenge.step_by_step_solution
    ? challenge.step_by_step_solution.split(/\n\s*\n/).filter(Boolean)
    : [];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Advanced Security Monitor */}
      {isSolving && (
        <AdvancedSecurityMonitor
          onViolation={handleSecurityViolation}
          onAutoSubmit={handleAutoSubmit}
          onImmediateTermination={handleImmediateTermination}
          isActive={isSolving && !isLocked && !isTerminated}
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
            logToServer: true,
            zeroTolerance: false,
            immediateTermination: false
          }}
        />
      )}

      {/* Security Warnings */}
      <AnimatePresence>
        {warnings.map((warning, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{warning}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#094d57] to-[#f1872c] rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
            <CodeBracketIcon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
            <p className="text-white/90 text-lg leading-relaxed mb-4">
              {challenge.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${difficultyStyles[challenge.difficulty.toLowerCase()] || 'bg-white/20 border-white/30'}`}>
                {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 border border-white/30">
                {challenge.supported_languages.length > 0 ? `${challenge.supported_languages.length} Languages` : 'Multi-Language'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 border border-white/30">
                {challenge.test_cases?.length || 0} Test Cases
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 border border-white/30">
                {challenge.acceptance_rate}% Success Rate
              </span>
              {challenge.time_limit_minutes && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 border border-white/30">
                  {challenge.time_limit_minutes} Min Time Limit
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Code Section */}
      <div className="text-center mb-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CodeBracketIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Code?</h2>
          <p className="text-gray-600 mb-6">
            Take this challenge to test your programming skills and problem-solving abilities.
          </p>
          
          {/* Completion Status */}
          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Challenge Completed!</span>
              </div>
              {lastAttempt && (
                <p className="text-green-700 text-sm">
                  Score: {lastAttempt.score}% • Time: {lastAttempt.time_taken_seconds}s
                </p>
              )}
            </div>
          )}
          
          {/* Progress Indicator */}
          {!isCompleted && progress > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-blue-800 font-medium">Progress</span>
                <span className="text-blue-700 text-sm">{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-2">Enhanced Security & Integrity</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Fullscreen mode required during challenge</li>
                  <li>• Copy/paste actions are completely blocked</li>
                  <li>• Tab switching and navigation away is tracked</li>
                  <li>• Screenshot and screen recording attempts blocked</li>
                  <li>• All activities are logged for academic integrity</li>
                  <li>• Auto-submission on security violations</li>
                </ul>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleStartSolving}
            disabled={isLocked}
            className={`w-full max-w-md font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isLocked
                ? 'bg-gray-400 cursor-not-allowed'
                : isCompleted 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gradient-to-r from-[#094d57] to-[#f1872c] hover:from-[#0c5a66] hover:to-[#e67e22] text-white'
            }`}
          >
            {isLocked ? (
              <>
                <LockClosedIcon className="h-5 w-5 mr-2" />
                Challenge Locked
              </>
            ) : isCompleted ? (
              <>
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Review Solution
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5 mr-2" />
                Start Coding Challenge
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Challenge Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-blue-800 font-semibold">Time Limit</div>
          <div className="text-blue-600 text-sm">
            {challenge.time_limit_minutes ? `${challenge.time_limit_minutes} Minutes` : 'No Time Limit'}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <DocumentTextIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-green-800 font-semibold">Test Cases</div>
          <div className="text-green-600 text-sm">{challenge.test_cases?.length || 0} Cases</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <TrophyIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-purple-800 font-semibold">Success Rate</div>
          <div className="text-purple-600 text-sm">{challenge.acceptance_rate}%</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <ShieldCheckIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-orange-800 font-semibold">Security Level</div>
          <div className="text-orange-600 text-sm">Maximum</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AcademicCapIcon className="h-6 w-6 text-blue-600" />
          Instructions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Before You Start</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Read the problem description carefully</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Understand the constraints and requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Choose your preferred programming language</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Test your solution with the provided examples</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">During the Challenge</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Write clean, readable code</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Run tests to verify your solution</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Submit when all tests pass</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Use hints if you get stuck</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Academic Integrity */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheckIcon className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-red-800">Zero-Tolerance Academic Integrity</h4>
          </div>
          <ul className="space-y-1 text-sm text-red-700">
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Write your own original code - NO EXCEPTIONS</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Copy/paste is completely blocked and monitored</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Tab switching will result in immediate auto-submission</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>All violations are logged and reported</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Problem Details */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          Problem Details
        </h3>
        
        {/* Constraints */}
        {challenge.constraints && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Constraints</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm whitespace-pre-line">{challenge.constraints}</p>
            </div>
          </div>
        )}

        {/* Examples */}
        {challenge.test_cases && challenge.test_cases.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Examples</h4>
            <div className="space-y-3">
              {challenge.test_cases.slice(0, 2).map((test, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-2">Example {idx + 1}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Input:</span>
                      <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap border">{JSON.stringify(test.input, null, 2)}</pre>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Output:</span>
                      <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap border">{JSON.stringify(test.expected_output, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hints */}
        {challenge.hints && challenge.hints.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <LightBulbIcon className="h-5 w-5 text-yellow-500" />
                Hints
              </h4>
              <Button variant="outline" size="sm" onClick={() => setShowHints(!showHints)}>
                {showHints ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                {showHints ? 'Hide' : 'Show'} Hints
              </Button>
            </div>
            {showHints && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {challenge.hints.map((hint, idx) => (
                    <li key={idx} className="text-yellow-900 text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step-by-Step Solution */}
        {solutionSteps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <LightBulbIcon className="h-5 w-5 text-blue-500" />
                Step-by-Step Solution
              </h4>
              <Button variant="outline" size="sm" onClick={() => setShowSolution(!showSolution)}>
                {showSolution ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                {showSolution ? 'Hide' : 'Show'} Solution
              </Button>
            </div>
            {showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ol className="space-y-2">
                  {solutionSteps.map((step, idx) => (
                    <li key={idx} className="text-blue-900 text-sm flex items-start gap-2">
                      <span className="font-semibold text-blue-700">{idx + 1}.</span>
                      <span className="whitespace-pre-line">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Starter Code */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CodeBracketIcon className="h-6 w-6 text-blue-600" />
            Starter Code
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              {challenge.supported_languages.map(lang => (
                <button
                  key={lang}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${selectedLanguage === lang ? 'bg-gradient-to-r from-[#0c5a66] to-[#f1872c] text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              disabled={isSolving}
            >
              <ClipboardIcon className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        </div>
        <pre className="w-full bg-gray-900 text-green-200 rounded-xl p-4 font-mono text-sm border border-gray-800 whitespace-pre overflow-x-auto" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {challenge.starter_code?.[selectedLanguage] || '// No starter code available for this language.'}
        </pre>
      </div>

      {/* Topics Covered */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Topics Covered</h3>
        <div className="flex flex-wrap gap-2">
          {challenge.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
              {tag}
            </span>
          ))}
          {challenge.company_tags.map(company => (
            <span key={company} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200">
              {company}
            </span>
          ))}
        </div>
      </div>

      {/* Security Footer */}
      {isSolving && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-2 z-30">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                {isCheatingDetected ? (
                  <ExclamationTriangleIcon className="h-3 w-3" />
                ) : (
                  <ShieldCheckIcon className="h-3 w-3" />
                )}
                <span>{isCheatingDetected ? 'Cheating Detected' : 'Secure Mode Active'}</span>
              </span>
              <span>Violations: {securityEvents.length}</span>
              {isLocked && (
                <span className="flex items-center space-x-1 text-red-400">
                  <LockClosedIcon className="h-3 w-3" />
                  <span>LOCKED - Auto-submitting</span>
                </span>
              )}
              <span>Time: {formatTime(timeSpent)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <EyeIcon className="h-3 w-3" />
              <span>All activities monitored</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 