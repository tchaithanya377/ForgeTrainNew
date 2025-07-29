import React, { useState, useEffect } from 'react';
import { AntiCheatingMonitor } from '../security/AntiCheatingMonitor';
import { SecurityViolation } from '../../lib/antiCheatingSystem';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface SecureQuizInterfaceProps {
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  onComplete?: (answers: Record<string, number>, violations: SecurityViolation[]) => void;
  onViolation?: (violation: SecurityViolation) => void;
  onTermination?: (reason: string) => void;
}

export const SecureQuizInterface: React.FC<SecureQuizInterfaceProps> = ({
  questions,
  timeLimit = 30,
  onComplete,
  onViolation,
  onTermination
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  // Handle violations
  const handleViolation = (violation: SecurityViolation) => {
    setViolations(prev => [...prev, violation]);
    setShowWarning(true);
    
    // Hide warning after 5 seconds
    setTimeout(() => setShowWarning(false), 5000);
    
    onViolation?.(violation);
  };

  // Handle session termination
  const handleTermination = (reason: string) => {
    setIsActive(false);
    setIsCompleted(true);
    onTermination?.(reason);
  };

  // Start the quiz
  const startQuiz = () => {
    setIsActive(true);
    setTimeRemaining(timeLimit * 60);
  };

  // Submit answer
  const submitAnswer = (answerIndex: number) => {
    const questionId = questions[currentQuestion].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));

    // Move to next question or complete
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  // Complete the quiz
  const completeQuiz = () => {
    setIsActive(false);
    setIsCompleted(true);
    onComplete?.(answers, violations);
  };

  // Timer effect
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeRemaining]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestion];

  if (!isActive && !isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center">
            <ShieldCheckIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Secure Quiz
            </h1>
            <p className="text-gray-600 mb-6">
              This quiz is protected by our anti-cheating system. Please ensure you have:
            </p>
            
            <div className="text-left max-w-md mx-auto mb-8">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  A working camera and microphone
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  A quiet, well-lit environment
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  No other people in the room
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Stable internet connection
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Quiz Information</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Questions: {questions.length}</div>
                <div>Time Limit: {timeLimit} minutes</div>
                <div>Security Level: High</div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={startQuiz}
              className="w-full max-w-xs"
            >
              Start Secure Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Quiz Completed
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {Object.keys(answers).length}
                </div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {violations.length}
                </div>
                <div className="text-sm text-gray-600">Security Violations</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(timeLimit * 60 - timeRemaining)}
                </div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>

            {violations.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Security Notice
                </h3>
                <p className="text-sm text-yellow-700">
                  {violations.length} security violation(s) were detected during this quiz. 
                  Your responses have been recorded and may be reviewed.
                </p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Take Another Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Quiz Area */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Question {currentQuestion + 1} of {questions.length}
                </h2>
                <p className="text-sm text-gray-600">
                  Select the best answer
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-mono text-lg font-semibold">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <Badge variant="secondary">
                  {Object.keys(answers).length}/{questions.length}
                </Badge>
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {currentQ.question}
              </h3>
              
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => submitAnswer(index)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Security Monitor */}
        <div className="lg:col-span-1">
          <AntiCheatingMonitor
            isActive={isActive}
            onViolation={handleViolation}
            onTermination={handleTermination}
            showControls={false}
            showViolations={true}
            showStats={true}
          />
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Security Violation Detected
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              A security violation has been detected. Please ensure you are following the quiz guidelines.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowWarning(false)}
                variant="outline"
              >
                Acknowledge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 