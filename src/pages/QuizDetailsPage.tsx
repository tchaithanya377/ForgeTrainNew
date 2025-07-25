import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  ClockIcon,
  DocumentTextIcon,
  TrophyIcon,
  PlayIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { getDifficultyColor } from '../lib/utils'

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
}

export function QuizDetailsPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { logFeatureUsage } = useLogger()

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

  // Fetch quiz questions (without answers for preview)
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions-preview', quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('id, question_text, question_type, points, order_index')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data as Partial<QuizQuestion>[]
    },
    enabled: !!quizId,
  })

  React.useEffect(() => {
    if (quiz) {
      logFeatureUsage('quiz_details_view', {
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        difficulty: quiz.difficulty
      })
    }
  }, [quiz, logFeatureUsage])

  const handleStartQuiz = () => {
    if (!quiz) return
    // Go directly to quiz taking page
    navigate(`/quiz/${quiz.id}/take`, {
      state: {
        returnTo: '/quizzes'
      }
    })
  }

  const totalPoints = questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0
  const questionTypeCount = questions?.reduce((acc, q) => {
    acc[q.question_type || 'unknown'] = (acc[q.question_type || 'unknown'] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  if (quizLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094d57] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz details...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Not Found</h2>
            <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist or isn't published.</p>
            <Button onClick={() => navigate('/quizzes')}>
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
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
                  {quiz.tags.map(tag => (
                    <Badge key={tag} className="bg-white/20 text-white border-white/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Quiz Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900">{quiz.time_limit_minutes}</p>
                    <p className="text-sm text-gray-600">Minutes</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900">{questions?.length || 0}</p>
                    <p className="text-sm text-gray-600">Questions</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900">{totalPoints}</p>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900">{quiz.passing_score}%</p>
                    <p className="text-sm text-gray-600">Pass Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Types */}
            <Card>
              <CardHeader>
                <CardTitle>Question Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(questionTypeCount).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                          <QuestionMarkCircleIcon className="h-5 w-5 text-[#094d57]" />
                        </div>
                        <span className="font-medium text-gray-900 capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge variant="secondary">{count} questions</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Security Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-700">Copy/Paste Disabled</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-700">Right-Click Disabled</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-700">Tab Switch Monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-blue-700">Fullscreen Mode</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Start Quiz */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#094d57] to-[#f1872c] rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Start?</h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Make sure you have a stable internet connection and won't be interrupted.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartQuiz}
                    className="w-full"
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created By</p>
                    <p className="text-sm text-gray-600">ForgeTrain Expert</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Category</p>
                    <p className="text-sm text-gray-600">
                      {quiz.tags[0] || 'General'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#094d57] font-bold">1.</span>
                    <span>Read each question carefully before answering</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#094d57] font-bold">2.</span>
                    <span>You can navigate between questions freely</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#094d57] font-bold">3.</span>
                    <span>Submit your quiz before time runs out</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#094d57] font-bold">4.</span>
                    <span>Maintain academic integrity throughout</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}