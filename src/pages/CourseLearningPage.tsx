import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ListBulletIcon,
  AcademicCapIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { LessonRenderer, getLessonTypeIcon, getLessonTypeColor, getLessonTypeName } from '../components/course/LessonRenderer'
import { ProgressSummary } from '../components/course/ProgressSummary'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/utils'

interface ModuleItem {
  id: string
  module_id: string
  item_type: 'text_tutorial' | 'video_tutorial' | 'quiz' | 'code_challenge'
  item_id: string
  sort_order: number
  is_required: boolean
  estimated_duration_minutes: number
  created_at: string
}

export function CourseLearningPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { logFeatureUsage } = useLogger()
  const queryClient = useQueryClient()
  
  // Initialize currentItemIndex from URL or default to 0
  const [currentItemIndex, setCurrentItemIndex] = React.useState(() => {
    const urlParams = new URLSearchParams(location.search)
    return parseInt(urlParams.get('lesson') || '0', 10)
  })

  // Fetch module details
  const { data: module, isLoading: moduleLoading } = useQuery({
    queryKey: ['module', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('id', courseId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!courseId,
  })

  // Fetch module items
  const { data: moduleItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['module-items', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_items')
        .select('*')
        .eq('module_id', courseId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!courseId,
  })

  const currentItem = moduleItems?.[currentItemIndex]

  // Fetch all lesson content for titles
  const { data: allLessonContent } = useQuery({
    queryKey: ['all-lesson-content', moduleItems],
    queryFn: async () => {
      if (!moduleItems || moduleItems.length === 0) return []

      const lessonContentPromises = moduleItems.map(async (item) => {
        let tableName = ''
        switch (item.item_type) {
          case 'text_tutorial':
            tableName = 'text_tutorials'
            break
          case 'video_tutorial':
            tableName = 'video_tutorials'
            break
          case 'quiz':
            tableName = 'quizzes'
            break
          case 'code_challenge':
            tableName = 'code_challenges'
            break
          default:
            return null
        }

        // Use appropriate column names for each table type
        let selectColumns = ''
        switch (item.item_type) {
          case 'text_tutorial':
          case 'video_tutorial':
            selectColumns = 'id, title, subtitle'
            break
          case 'quiz':
          case 'code_challenge':
            selectColumns = 'id, title, description'
            break
          default:
            selectColumns = 'id, title'
        }

        const { data, error } = await supabase
          .from(tableName)
          .select(selectColumns)
          .eq('id', item.item_id)
          .single()

        if (error) {
          console.error(`Error fetching ${item.item_type}:`, error)
          return null
        }

        return {
          itemId: item.id,
          content: data
        }
      })

      const results = await Promise.all(lessonContentPromises)
      return results.filter(Boolean)
    },
    enabled: !!moduleItems && moduleItems.length > 0,
  })

  // Fetch user progress for this module
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id || !courseId) return []

      // Get all lesson IDs for this module
      const lessonIds = moduleItems?.map(item => item.item_id) || []

      if (lessonIds.length === 0) return []

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('content_id', lessonIds)

      if (error) {
        console.error('Error fetching user progress:', error)
        return []
      }

      return data || []
    },
    enabled: !!user?.id && !!courseId && !!moduleItems,
  })

  // Fetch quiz attempts for this module
  const { data: quizAttempts } = useQuery({
    queryKey: ['quiz-attempts', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id || !courseId) return []

      // Get all quiz IDs for this module
      const quizItems = moduleItems?.filter(item => item.item_type === 'quiz') || []
      const quizIds = quizItems.map(item => item.item_id)

      if (quizIds.length === 0) return []

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .in('quiz_id', quizIds)
        .order('completed_at', { ascending: false })

      if (error) {
        console.error('Error fetching quiz attempts:', error)
        return []
      }

      return data || []
    },
    enabled: !!user?.id && !!courseId && !!moduleItems,
  })

  // Fetch challenge attempts for this module
  const { data: challengeAttempts } = useQuery({
    queryKey: ['challenge-attempts', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id || !courseId) return []

      // Get all challenge IDs for this module
      const challengeItems = moduleItems?.filter(item => item.item_type === 'code_challenge') || []
      const challengeIds = challengeItems.map(item => item.item_id)

      if (challengeIds.length === 0) return []

      const { data, error } = await supabase
        .from('challenge_attempts')
        .select('*')
        .eq('user_id', user.id)
        .in('challenge_id', challengeIds)
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('Error fetching challenge attempts:', error)
        return []
      }

      return data || []
    },
    enabled: !!user?.id && !!courseId && !!moduleItems,
  })
  // Create a map of lesson completion status
  const lessonCompletionStatus = React.useMemo(() => {
    const status: Record<string, { completed: boolean; score?: number; lastAttempt?: any }> = {}
    
    if (!moduleItems) return status

    moduleItems.forEach(item => {
      if (item.item_type === 'quiz') {
        // Check quiz attempts
        const attempts = quizAttempts?.filter(attempt => attempt.quiz_id === item.item_id) || []
        const lastAttempt = attempts[0]
        
        status[item.id] = {
          completed: lastAttempt?.passed || false,
          score: lastAttempt?.score,
          lastAttempt
        }
      } else if (item.item_type === 'code_challenge') {
        // Check challenge attempts
        const attempts = challengeAttempts?.filter(attempt => attempt.challenge_id === item.item_id) || []
        const lastAttempt = attempts[0]
        
        status[item.id] = {
          completed: lastAttempt?.is_successful || false,
          score: lastAttempt?.score,
          lastAttempt
        }
      } else {
        // Check user progress for other lesson types
        const progress = userProgress?.find(p => p.content_id === item.item_id)
        status[item.id] = {
          completed: progress?.completed || false,
          score: progress?.score
        }
      }
    })

    return status
  }, [moduleItems, userProgress, quizAttempts, challengeAttempts])

  // Create a map of lesson titles for easy lookup
  const lessonTitles = React.useMemo(() => {
    if (!allLessonContent) return {}
    
    const titles: Record<string, { title: string; subtitle?: string }> = {}
    allLessonContent.forEach((lesson) => {
      if (lesson) {
        const itemType = moduleItems?.find(item => item.id === lesson.itemId)?.item_type
        titles[lesson.itemId] = {
          title: lesson.content.title || getLessonTypeName(itemType || ''),
          subtitle: itemType === 'text_tutorial' || itemType === 'video_tutorial' 
            ? lesson.content.subtitle || ''
            : lesson.content.description || ''
        }
      }
    })
    return titles
  }, [allLessonContent, moduleItems])

  // Fetch lesson content based on current item
  const { data: lessonContent, isLoading: contentLoading } = useQuery({
    queryKey: ['lesson-content', currentItem?.item_type, currentItem?.item_id],
    queryFn: async () => {
      if (!currentItem) return null

      let tableName = ''
      switch (currentItem.item_type) {
        case 'text_tutorial':
          tableName = 'text_tutorials'
          break
        case 'video_tutorial':
          tableName = 'video_tutorials'
          break
        case 'quiz':
          tableName = 'quizzes'
          break
        case 'code_challenge':
          tableName = 'code_challenges'
          break
        default:
          throw new Error(`Unknown item type: ${currentItem.item_type}`)
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', currentItem.item_id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!currentItem,
  })

  // Calculate overall progress based on completed lessons
  const overallProgress = React.useMemo(() => {
    if (!moduleItems || moduleItems.length === 0) return { percentage: 0, completed: 0, total: 0 }
    
    const completedLessons = moduleItems.filter(item => {
      const status = lessonCompletionStatus[item.id]
      return status?.completed || false
    }).length
    
    const percentage = Math.round((completedLessons / moduleItems.length) * 100)
    
    return {
      percentage,
      completed: completedLessons,
      total: moduleItems.length
    }
  }, [moduleItems, lessonCompletionStatus])

  // Calculate current lesson progress
  const currentLessonProgress = React.useMemo(() => {
    if (!currentItem) return 0
    
    const status = lessonCompletionStatus[currentItem.id]
    if (status?.completed) return 100
    
    // For ongoing lessons, calculate based on progress
    return status?.score || 0
  }, [currentItem, lessonCompletionStatus])

  // Create progress items for the summary component
  const progressItems = React.useMemo(() => {
    if (!moduleItems || !lessonTitles) return []
    
    return moduleItems.map(item => {
      const status = lessonCompletionStatus[item.id]
      return {
        id: item.id,
        title: lessonTitles[item.id]?.title || getLessonTypeName(item.item_type),
        type: item.item_type,
        completed: status?.completed || false,
        score: status?.score,
        estimatedDuration: item.estimated_duration_minutes,
        isRequired: item.is_required
      }
    })
  }, [moduleItems, lessonTitles, lessonCompletionStatus])

  React.useEffect(() => {
    if (module) {
      logFeatureUsage('course_learning_page_view', {
        course_id: courseId,
        module_id: module.id,
        user_id: user?.id,
      })
    }
  }, [module, courseId, user?.id, logFeatureUsage])

  // Update URL when lesson index changes
  const updateLessonInUrl = (index: number) => {
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('lesson', index.toString())
    window.history.replaceState({}, '', newUrl.toString())
  }

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentItemIndex - 1)
    setCurrentItemIndex(newIndex)
    updateLessonInUrl(newIndex)
  }

  const handleNext = () => {
    const newIndex = Math.min((moduleItems?.length || 1) - 1, currentItemIndex + 1)
    setCurrentItemIndex(newIndex)
    updateLessonInUrl(newIndex)
  }

  const handleLessonComplete = async () => {
    if (!currentItem || !user?.id) return
    
    try {
      // Save completion to database
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          content_type: currentItem.item_type,
          content_id: currentItem.item_id,
          progress_percentage: 100,
          completed: true,
          score: 100,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving lesson completion:', error)
        return
      }

      // Invalidate queries to refresh progress
      queryClient.invalidateQueries(['user-progress', courseId, user.id])
      queryClient.invalidateQueries(['module-items', courseId])
      
      // Log completion
      logFeatureUsage('lesson_completed', {
        course_id: courseId,
        lesson_id: currentItem.item_id,
        lesson_type: currentItem.item_type,
        user_id: user.id,
      })

      // Move to next lesson if available
      if (currentItemIndex < (moduleItems?.length || 1) - 1) {
        handleNext()
      }
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  }

  const handleLessonProgress = async (progress: number) => {
    if (!currentItem || !user?.id) return
    
    try {
      // Ensure progress is an integer between 0 and 100
      const roundedProgress = Math.round(Math.max(0, Math.min(100, progress)))
      
      // Save progress to database
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          content_type: currentItem.item_type,
          content_id: currentItem.item_id,
          progress_percentage: roundedProgress,
          completed: roundedProgress >= 100,
          score: roundedProgress,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving lesson progress:', error)
        return
      }

      // Invalidate queries to refresh progress
      queryClient.invalidateQueries(['user-progress', courseId, user.id])
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  if (moduleLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094d57] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (!module || !moduleItems) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/courses')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/courses')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
                <p className="text-gray-600">
                  {currentItem ? (lessonTitles[currentItem.id]?.title || getLessonTypeName(currentItem.item_type)) : 'Lesson'} {currentItemIndex + 1} of {moduleItems?.length || 0}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Progress: {overallProgress.percentage}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#094d57] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 h-screen sticky top-16 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h2>
            
            {/* Progress Summary */}
            <div className="mb-6">
              <ProgressSummary
                items={progressItems}
                overallProgress={overallProgress}
                currentItemId={currentItem?.id}
              />
            </div>

            {/* Lesson List */}
            <div className="space-y-2">
              {moduleItems?.map((item, index) => {
                const Icon = getLessonTypeIcon(item.item_type)
                const typeColor = getLessonTypeColor(item.item_type)
                const isActive = index === currentItemIndex
                const isCompleted = lessonCompletionStatus[item.id]?.completed || false
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      setCurrentItemIndex(index)
                      updateLessonInUrl(index)
                    }}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200',
                      isActive
                        ? 'bg-[#094d57] text-white shadow-sm'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg', isActive ? 'bg-white/20' : typeColor)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {lessonTitles[item.id]?.title || getLessonTypeName(item.item_type)}
                      </p>
                      <p className={cn(
                        'text-sm truncate',
                        isActive ? 'text-white/80' : 'text-gray-500'
                      )}>
                        {item.estimated_duration_minutes} min
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isCompleted && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                      {item.is_required && (
                        <div className="w-2 h-2 bg-orange-400 rounded-full" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen bg-gray-50">
          <div className="p-8">
            {currentItem && (
              <motion.div
                key={currentItemIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                {/* Lesson Header */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          'p-3 rounded-lg',
                          getLessonTypeColor(currentItem.item_type)
                        )}>
                          {React.createElement(getLessonTypeIcon(currentItem.item_type), {
                            className: "h-6 w-6"
                          })}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {lessonTitles[currentItem.id]?.title || getLessonTypeName(currentItem.item_type)}
                          </h2>
                          <p className="text-gray-600">
                            {currentItem.estimated_duration_minutes} minutes • {currentItem.is_required ? 'Required' : 'Optional'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="info">
                        {getLessonTypeName(currentItem.item_type)}
                      </Badge>
                      {currentItem.is_required && (
                        <Badge variant="warning">Required</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lesson Content */}
                <div>
                  {/* Navigation */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentItemIndex === 0}
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      {currentItemIndex + 1} of {moduleItems?.length || 0}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={currentItemIndex === (moduleItems?.length || 1) - 1}
                    >
                      Next
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  {/* Content Area */}
                  <div>
                    {contentLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#094d57]"></div>
                      </div>
                    ) : (
                      <LessonRenderer
                        lessonType={currentItem.item_type}
                        lessonData={lessonContent}
                        onComplete={handleLessonComplete}
                        onProgress={handleLessonProgress}
                        isCompleted={lessonCompletionStatus[currentItem.id]?.completed || false}
                        progress={currentLessonProgress}
                        userAttempts={{
                          lastScore: lessonCompletionStatus[currentItem.id]?.score,
                          lastAttempt: lessonCompletionStatus[currentItem.id]?.lastAttempt
                        }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}