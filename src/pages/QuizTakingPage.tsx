import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  LockClosedIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { AdvancedQuizInterface } from '../components/quiz/AdvancedQuizInterface'
import { ModernTechLoader } from '../components/ui/ModernTechLoader'
import toast from 'react-hot-toast'

interface Quiz {
  id: string
  title: string
  description: string
  category_id?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  time_limit_minutes: number
  passing_score: number
  tags: string[]
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
}

interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options: string[] | null
  correct_answer: string
  explanation: string
  points: number
  order_index: number
  created_at: string
  updated_at: string
}

interface QuizAttempt {
  quiz_id: string
  answers: Record<string, string>
  start_time: Date
  time_spent: number
  tab_switches: number
  copy_attempts: number
  paste_attempts: number
  right_clicks: number
}

export function QuizTakingPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { logQuizCompletion, logError } = useLogger()
  const queryClient = useQueryClient()

  // Get return path from navigation state
  const returnTo = location.state?.returnTo || '/quizzes'
  const moduleId = location.state?.moduleId
  const lessonId = location.state?.lessonId

  // Quiz state
  const [quizCompleted, setQuizCompleted] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)
  const [quizResults, setQuizResults] = React.useState<any>(null)
  const [quizStarted, setQuizStarted] = React.useState(false)

  // Fetch quiz data
  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .eq('is_published', true)
        .single()

      if (error) throw error
      return data as Quiz
    },
    enabled: !!quizId,
  })

  // Fetch quiz questions
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data as QuizQuestion[]
    },
    enabled: !!quizId,
  })

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async ({ answers, timeSpent, securityData }: { answers: Record<string, any>, timeSpent: number, securityData: any }) => {
      console.log('Quiz submission started:', { quizId, answers, timeSpent, securityData })
      
      // Calculate score
      let correctAnswers = 0
      let totalPoints = 0
      let earnedPoints = 0

      questions?.forEach(question => {
        totalPoints += question.points
        const userAnswer = answers[question.id]
        if (userAnswer && userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()) {
          correctAnswers++
          earnedPoints += question.points
        }
      })

      const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
      const passed = scorePercentage >= (quiz?.passing_score || 70)

      console.log('Quiz calculation results:', {
        correctAnswers,
        totalPoints,
        earnedPoints,
        scorePercentage,
        passed,
        passingScore: quiz?.passing_score
      })

      // Save quiz attempt to Supabase
      const { error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId!,
          user_id: user?.id,
          score: scorePercentage,
          passed: passed,
          time_spent_minutes: timeSpent,
          answers: answers,
          security_data: securityData,
          completed_at: new Date().toISOString()
        })

      if (attemptError) {
        console.error('Failed to save quiz attempt:', attemptError)
        throw new Error('Failed to save quiz results')
      }

      console.log('Quiz attempt saved successfully')

      // If passed, update user progress for the module/lesson
      if (passed && moduleId && lessonId) {
        console.log('Updating user progress for passed quiz:', { moduleId, lessonId, scorePercentage })
        
        const { error: progressError } = await supabase
          .from('user_progress')
          .upsert({
            user_id: user?.id,
            content_type: 'quiz',
            content_id: lessonId,
            progress_percentage: 100,
            completed: true,
            score: scorePercentage,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (progressError) {
          console.error('Failed to update user progress:', progressError)
        } else {
          console.log('User progress updated successfully')
        }
      }

      // Log quiz completion
      await logQuizCompletion(quizId!, scorePercentage, timeSpent)

      return {
        score: scorePercentage,
        passed,
        correctAnswers,
        totalQuestions: questions?.length || 0,
        earnedPoints,
        totalPoints,
        timeSpent,
        securityData
      }
    },
    onSuccess: (result) => {
      setQuizResults(result)
      setQuizCompleted(true)
      setShowResults(true)
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries(['user-progress', moduleId])
      queryClient.invalidateQueries(['quiz-attempts', quizId])
      queryClient.invalidateQueries(['module', moduleId])
      
      if (result.passed) {
        toast.success(`Congratulations! You scored ${result.score}%`)
      } else {
        toast.error(`You scored ${result.score}%. Minimum required: ${quiz?.passing_score}%`)
      }
    },
    onError: (error) => {
      logError('Quiz submission failed', { error: error.message, quiz_id: quizId })
      toast.error('Failed to submit quiz. Please try again.')
    }
  })

  const handleQuizSubmit = (answers: Record<string, any>, timeSpent: number, securityData: any) => {
    submitQuizMutation.mutate({ answers, timeSpent, securityData })
  }

  const handleQuizExit = () => {
    // Ensure any cleanup is done before navigating
    navigate(returnTo)
  }

  // Cleanup effect for component unmount
  React.useEffect(() => {
    return () => {
      // Cleanup any remaining resources when component unmounts
      console.log('QuizTakingPage cleanup: Component unmounting')
    }
  }, [])

  // Handle browser back button and page unload
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizStarted && !quizCompleted) {
        e.preventDefault()
        e.returnValue = 'Are you sure you want to leave? Your quiz progress may be lost.'
        return e.returnValue
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (quizStarted && !quizCompleted) {
        const confirmExit = window.confirm('Are you sure you want to leave? Your quiz progress may be lost.')
        if (!confirmExit) {
          window.history.pushState(null, '', window.location.pathname)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [quizStarted, quizCompleted])

  if (quizLoading || questionsLoading) {
    return (
      <ModernTechLoader 
        type="quiz" 
        size="lg"
        showProgress={true}
        progress={questionsLoading ? 75 : 25}
      />
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist or isn't published.</p>
          <button
            onClick={() => navigate(returnTo)}
            className="px-4 py-2 bg-[#094d57] text-white rounded-lg hover:bg-[#073e47]"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Quiz results screen
  if (showResults && quizResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                quizResults.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {quizResults.passed ? (
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                ) : (
                  <XMarkIcon className="h-8 w-8 text-red-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quiz {quizResults.passed ? 'Completed!' : 'Not Passed'}
              </h2>
              <p className="text-gray-600">
                You scored {quizResults.score}% ({quizResults.correctAnswers}/{quizResults.totalQuestions} correct)
              </p>
            </div>

            {/* Score Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#094d57]">{quizResults.score}%</p>
                <p className="text-sm text-gray-600">Your Score</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#094d57]">{quiz.passing_score}%</p>
                <p className="text-sm text-gray-600">Required</p>
              </div>
            </div>

            {/* Security Report */}
            {quizResults.securityData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-3">Security Report</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Violations: </span>
                    <span className="font-medium">{quizResults.securityData.violations?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Suspicion Score: </span>
                    <span className="font-medium">{quizResults.securityData.suspiciousActivityScore || 0}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Face Checks: </span>
                    <span className="font-medium">{quizResults.securityData.faceDetectionCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Time Spent: </span>
                    <span className="font-medium">{quizResults.timeSpent} min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(returnTo)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {moduleId ? 'Back to Course' : 'Back to Quizzes'}
              </button>
              {!quizResults.passed && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-[#094d57] text-white rounded-lg hover:bg-[#073e47]"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Main quiz interface
  if (!questions || questions.length === 0) {
    return (
      <ModernTechLoader 
        size="lg" 
        type="quiz"
        showProgress={true}
        progress={90}
      />
    )
  }

  return (
    <React.Suspense fallback={
      <ModernTechLoader 
        size="lg" 
        message="Loading quiz interface..." 
        subMessage="Preparing secure environment"
      />
    }>
      <AdvancedQuizInterface
        quiz={quiz}
        questions={questions}
        onSubmit={handleQuizSubmit}
        onExit={handleQuizExit}
        moduleId={moduleId}
        lessonId={lessonId}
      />
    </React.Suspense>
  )
}