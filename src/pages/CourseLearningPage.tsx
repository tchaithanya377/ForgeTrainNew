import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
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
  const { user } = useAuthStore()
  const { logFeatureUsage } = useLogger()
  
  const [currentItemIndex, setCurrentItemIndex] = React.useState(0)

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

  React.useEffect(() => {
    if (module) {
      logFeatureUsage('course_learning_page_view', {
        course_id: courseId,
        module_id: module.id,
        user_id: user?.id,
      })
    }
  }, [module, courseId, user?.id, logFeatureUsage])

  const handlePrevious = () => {
    setCurrentItemIndex(Math.max(0, currentItemIndex - 1))
  }

  const handleNext = () => {
    setCurrentItemIndex(Math.min((moduleItems?.length || 1) - 1, currentItemIndex + 1))
  }

  const handleLessonComplete = () => {
    // Mark lesson as completed and move to next
    console.log('Lesson completed:', currentItem?.id)
    handleNext()
  }

  const handleLessonProgress = (progress: number) => {
    console.log('Lesson progress:', progress)
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
                  {currentItem ? getLessonTypeName(currentItem.item_type) : 'Lesson'} {currentItemIndex + 1} of {moduleItems?.length || 0}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Progress: {Math.round(((currentItemIndex + 1) / (moduleItems?.length || 1)) * 100)}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#094d57] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentItemIndex + 1) / (moduleItems?.length || 1)) * 100}%` }}
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
            
            {/* Course Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(((currentItemIndex + 1) / (moduleItems?.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#094d57] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentItemIndex + 1) / (moduleItems?.length || 1)) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {currentItemIndex + 1} of {moduleItems?.length || 0} lessons completed
              </p>
            </div>

            {/* Lesson List */}
            <div className="space-y-2">
              {moduleItems?.map((item, index) => {
                const Icon = getLessonTypeIcon(item.item_type)
                const typeColor = getLessonTypeColor(item.item_type)
                const isActive = index === currentItemIndex
                const isCompleted = false // TODO: Get from user progress
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setCurrentItemIndex(index)}
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
                        {getLessonTypeName(item.item_type)}
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
                            {getLessonTypeName(currentItem.item_type)}
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
                        isCompleted={false}
                        progress={0}
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