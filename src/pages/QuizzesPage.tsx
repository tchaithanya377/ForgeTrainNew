import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  PlayIcon,
  TrophyIcon,
  BookOpenIcon,
  AcademicCapIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
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
  questions_count?: number
}

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

export function QuizzesPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedDifficulty, setSelectedDifficulty] = React.useState('All')
  const [sortBy, setSortBy] = React.useState('newest')
  const { user } = useAuthStore()
  const { logSearch, logFeatureUsage } = useLogger()
  const navigate = useNavigate()

  // Fetch quizzes from Supabase
  const { data: quizzes, isLoading, error, refetch } = useQuery({
    queryKey: ['published-quizzes'],
    queryFn: async () => {
      console.log('Fetching published quizzes from Supabase...')
      
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          difficulty,
          time_limit_minutes,
          passing_score,
          tags,
          is_published,
          created_at,
          updated_at
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching quizzes:', error)
        throw error
      }

      console.log('Fetched quizzes:', data?.length || 0)
      
      // Get question count for each quiz
      const quizzesWithCounts = await Promise.all(
        (data || []).map(async (quiz) => {
          const { count } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id)

          return {
            ...quiz,
            questions_count: count || 0
          }
        })
      )

      return quizzesWithCounts as Quiz[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })

  // Filter quizzes based on search and filters
  const filteredQuizzes = React.useMemo(() => {
    if (!quizzes) return []
    
    let filtered = quizzes.filter(quiz => {
      const matchesSearch = !searchQuery || 
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesDifficulty = selectedDifficulty === 'All' || 
        quiz.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
      
      return matchesSearch && matchesDifficulty
    })

    // Apply sorting
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
        break
      case 'duration':
        filtered.sort((a, b) => a.time_limit_minutes - b.time_limit_minutes)
        break
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    if (searchQuery) {
      logSearch(searchQuery, filtered.length, {
        difficulty: selectedDifficulty,
        sort_by: sortBy
      })
    }

    return filtered
  }, [quizzes, searchQuery, selectedDifficulty, sortBy, logSearch])

  React.useEffect(() => {
    logFeatureUsage('quizzes_page_view', {
      total_quizzes: quizzes?.length || 0,
      filtered_count: filteredQuizzes.length
    })
  }, [logFeatureUsage, quizzes?.length, filteredQuizzes.length])

  const handleStartQuiz = (quiz: Quiz) => {
    navigate(`/quiz/${quiz.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] p-8 md:p-12">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex items-center space-x-3 mb-4"
                  >
                    <QuestionMarkCircleIcon className="h-8 w-8 text-[#f1872c]" />
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                      Knowledge Quizzes
                    </h1>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-xl text-gray-200 mb-6 max-w-2xl"
                  >
                    Test your understanding with interactive quizzes and assessments
                  </motion.p>
                  
                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex items-center space-x-8"
                  >
                    <div className="flex items-center space-x-2 text-white">
                      <QuestionMarkCircleIcon className="h-5 w-5 text-[#f1872c]" />
                      <span className="font-semibold">{quizzes?.length || 0} Quizzes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <TrophyIcon className="h-5 w-5 text-[#f1872c]" />
                      <span className="font-semibold">Instant Results</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <CheckCircleIcon className="h-5 w-5 text-[#f1872c]" />
                      <span className="font-semibold">Secure Testing</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Connection Status */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="hidden lg:block"
                >
                  {isLoading && (
                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span className="text-white font-medium">Loading quizzes...</span>
                    </div>
                  )}
                  {!isLoading && !error && quizzes && (
                    <div className="flex items-center space-x-3 bg-green-500/20 backdrop-blur-md border border-green-400/30 px-6 py-3 rounded-2xl">
                      <CheckCircleIcon className="h-5 w-5 text-green-300" />
                      <span className="text-white font-medium">Live • {quizzes.length} quizzes</span>
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center space-x-3 bg-red-500/20 backdrop-blur-md border border-red-400/30 px-6 py-3 rounded-2xl">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-300" />
                      <button 
                        onClick={() => refetch()}
                        className="text-white font-medium hover:text-red-200 transition-colors"
                      >
                        Retry Connection
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Input
                  placeholder="Search quizzes, topics, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<MagnifyingGlassIcon />}
                  className="pl-12 pr-4 py-4 text-lg bg-white/50 border-0 rounded-2xl focus:ring-2 focus:ring-[#094d57]/20 focus:bg-white/80 transition-all duration-300"
                />
              </div>
              
              <div className="flex gap-4">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-6 py-4 bg-white/50 border-0 rounded-2xl focus:ring-2 focus:ring-[#094d57]/20 focus:bg-white/80 transition-all duration-300 font-medium"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-6 py-4 bg-white/50 border-0 rounded-2xl focus:ring-2 focus:ring-[#094d57]/20 focus:bg-white/80 transition-all duration-300 font-medium"
                >
                  <option value="newest">Newest First</option>
                  <option value="title">Alphabetical</option>
                  <option value="difficulty">By Difficulty</option>
                  <option value="duration">By Duration</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-lg">
              {isLoading ? (
                'Loading quizzes from database...'
              ) : (
                <>
                  Showing <span className="font-bold text-[#094d57]">{filteredQuizzes.length}</span> quizzes
                  {searchQuery && ` for "${searchQuery}"`}
                  {quizzes && ` from ${quizzes.length} published quizzes`}
                </>
              )}
            </p>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-3/4 mb-4"></div>
                  <div className="flex space-x-2 mb-4">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-16"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-20"></div>
                  </div>
                  <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Quizzes</h3>
              <p className="text-gray-600 mb-6">
                Unable to connect to the quiz database. Please check your connection.
              </p>
              <Button variant="primary" onClick={() => refetch()} className="rounded-2xl">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Retry Connection
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quiz Grid - Simple and Clean */}
        {!isLoading && !error && filteredQuizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="h-full bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-6">
                    {/* Quiz Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-gradient-to-br from-[#094d57] to-[#f1872c] rounded-xl">
                            <QuestionMarkCircleIcon className="h-6 w-6 text-white" />
                          </div>
                          <Badge className={`${getDifficultyColor(quiz.difficulty)} border-0 rounded-2xl px-3 py-1 font-medium`}>
                            {quiz.difficulty}
                          </Badge>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#094d57] transition-colors">
                          {quiz.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {quiz.description}
                        </p>
                      </div>
                    </div>

                    {/* Quiz Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <ClockIcon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-sm font-bold text-gray-900">{quiz.time_limit_minutes}</p>
                        <p className="text-xs text-gray-600">minutes</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <QuestionMarkCircleIcon className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-bold text-gray-900">{quiz.questions_count || 0}</p>
                        <p className="text-xs text-gray-600">questions</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <TrophyIcon className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-sm font-bold text-gray-900">{quiz.passing_score}%</p>
                        <p className="text-xs text-gray-600">to pass</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {quiz.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="rounded-2xl px-3 py-1 text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {quiz.tags.length > 3 && (
                        <Badge variant="default" className="rounded-2xl px-3 py-1 text-xs">
                          +{quiz.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Start Quiz Button */}
                    <Button 
                      variant="primary" 
                      className="w-full rounded-2xl py-3 bg-gradient-to-r from-[#094d57] to-[#0c5a66] hover:from-[#073e47] hover:to-[#094d57] shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <PlayIcon className="h-5 w-5" />
                        <span className="font-semibold">Start Quiz</span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    </Button>

                    {/* Quiz Info Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-200/50">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Created {new Date(quiz.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>4.8</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State - No Published Quizzes */}
        {!isLoading && !error && filteredQuizzes.length === 0 && quizzes && quizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <QuestionMarkCircleIcon className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Published Quizzes</h3>
              <p className="text-gray-600 mb-6">
                No published quizzes found in the database. Create and publish some quizzes to get started.
              </p>
              <Button variant="outline" onClick={() => refetch()} className="rounded-2xl">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>
        )}

        {/* No Results State */}
        {!isLoading && !error && filteredQuizzes.length === 0 && quizzes && quizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No quizzes found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDifficulty('All')
                }}
                className="rounded-2xl"
              >
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}

        {/* Performance Debug Info (Development Only) */}
        {import.meta.env.DEV && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-md text-white p-4 rounded-2xl text-xs font-mono border border-white/10"
          >
            <div className="space-y-1">
              <div>Published Quizzes: {quizzes?.length || 0}</div>
              <div>Filtered: {filteredQuizzes.length}</div>
              <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
              <div>Error: {error ? 'Yes' : 'No'}</div>
              <div>Query: is_published = true</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}