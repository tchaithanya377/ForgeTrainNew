import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftIcon,
  PlayIcon,
  StopIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  LightBulbIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { ModernTechLoader } from '../components/ui/ModernTechLoader'
import toast from 'react-hot-toast'
import { executeAllTests, validateCode } from '../utils/codeExecutor'
import { executeChallengeTests } from '../utils/challengeTestCases'

interface CodeChallenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category_id?: string
  tags: string[]
  company_tags: string[]
  supported_languages: string[]
  starter_code: Record<string, any>
  solution_code: Record<string, any>
  test_cases: any[]
  constraints: string
  hints: string[]
  time_complexity: string
  space_complexity: string
  acceptance_rate: number
  total_submissions: number
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
  step_by_step_solution?: string
}

interface TestResult {
  passed: boolean
  input: any
  expected: any
  actual: any
  executionTime: number
  memoryUsed: number
  status?: string
  explanation?: string
}

interface SecurityEvent {
  type: 'tab_switch' | 'fullscreen_exit' | 'copy_paste' | 'dev_tools' | 'right_click'
  timestamp: Date
  details: string
}

export function ChallengeSolvingPage() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { logFeatureUsage, logError } = useLogger()
  const queryClient = useQueryClient()

  // State management
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [isCheatingDetected, setIsCheatingDetected] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Refs
  const codeEditorRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)

  // Fetch challenge data
  const { data: challenge, isLoading, error } = useQuery({
    queryKey: ['code-challenge', challengeId],
    queryFn: async () => {
      if (!challengeId) throw new Error('Challenge ID is required')

      const { data, error } = await supabase
        .from('code_challenges')
        .select('*')
        .eq('id', challengeId)
        .eq('is_published', true)
        .single()

      if (error) throw error
      return data as CodeChallenge
    },
    enabled: !!challengeId,
  })

  // Set initial language when challenge loads
  useEffect(() => {
    if (challenge && challenge.supported_languages && challenge.supported_languages.length > 0) {
      // Set the first supported language as default
      const firstLanguage = challenge.supported_languages[0]
      setSelectedLanguage(firstLanguage)
      
      // Set initial code based on the selected language
      if (challenge.starter_code && challenge.starter_code[firstLanguage]) {
        setCode(challenge.starter_code[firstLanguage])
      } else if (challenge.starter_code && Object.keys(challenge.starter_code).length > 0) {
        // Fallback to first available starter code
        const firstStarterCode = Object.values(challenge.starter_code)[0]
        setCode(firstStarterCode)
      }
      
      console.log('Language setup:', {
        supportedLanguages: challenge.supported_languages,
        selectedLanguage: firstLanguage,
        starterCodeKeys: Object.keys(challenge.starter_code || {}),
        hasStarterCode: challenge.starter_code && challenge.starter_code[firstLanguage]
      })
    }
  }, [challenge])

  // Initialize code when challenge loads
  useEffect(() => {
    if (challenge && challenge.starter_code) {
      console.log('Challenge data:', challenge)
      console.log('Starter code:', challenge.starter_code)
      console.log('Selected language:', selectedLanguage)
      console.log('Supported languages:', challenge.supported_languages)
      
      // Ensure selected language is supported
      const supportedLanguages = challenge.supported_languages || []
      const validLanguage = supportedLanguages.includes(selectedLanguage) 
        ? selectedLanguage 
        : supportedLanguages[0] || Object.keys(challenge.starter_code)[0]
      
      // Update selected language if it's not supported
      if (validLanguage !== selectedLanguage) {
        setSelectedLanguage(validLanguage)
      }
      
      // Try to get starter code for the valid language
      let starterCode = challenge.starter_code[validLanguage] || ''
      
      // If no starter code for valid language, try to get from any available language
      if (!starterCode && Object.keys(challenge.starter_code).length > 0) {
        const firstLanguage = Object.keys(challenge.starter_code)[0]
        starterCode = challenge.starter_code[firstLanguage] || ''
        
        // Update selected language to match the available starter code
        if (starterCode && challenge.supported_languages.includes(firstLanguage)) {
          setSelectedLanguage(firstLanguage)
        }
      }
      
      // If still no starter code, provide a basic template
      if (!starterCode) {
        starterCode = getDefaultStarterCode(selectedLanguage, challenge.title)
      }
      
      console.log('Final starter code:', starterCode)
      setCode(starterCode)
    } else if (challenge) {
      // If challenge exists but no starter_code, provide default template
      const defaultCode = getDefaultStarterCode(selectedLanguage, challenge.title)
      console.log('Using default starter code:', defaultCode)
      setCode(defaultCode)
    }
  }, [challenge, selectedLanguage])

  // Start timer when component mounts
  useEffect(() => {
    setStartTime(new Date())
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 1000)
    timerRef.current = timer

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Anti-cheating measures
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const event: SecurityEvent = {
          type: 'tab_switch',
          timestamp: new Date(),
          details: 'User switched tabs or minimized window'
        }
        setSecurityEvents(prev => [...prev, event])
        setIsCheatingDetected(true)
        toast.error('Tab switching detected! This may be considered cheating.')
      }
    }

    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement
      setIsFullscreen(isFullscreenNow)
      
      if (!isFullscreenNow && isFullscreen) {
        const event: SecurityEvent = {
          type: 'fullscreen_exit',
          timestamp: new Date(),
          details: 'User exited fullscreen mode'
        }
        setSecurityEvents(prev => [...prev, event])
        setIsCheatingDetected(true)
        toast.error('Fullscreen exit detected! Please stay in fullscreen mode.')
      }
    }

    const handleCopyPaste = (e: ClipboardEvent) => {
      const event: SecurityEvent = {
        type: 'copy_paste',
        timestamp: new Date(),
        details: 'Copy/paste detected'
      }
      setSecurityEvents(prev => [...prev, event])
      setIsCheatingDetected(true)
      toast.error('Copy/paste is not allowed during the challenge!')
      e.preventDefault()
    }

    const handleRightClick = (e: MouseEvent) => {
      const event: SecurityEvent = {
        type: 'right_click',
        timestamp: new Date(),
        details: 'Right click detected'
      }
      setSecurityEvents(prev => [...prev, event])
      setIsCheatingDetected(true)
      toast.error('Right-click is disabled during the challenge!')
      e.preventDefault()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect common dev tools shortcuts
      if (
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J
        (e.ctrlKey && e.shiftKey && e.key === 'C') || // Ctrl+Shift+C
        (e.key === 'F12') || // F12
        (e.ctrlKey && e.key === 'U') // Ctrl+U (view source)
      ) {
        const event: SecurityEvent = {
          type: 'dev_tools',
          timestamp: new Date(),
          details: `Dev tools shortcut detected: ${e.key}`
        }
        setSecurityEvents(prev => [...prev, event])
        setIsCheatingDetected(true)
        toast.error('Developer tools are not allowed during the challenge!')
        e.preventDefault()
      }
    }

    // Event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('copy', handleCopyPaste)
    document.addEventListener('paste', handleCopyPaste)
    document.addEventListener('contextmenu', handleRightClick)
    document.addEventListener('keydown', handleKeyDown)

    // Request fullscreen on mount
    if (fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen().catch(() => {
        toast.error('Please enable fullscreen mode for the challenge')
      })
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('copy', handleCopyPaste)
      document.removeEventListener('paste', handleCopyPaste)
      document.removeEventListener('contextmenu', handleRightClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  // Logging
  useEffect(() => {
    if (challenge) {
      logFeatureUsage('challenge_solving_started', {
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        difficulty: challenge.difficulty
      })
    }
  }, [challenge, logFeatureUsage])

  // Get URL parameters for course context
  const urlParams = new URLSearchParams(window.location.search)
  const courseId = urlParams.get('courseId')
  const lessonIndex = urlParams.get('lessonIndex')

  // Check if user came from a course context
  const isFromCourse = React.useMemo(() => {
    return !!courseId || document.referrer.includes('/learn/')
  }, [courseId])

  const handleBack = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    if (courseId) {
      // Navigate back to specific lesson in course
      const lessonParam = lessonIndex ? `?lesson=${lessonIndex}` : ''
      navigate(`/learn/${courseId}${lessonParam}`)
      return
    } else if (isFromCourse) {
      // Fallback: extract course ID from referrer
      const courseMatch = document.referrer.match(/\/learn\/([^\/]+)/)
      if (courseMatch) {
        navigate(`/learn/${courseMatch[1]}`)
        return
      }
    }
    
    // Default fallback to challenges page
    navigate('/challenges')
  }

  const handleRunCode = async () => {
    if (!challenge || !code.trim()) return

    setIsRunning(true)
    setTestResults([])

    try {
      // Ensure we're using a supported language
      const supportedLanguages = challenge.supported_languages || []
      const validLanguage = supportedLanguages.includes(selectedLanguage) 
        ? selectedLanguage 
        : supportedLanguages[0] || 'javascript'
      
      if (validLanguage !== selectedLanguage) {
        console.log('Language corrected from', selectedLanguage, 'to', validLanguage)
        setSelectedLanguage(validLanguage)
      }
      
      // Validate code for security
      const validation = validateCode(code)
      if (!validation.isValid) {
        toast.error(`Code validation failed: ${validation.error}`)
        setTestResults([{
          passed: false,
          input: {},
          expected: {},
          actual: `Security Error: ${validation.error}`,
          executionTime: 0,
          memoryUsed: 0
        }])
        return
      }

      // Check if this is a Supabase challenge with proper test case format
      const hasSupabaseFormat = challenge.test_cases && 
        challenge.test_cases.length > 0 && 
        challenge.test_cases[0].hasOwnProperty('expected_output')

      if (hasSupabaseFormat) {
        // Use Supabase challenge execution with user's code
        const challengeResults = await executeChallengeTests(
          challenge.starter_code,
          challenge.test_cases,
          validLanguage,
          challenge.title,
          code // Pass user's submitted code
        )
        
        // Convert to TestResult format
        const testResults: TestResult[] = challengeResults.results.map(result => ({
          passed: result.result.success,
          input: result.testCase.input,
          expected: result.testCase.expected_output,
          actual: result.result.error ? `Error: ${result.result.error}` : result.result.output,
          executionTime: result.result.executionTime,
          memoryUsed: result.result.memory || 0,
          status: result.result.status,
          explanation: result.testCase.explanation
        }))
        
        setTestResults(testResults)
        
        if (challengeResults.passed === challengeResults.total) {
          toast.success(`All tests passed! (${challengeResults.passed}/${challengeResults.total})`)
        } else {
          toast.error(`Some tests failed. (${challengeResults.passed}/${challengeResults.total})`)
        }
      } else {
        // Use legacy execution for old format
        const results = await executeAllTests(code, validLanguage, challenge.test_cases, challenge.title)
        
        // Convert to TestResult format
        const testResults: TestResult[] = results.map(result => ({
          passed: result.passed,
          input: result.input,
          expected: result.expected,
          actual: result.actual,
          executionTime: result.executionTime,
          memoryUsed: result.memory || 0,
          status: result.status
        }))
        
        setTestResults(testResults)
        
        const passedTests = testResults.filter(r => r.passed).length
        const totalTests = testResults.length
        
        if (passedTests === totalTests) {
          toast.success(`All tests passed! (${passedTests}/${totalTests})`)
        } else {
          toast.error(`Some tests failed. (${passedTests}/${totalTests})`)
        }
      }
      
    } catch (error) {
      toast.error('Error running code')
      console.error('Code execution error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!challenge || !user) return

    const passedTests = testResults.filter(r => r.passed).length
    const totalTests = testResults.length
    
    if (passedTests < totalTests) {
      toast.error('Please pass all test cases before submitting')
      return
    }

    try {
      // Record submission
      const { error } = await supabase
        .from('challenge_attempts')
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          submitted_code: code,
          language: selectedLanguage,
          time_taken_seconds: timeSpent,
          is_successful: true,
          score: 100,
          security_events: securityEvents,
          submitted_at: new Date().toISOString()
        })

      if (error) {
        console.error('Challenge submission error:', error)
        
        // Check if it's a table not found error
        if (error.message?.includes('relation "challenge_attempts" does not exist')) {
          toast.error('Database table not found. Please contact support.')
          logError('challenge_attempts_table_missing', error)
        } else {
          throw error
        }
        return
      }

      toast.success('Challenge completed successfully!')
      
      // Log completion
      logFeatureUsage('challenge_completed', {
        challenge_id: challenge.id,
        time_spent: timeSpent,
        security_events_count: securityEvents.length
      })

      // Navigate back to course or challenges
      setTimeout(() => {
        if (courseId) {
          // Navigate back to specific lesson in course
          const lessonParam = lessonIndex ? `?lesson=${lessonIndex}` : ''
          navigate(`/learn/${courseId}${lessonParam}`)
        } else {
          // Default fallback to challenges page
          navigate('/challenges')
        }
      }, 2000)

    } catch (error) {
      console.error('Challenge submission failed:', error)
      toast.error('Error submitting solution')
      logError('challenge_submission_error', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <ModernTechLoader />
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenge Not Found</h3>
            <p className="text-gray-600 mb-4">
              The challenge you're looking for doesn't exist or is not published.
            </p>
            <Button onClick={handleBack} variant="outline">
              {courseId ? 'Back to Lesson' : 'Back to Challenges'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

    return (
    <div 
      ref={fullscreenRef}
      className="min-h-screen bg-white text-gray-900 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {courseId ? 'Back to Lesson' : isFromCourse ? 'Back to Course' : 'Exit Challenge'}
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{challenge.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isCheatingDetected && (
              <Badge variant="destructive" className="animate-pulse">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                Cheating Detected
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (fullscreenRef.current) {
                  fullscreenRef.current.requestFullscreen()
                }
              }}
            >
              <ArrowsPointingOutIcon className="h-4 w-4 mr-1" />
              Fullscreen
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Problem Description */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-900">
                <DocumentTextIcon className="h-5 w-5" />
                Problem Description
              </h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {challenge.description}
              </div>
            </div>

            {challenge.constraints && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-gray-900">Constraints</h3>
                <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 border border-gray-200">
                  {challenge.constraints}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-gray-900">Examples</h3>
              <div className="space-y-3">
                {challenge.test_cases.slice(0, 3).map((test, idx) => (
                  <div key={idx} className="bg-gray-100 p-3 rounded border border-gray-200">
                    <div className="text-sm font-medium mb-2 text-gray-900">Example {idx + 1}</div>
                    <div className="text-xs space-y-1">
                      <div><span className="text-gray-600">Input:</span> {JSON.stringify(test.input)}</div>
                      <div><span className="text-gray-600">Output:</span> {JSON.stringify(test.expected_output)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold flex items-center gap-2 text-gray-900">
                  <LightBulbIcon className="h-5 w-5" />
                  Hints
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHints(!showHints)}
                >
                  {showHints ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
              {showHints && (
                <ul className="list-disc ml-4 text-sm text-gray-700 space-y-1">
                  {challenge.hints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor and Results */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 bg-white p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2 text-gray-900">
                  <CodeBracketIcon className="h-5 w-5" />
                  Your Solution
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {challenge.supported_languages.map(lang => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <textarea
                ref={codeEditorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 bg-gray-50 border border-gray-300 rounded p-4 font-mono text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your solution here..."
                spellCheck={false}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRunCode}
                disabled={isRunning || !code.trim()}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <StopIcon className="h-4 w-4" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    Run Tests
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={testResults.length === 0 || testResults.some(r => !r.passed)}
                variant="primary"
                className="flex items-center gap-2"
              >
                <CheckIcon className="h-4 w-4" />
                Submit Solution
              </Button>
              

            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="h-80 bg-gray-50 border-t border-gray-200 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Test Results</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">
                      {testResults.filter(r => r.passed).length}/{testResults.length} passed
                    </span>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      testResults.every(r => r.passed)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {testResults.every(r => r.passed) ? 'All Tests Passed' : 'Some Tests Failed'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {testResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        result.passed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            Test Case {idx + 1}
                          </span>
                          {result.passed ? (
                            <CheckIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <XMarkIcon className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>⏱️ {result.executionTime.toFixed(2)}ms</span>
                          {result.memoryUsed > 0 && (
                            <span>💾 {result.memoryUsed}KB</span>
                          )}
                          {result.status && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {result.status}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {result.input && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Input:</span>
                            <div className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono text-gray-800">
                              {typeof result.input === 'string' ? result.input : JSON.stringify(result.input, null, 2)}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Expected Output:</span>
                          <div className="mt-1 p-2 bg-blue-50 rounded text-sm font-mono text-blue-800">
                            {typeof result.expected === 'string' ? (
                              result.expected.includes('\n') ? (
                                <pre className="whitespace-pre-wrap">{result.expected}</pre>
                              ) : (
                                result.expected
                              )
                            ) : (
                              JSON.stringify(result.expected, null, 2)
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Actual Output:</span>
                          <div className={`mt-1 p-2 rounded text-sm font-mono ${
                            result.passed 
                              ? 'bg-green-50 text-green-800' 
                              : 'bg-red-50 text-red-800'
                          }`}>
                            {typeof result.actual === 'string' ? (
                              result.actual.includes('\n') ? (
                                <pre className="whitespace-pre-wrap">{result.actual}</pre>
                              ) : (
                                result.actual
                              )
                            ) : (
                              JSON.stringify(result.actual, null, 2)
                            )}
                          </div>
                        </div>
                        
                        {result.explanation && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Explanation:</span>
                            <div className="mt-1 p-2 bg-yellow-50 rounded text-sm text-gray-700">
                              {result.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-700 border-green-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'hard':
      return 'bg-red-100 text-red-700 border-red-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

function getDefaultStarterCode(language: string, challengeTitle: string): string {
  const languageLower = language.toLowerCase()
  
  switch (languageLower) {
    case 'javascript':
    case 'js':
      return `// ${challengeTitle}
// Write your solution here

function solution() {
  // Your code here
  return null
}

// Test your solution
console.log(solution())`
    
    case 'python':
    case 'py':
      return `# ${challengeTitle}
# Write your solution here

def solution():
    # Your code here
    pass

# Test your solution
if __name__ == "__main__":
    print(solution())`
    
    case 'java':
      return `// ${challengeTitle}
// Write your solution here

public class Solution {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`
    
    case 'cpp':
    case 'c++':
      return `// ${challengeTitle}
// Write your solution here

#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "Hello, World!" << endl;
    return 0;
}`
    
    case 'c':
      return `// ${challengeTitle}
// Write your solution here

#include <stdio.h>

int main() {
    // Your code here
    printf("Hello, World!\\n");
    return 0;
}`
    
    default:
      return `// ${challengeTitle}
// Write your solution here

// Your code here`
  }
} 