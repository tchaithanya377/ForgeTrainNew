import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  QuestionMarkCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  TrophyIcon,
  PlayIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { getDifficultyColor } from '../../lib/utils'

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
  questions_count?: number
}

interface QuizComponentProps {
  quiz: Quiz
  onComplete?: () => void
  onProgress?: (progress: number) => void
  isCompleted?: boolean
  progress?: number
  lastScore?: number
}

export function QuizComponent({ 
  quiz, 
  onComplete, 
  onProgress, 
  isCompleted = false,
  progress = 0,
  lastScore 
}: QuizComponentProps) {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const { user } = useAuthStore()

  // Fetch user's quiz attempts
  const { data: quizAttempts } = useQuery({
    queryKey: ['quiz-attempts', quiz.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quiz.id)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (error) {
        console.error('Error fetching quiz attempts:', error)
        return []
      }

      console.log('Quiz attempts for quiz', quiz.id, ':', data)
      return data || []
    },
    enabled: !!user?.id && !!quiz.id,
  })

  // Fetch quiz questions count
  const { data: quizQuestions } = useQuery({
    queryKey: ['quiz-questions-count', quiz.id],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id)

      if (error) {
        console.error('Error fetching quiz questions count:', error)
        return 0
      }

      console.log('Quiz questions count for quiz', quiz.id, ':', count)
      return count || 0
    },
    enabled: !!quiz.id,
  })

  // Get the latest attempt and completion status
  const latestAttempt = quizAttempts?.[0]
  const hasPassed = latestAttempt?.passed || false
  const userScore = latestAttempt?.score

  // Debug logging
  console.log('Quiz Component Debug:', {
    quizId: quiz.id,
    quizTitle: quiz.title,
    hasAttempts: quizAttempts?.length > 0,
    latestAttempt,
    hasPassed,
    userScore,
    questionsCount: quizQuestions,
    isCompleted,
    lastScore
  })

  const handleStartQuiz = () => {
    // Start quiz directly in taking mode
    navigate(`/quiz/${quiz.id}/take`, { 
      state: { 
        returnTo: courseId ? `/learn/${courseId}` : '/quizzes',
        moduleId: courseId,
        lessonId: quiz.id
      }
    })
  }

  const handleRetakeQuiz = () => {
    navigate(`/quiz/${quiz.id}/take`, { 
      state: { 
        returnTo: courseId ? `/learn/${courseId}` : '/quizzes',
        moduleId: courseId,
        lessonId: quiz.id
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] rounded-3xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <QuestionMarkCircleIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{quiz.title}</h1>
                  <p className="text-white/80 text-lg mt-1">{quiz.description}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge className={`${getDifficultyColor(quiz.difficulty)} border-0`}>
                  {quiz.difficulty}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {quiz.time_limit_minutes} min
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  {quizQuestions || 0} questions
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <TrophyIcon className="h-4 w-4 mr-1" />
                  {quiz.passing_score}% to pass
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quiz Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        {hasPassed && userScore !== undefined ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    userScore >= quiz.passing_score ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {userScore >= quiz.passing_score ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    ) : (
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Quiz {userScore >= quiz.passing_score ? 'Passed' : 'Not Passed'}
                    </h3>
                    <p className="text-gray-600">
                      Your score: {userScore}% (Required: {quiz.passing_score}%)
                    </p>
                    {latestAttempt && (
                      <p className="text-sm text-gray-500">
                        Completed: {new Date(latestAttempt.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => navigate(`/quiz/${quiz.id}`)}>
                    View Details
                  </Button>
                  {userScore < quiz.passing_score && (
                    <Button variant="primary" onClick={handleRetakeQuiz}>
                      Retake Quiz
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QuestionMarkCircleIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Test Your Knowledge?</h3>
                <p className="text-gray-600 mb-6">
                  Take this quiz to assess your understanding of the concepts covered.
                </p>
                <Button variant="primary" size="lg" onClick={handleStartQuiz}>
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Quiz Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Quiz Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">{quiz.time_limit_minutes}</p>
                <p className="text-sm text-gray-600">Minutes</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">{quizQuestions || 0}</p>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">{quiz.passing_score}%</p>
                <p className="text-sm text-gray-600">Pass Score</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-900">Secure</p>
                <p className="text-sm text-gray-600">Proctored</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quiz Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5" />
              <span>Instructions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Before You Start</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start space-x-2">
                      <span className="text-[#094d57] font-bold">•</span>
                      <span>Ensure you have a stable internet connection</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#094d57] font-bold">•</span>
                      <span>Find a quiet environment without distractions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#094d57] font-bold">•</span>
                      <span>You have {quiz.time_limit_minutes} minutes to complete</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#094d57] font-bold">•</span>
                      <span>You need {quiz.passing_score}% to pass</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">During the Quiz</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start space-x-2">
                      <span className="text-[#094d57] font-bold">•</span>
                      <span>Read each question carefully</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#094d57] font-bold">•</span>
                      <span>You can navigate between questions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#094d57] font-bold">•</span>
                      <span>Your progress is automatically saved</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#094d57] font-bold">•</span>
                      <span>Submit before time runs out</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">Academic Integrity</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• This quiz is monitored for academic integrity</li>
                      <li>• Copy/paste actions are disabled and tracked</li>
                      <li>• Tab switching and navigation away is monitored</li>
                      <li>• Maintain honesty and integrity throughout</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tags */}
      {quiz.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Topics Covered</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quiz.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}