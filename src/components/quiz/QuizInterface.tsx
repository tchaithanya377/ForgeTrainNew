import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClockIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  BookmarkIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  PuzzlePieceIcon,
  PencilIcon,
  ListBulletIcon,
  CheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  question_type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank' | 'drag_drop' | 'image_based' | 'video_based'
  options: string[] | null
  correct_answer: string | string[]
  explanation: string
  points: number
  order_index: number
  media_url?: string
  drag_items?: Array<{ id: string; text: string; category: string }>
  drop_zones?: Array<{ id: string; text: string; accepts: string[] }>
  blanks?: Array<{ id: string; position: number; answer: string }>
}

interface QuizInterfaceProps {
  quiz: {
    id: string
    title: string
    description: string
    difficulty: string
    time_limit_minutes: number
    passing_score: number
    tags: string[]
  }
  questions: QuizQuestion[]
  onSubmit: (answers: Record<string, any>, timeSpent: number, securityFlags: any) => void
  onExit: () => void
}

export function QuizInterface({ quiz, questions, onSubmit, onExit }: QuizInterfaceProps) {
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = React.useState(quiz.time_limit_minutes * 60)
  const [quizStarted, setQuizStarted] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [startTime, setStartTime] = React.useState<Date | null>(null)
  const [bookmarkedQuestions, setBookmarkedQuestions] = React.useState<Set<string>>(new Set())
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)

  // Auto-save state
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = React.useState(true)

  // Security monitoring
  const [securityFlags, setSecurityFlags] = React.useState({
    tabSwitches: 0,
    copyAttempts: 0,
    pasteAttempts: 0,
    rightClicks: 0,
    suspiciousActivity: 0,
  })
  const [warnings, setWarnings] = React.useState<string[]>([])

  // Drag and drop state
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null)
  const [dropZoneAnswers, setDropZoneAnswers] = React.useState<Record<string, string[]>>({})

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const answeredQuestions = Object.keys(answers).length
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100

  // Timer effect
  React.useEffect(() => {
    if (!quizStarted || isPaused || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, isPaused, timeRemaining])

  // Auto-save effect
  React.useEffect(() => {
    if (!autoSaveEnabled || !quizStarted) return

    const autoSaveTimer = setInterval(() => {
      saveProgress()
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer)
  }, [answers, autoSaveEnabled, quizStarted])

  // Security monitoring
  React.useEffect(() => {
    if (!quizStarted) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSecurityFlags(prev => ({ ...prev, tabSwitches: prev.tabSwitches + 1 }))
        addWarning('Tab switching detected! Please stay on this page.')
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      setSecurityFlags(prev => ({ ...prev, rightClicks: prev.rightClicks + 1 }))
      addWarning('Right-click is disabled during the quiz.')
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault()
          setSecurityFlags(prev => ({ ...prev, copyAttempts: prev.copyAttempts + 1 }))
          addWarning('Copy action blocked!')
        }
        if (e.key === 'v' || e.key === 'V') {
          e.preventDefault()
          setSecurityFlags(prev => ({ ...prev, pasteAttempts: prev.pasteAttempts + 1 }))
          addWarning('Paste action blocked!')
        }
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault()
        setSecurityFlags(prev => ({ ...prev, suspiciousActivity: prev.suspiciousActivity + 1 }))
        addWarning('Developer tools access blocked!')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [quizStarted])

  // Add fullscreen logic
  React.useEffect(() => {
    if (quizStarted) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          // If user exits fullscreen, force it back
          if (quizStarted) {
            if (elem.requestFullscreen) {
              elem.requestFullscreen();
            } else if ((elem as any).webkitRequestFullscreen) {
              (elem as any).webkitRequestFullscreen();
            } else if ((elem as any).msRequestFullscreen) {
              (elem as any).msRequestFullscreen();
            }
          }
        }
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      };
    }
  }, [quizStarted]);

  const addWarning = (message: string) => {
    setWarnings(prev => [...prev, message])
    setTimeout(() => {
      setWarnings(prev => prev.slice(1))
    }, 5000)
  }

  const saveProgress = () => {
    localStorage.setItem(`quiz_progress_${quiz.id}`, JSON.stringify({
      answers,
      currentQuestionIndex,
      timeRemaining,
      bookmarkedQuestions: Array.from(bookmarkedQuestions),
      timestamp: new Date().toISOString()
    }))
    setLastSaved(new Date())
  }

  const loadProgress = () => {
    const saved = localStorage.getItem(`quiz_progress_${quiz.id}`)
    if (saved) {
      const data = JSON.parse(saved)
      setAnswers(data.answers || {})
      setCurrentQuestionIndex(data.currentQuestionIndex || 0)
      setTimeRemaining(data.timeRemaining || quiz.time_limit_minutes * 60)
      setBookmarkedQuestions(new Set(data.bookmarkedQuestions || []))
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setStartTime(new Date())
    
    // Check for saved progress
    const saved = localStorage.getItem(`quiz_progress_${quiz.id}`)
    if (saved) {
      const shouldResume = window.confirm('You have saved progress for this quiz. Would you like to resume?')
      if (shouldResume) {
        loadProgress()
      }
    }
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleMultipleSelectChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || []
      if (checked) {
        return { ...prev, [questionId]: [...currentAnswers, option] }
      } else {
        return { ...prev, [questionId]: currentAnswers.filter((a: string) => a !== option) }
      }
    })
  }

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropZoneId: string) => {
    e.preventDefault()
    if (!draggedItem || !currentQuestion) return

    const dropZone = currentQuestion.drop_zones?.find(zone => zone.id === dropZoneId)
    const dragItem = currentQuestion.drag_items?.find(item => item.id === draggedItem)

    if (dropZone && dragItem && dropZone.accepts.includes(dragItem.category)) {
      setDropZoneAnswers(prev => ({
        ...prev,
        [dropZoneId]: [...(prev[dropZoneId] || []), draggedItem]
      }))
      
      handleAnswerChange(currentQuestion.id, {
        ...dropZoneAnswers,
        [dropZoneId]: [...(dropZoneAnswers[dropZoneId] || []), draggedItem]
      })
    }

    setDraggedItem(null)
  }

  const handleAutoSubmit = () => {
    if (!startTime) return
    const timeSpent = Math.round((Date.now() - startTime.getTime()) / 1000 / 60)
    onSubmit(answers, timeSpent, securityFlags)
  }

  const handleSubmitQuiz = () => {
    if (!startTime) return
    const timeSpent = Math.round((Date.now() - startTime.getTime()) / 1000 / 60)
    localStorage.removeItem(`quiz_progress_${quiz.id}`)
    onSubmit(answers, timeSpent, securityFlags)
  }

  const toggleBookmark = (questionId: string) => {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
      case 'multiple_select':
        return ListBulletIcon
      case 'true_false':
        return CheckIcon
      case 'short_answer':
      case 'essay':
        return PencilIcon
      case 'fill_blank':
        return DocumentTextIcon
      case 'drag_drop':
        return PuzzlePieceIcon
      case 'image_based':
        return PhotoIcon
      case 'video_based':
        return VideoCameraIcon
      default:
        return QuestionMarkCircleIcon
    }
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#094d57] via-[#0c5a66] to-[#f1872c] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#094d57] to-[#f1872c] rounded-full flex items-center justify-center mx-auto mb-4">
                <QuestionMarkCircleIcon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {quiz.title}
              </CardTitle>
              <p className="text-gray-600">{quiz.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Quiz Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-[#094d57] mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{quiz.time_limit_minutes} Minutes</p>
                  <p className="text-xs text-gray-600">Time Limit</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-[#094d57] mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{totalQuestions} Questions</p>
                  <p className="text-xs text-gray-600">Total Questions</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-[#094d57] mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{quiz.passing_score}%</p>
                  <p className="text-xs text-gray-600">Passing Score</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Badge className="bg-[#094d57] text-white">{quiz.difficulty}</Badge>
                  <p className="text-xs text-gray-600 mt-1">Difficulty</p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-2">Security & Integrity Notice</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Auto-save enabled - your progress is automatically saved</li>
                      <li>• Copy/paste actions are monitored and blocked</li>
                      <li>• Tab switching and navigation away is tracked</li>
                      <li>• All activities are logged for academic integrity</li>
                      <li>• Quiz will auto-submit when time expires</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Question Types Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-3">Question Types in This Quiz</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Array.from(new Set(questions.map(q => q.question_type))).map(type => {
                    const Icon = getQuestionIcon(type)
                    return (
                      <div key={type} className="flex items-center space-x-2 text-sm text-blue-700">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartQuiz}
                  className="px-8 py-4 text-lg"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Start Quiz
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Make sure you have a stable internet connection
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Warnings */}
      <AnimatePresence>
        {warnings.map((warning, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{warning}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Quiz Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <Badge variant="info" className="text-xs">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Progress */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span>Progress:</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#094d57] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span>{Math.round(progressPercentage)}%</span>
              </div>

              {/* Answered Count */}
              <div className="text-sm text-gray-600">
                Answered: {answeredQuestions}/{totalQuestions}
              </div>
              
              {/* Timer */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 
                timeRemaining < 600 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <ClockIcon className="h-5 w-5" />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>

              {/* Security Status */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
                <ShieldCheckIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Secure</span>
              </div>

              {/* Auto-save Status */}
              {lastSaved && (
                <div className="text-xs text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar Mobile */}
          <div className="md:hidden mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#094d57] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                  {questions.map((question, index) => {
                    const isAnswered = answers[question.id] !== undefined
                    const isBookmarked = bookmarkedQuestions.has(question.id)
                    const isCurrent = index === currentQuestionIndex
                    
                    return (
                      <motion.button
                        key={question.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={cn(
                          'relative p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center lg:justify-start space-x-2',
                          isCurrent
                            ? 'bg-[#094d57] text-white shadow-md'
                            : isAnswered
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        <span>{index + 1}</span>
                        <div className="hidden lg:flex items-center space-x-1">
                          {isBookmarked && <BookmarkIcon className="h-3 w-3" />}
                          {isAnswered && <CheckCircleIcon className="h-3 w-3" />}
                        </div>
                        {isBookmarked && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full lg:hidden" />
                        )}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Answered:</span>
                    <span className="font-medium">{answeredQuestions}/{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bookmarked:</span>
                    <span className="font-medium">{bookmarkedQuestions.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-medium">{totalQuestions - answeredQuestions}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveProgress()}
                    className="w-full text-xs"
                  >
                    Save Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubmitConfirm(true)}
                    className="w-full text-xs"
                    disabled={answeredQuestions === 0}
                  >
                    Submit Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-8">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-[#094d57] rounded-lg">
                            {React.createElement(getQuestionIcon(currentQuestion.question_type), {
                              className: "h-5 w-5 text-white"
                            })}
                          </div>
                          <div>
                            <Badge variant="info" className="text-xs">
                              {currentQuestion.question_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">
                              {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                            </p>
                          </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed mb-4">
                          {currentQuestion.question_text}
                        </h2>
                      </div>
                      
                      <button
                        onClick={() => toggleBookmark(currentQuestion.id)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          bookmarkedQuestions.has(currentQuestion.id)
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        )}
                      >
                        <BookmarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Media Content */}
                    {currentQuestion.media_url && (
                      <div className="mb-6">
                        {currentQuestion.question_type === 'image_based' && (
                          <div className="relative">
                            <img
                              src={currentQuestion.media_url}
                              alt="Question image"
                              className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          </div>
                        )}
                        {currentQuestion.question_type === 'video_based' && (
                          <div className="relative">
                            <video
                              src={currentQuestion.media_url}
                              controls
                              className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Answer Interface */}
                    <div className="space-y-4">
                      {/* Multiple Choice */}
                      {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, index) => (
                            <motion.label
                              key={index}
                              whileHover={{ scale: 1.01 }}
                              className={cn(
                                'flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                                answers[currentQuestion.id] === option
                                  ? 'border-[#094d57] bg-[#094d57]/5'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              )}
                            >
                              <input
                                type="radio"
                                name={currentQuestion.id}
                                value={option}
                                checked={answers[currentQuestion.id] === option}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                className="h-4 w-4 text-[#094d57] focus:ring-[#094d57] border-gray-300"
                              />
                              <span className="ml-3 text-gray-900 select-none">{option}</span>
                            </motion.label>
                          ))}
                        </div>
                      )}

                      {/* Multiple Select */}
                      {currentQuestion.question_type === 'multiple_select' && currentQuestion.options && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 mb-3">Select all that apply:</p>
                          {currentQuestion.options.map((option, index) => (
                            <motion.label
                              key={index}
                              whileHover={{ scale: 1.01 }}
                              className={cn(
                                'flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                                (answers[currentQuestion.id] || []).includes(option)
                                  ? 'border-[#094d57] bg-[#094d57]/5'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={(answers[currentQuestion.id] || []).includes(option)}
                                onChange={(e) => handleMultipleSelectChange(currentQuestion.id, option, e.target.checked)}
                                className="h-4 w-4 text-[#094d57] focus:ring-[#094d57] border-gray-300 rounded"
                              />
                              <span className="ml-3 text-gray-900 select-none">{option}</span>
                            </motion.label>
                          ))}
                        </div>
                      )}

                      {/* True/False */}
                      {currentQuestion.question_type === 'true_false' && (
                        <div className="space-y-3">
                          {['True', 'False'].map((option) => (
                            <motion.label
                              key={option}
                              whileHover={{ scale: 1.01 }}
                              className={cn(
                                'flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                                answers[currentQuestion.id] === option
                                  ? 'border-[#094d57] bg-[#094d57]/5'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              )}
                            >
                              <input
                                type="radio"
                                name={currentQuestion.id}
                                value={option}
                                checked={answers[currentQuestion.id] === option}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                className="h-4 w-4 text-[#094d57] focus:ring-[#094d57] border-gray-300"
                              />
                              <div className="ml-3 flex items-center space-x-2">
                                {option === 'True' ? (
                                  <CheckIcon className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircleIcon className="h-5 w-5 text-red-600" />
                                )}
                                <span className="text-gray-900 select-none font-medium">{option}</span>
                              </div>
                            </motion.label>
                          ))}
                        </div>
                      )}

                      {/* Short Answer */}
                      {currentQuestion.question_type === 'short_answer' && (
                        <div>
                          <textarea
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094d57] focus:border-transparent resize-none"
                            rows={4}
                            onCopy={(e) => {
                              e.preventDefault()
                              setSecurityFlags(prev => ({ ...prev, copyAttempts: prev.copyAttempts + 1 }))
                              addWarning('Copy action blocked!')
                            }}
                            onPaste={(e) => {
                              e.preventDefault()
                              setSecurityFlags(prev => ({ ...prev, pasteAttempts: prev.pasteAttempts + 1 }))
                              addWarning('Paste action blocked!')
                            }}
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Character count: {(answers[currentQuestion.id] || '').length}
                          </p>
                        </div>
                      )}

                      {/* Essay */}
                      {currentQuestion.question_type === 'essay' && (
                        <div>
                          <textarea
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            placeholder="Write your detailed essay answer here..."
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094d57] focus:border-transparent resize-none"
                            rows={10}
                            onCopy={(e) => {
                              e.preventDefault()
                              setSecurityFlags(prev => ({ ...prev, copyAttempts: prev.copyAttempts + 1 }))
                              addWarning('Copy action blocked!')
                            }}
                            onPaste={(e) => {
                              e.preventDefault()
                              setSecurityFlags(prev => ({ ...prev, pasteAttempts: prev.pasteAttempts + 1 }))
                              addWarning('Paste action blocked!')
                            }}
                          />
                          <div className="flex justify-between text-sm text-gray-500 mt-2">
                            <span>Minimum 100 words recommended</span>
                            <span>Words: {(answers[currentQuestion.id] || '').split(/\s+/).filter(word => word.length > 0).length}</span>
                          </div>
                        </div>
                      )}

                      {/* Fill in the Blank */}
                      {currentQuestion.question_type === 'fill_blank' && currentQuestion.blanks && (
                        <div className="space-y-4">
                          <div className="text-lg leading-relaxed">
                            {currentQuestion.question_text.split('_____').map((part, index) => (
                              <React.Fragment key={index}>
                                {part}
                                {index < currentQuestion.blanks!.length && (
                                  <input
                                    type="text"
                                    value={answers[currentQuestion.id]?.[`blank_${index}`] || ''}
                                    onChange={(e) => {
                                      const newAnswers = { ...answers[currentQuestion.id] }
                                      newAnswers[`blank_${index}`] = e.target.value
                                      handleAnswerChange(currentQuestion.id, newAnswers)
                                    }}
                                    className="inline-block mx-2 px-3 py-1 border-b-2 border-[#094d57] bg-transparent focus:outline-none focus:border-[#f1872c] min-w-[120px]"
                                    placeholder="answer"
                                  />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Drag and Drop */}
                      {currentQuestion.question_type === 'drag_drop' && currentQuestion.drag_items && currentQuestion.drop_zones && (
                        <div className="space-y-6">
                          {/* Drag Items */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Drag these items:</h4>
                            <div className="flex flex-wrap gap-3">
                              {currentQuestion.drag_items.map((item) => (
                                <motion.div
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item.id)}
                                  whileHover={{ scale: 1.05 }}
                                  whileDrag={{ scale: 1.1, rotate: 5 }}
                                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg cursor-move border-2 border-blue-200 hover:border-blue-300 transition-colors"
                                >
                                  {item.text}
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Drop Zones */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Drop them here:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {currentQuestion.drop_zones.map((zone) => (
                                <div
                                  key={zone.id}
                                  onDrop={(e) => handleDrop(e, zone.id)}
                                  onDragOver={(e) => e.preventDefault()}
                                  className="min-h-[100px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-gray-400 transition-colors"
                                >
                                  <p className="font-medium text-gray-700 mb-2">{zone.text}</p>
                                  <div className="space-y-2">
                                    {(dropZoneAnswers[zone.id] || []).map((itemId) => {
                                      const item = currentQuestion.drag_items?.find(i => i.id === itemId)
                                      return item ? (
                                        <div key={itemId} className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                                          {item.text}
                                        </div>
                                      ) : null
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Question Explanation (if answered) */}
                    {showResults && answers[currentQuestion.id] && currentQuestion.explanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                      >
                        <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
                        <p className="text-blue-700 text-sm">{currentQuestion.explanation}</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  <div className="flex items-center space-x-4">
                    {/* Keyboard Shortcuts */}
                    <div className="hidden md:flex items-center space-x-4 text-xs text-gray-500">
                      <span>← → Navigate</span>
                      <span>Space: Next</span>
                      <span>B: Bookmark</span>
                    </div>

                    {currentQuestionIndex === totalQuestions - 1 ? (
                      <Button
                        variant="primary"
                        onClick={() => setShowSubmitConfirm(true)}
                        className="flex items-center space-x-2 px-6"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Submit Quiz</span>
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                        className="flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Submit Quiz?</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Questions answered:</span>
                  <span className="font-medium">{answeredQuestions}/{totalQuestions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time remaining:</span>
                  <span className="font-medium">{formatTime(timeRemaining)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Unanswered questions:</span>
                  <span className="font-medium text-red-600">{totalQuestions - answeredQuestions}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to submit? You cannot change your answers after submission.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1"
                >
                  Continue Quiz
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitQuiz}
                  className="flex-1"
                >
                  Submit Now
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-2 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <ShieldCheckIcon className="h-3 w-3" />
              <span>Secure Mode Active</span>
            </span>
            <span>Violations: {Object.values(securityFlags).reduce((a, b) => a + b, 0)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <EyeIcon className="h-3 w-3" />
            <span>All activities monitored</span>
          </div>
        </div>
      </div>
    </div>
  )
}