import React from 'react'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  LightBulbIcon,
  TagIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { HTMLContentRenderer } from '../content/HTMLContentRenderer'
import { getDifficultyColor } from '../../lib/utils'
import { useProgress } from '../../hooks/useProgress'

interface TextTutorial {
  id: string
  title: string
  subtitle: string
  learning_track: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  time_minutes: number
  summary: string
  category: string
  tags: string[]
  programming_languages: string[]
  learning_goals: string
  what_students_learn: string
  prerequisites: string
  introduction: string
  main_content: string
  conclusion: string
  fun_facts: string
  memes_humor: string
  learning_sections: any[]
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
  category_id?: string
}

interface TextTutorialComponentProps {
  tutorial: TextTutorial
  onComplete?: () => void
  onProgress?: (progress: number) => void
  isCompleted?: boolean
  progress?: number
}

export function TextTutorialComponent({ 
  tutorial, 
  onComplete, 
  onProgress, 
  isCompleted = false,
  progress = 0 
}: TextTutorialComponentProps) {
  const [currentSection, setCurrentSection] = React.useState(0)
  const [startTime] = React.useState(Date.now())

  // Use the progress hook for better tracking
  const { 
    progress: trackedProgress, 
    isCompleted: trackedCompleted, 
    updateProgress, 
    markCompleted 
  } = useProgress(tutorial.id, 'text_tutorial')

  // Use tracked progress or fall back to props
  const displayProgress = trackedCompleted ? 100 : (trackedProgress > 0 ? trackedProgress : progress)
  const isCompletedFinal = trackedCompleted || isCompleted

  const sections = [
    { title: 'Introduction', content: tutorial.introduction, icon: BookOpenIcon },
    { title: 'Main Content', content: tutorial.main_content, icon: AcademicCapIcon },
    { title: 'Conclusion', content: tutorial.conclusion, icon: CheckCircleIcon },
    ...(tutorial.fun_facts ? [{ title: 'Fun Facts', content: tutorial.fun_facts, icon: LightBulbIcon }] : []),
  ].filter(section => section.content)

  // Track reading progress
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      
      const newProgress = Math.min(100, Math.max(0, scrollPercent))
      
      // Update progress using the hook
      updateProgress(newProgress)
      
      // Call the onProgress callback for backward compatibility
      if (onProgress) {
        onProgress(newProgress)
      }
      
      // Auto-complete when user reaches 90% of the content
      if (newProgress >= 90 && !isCompletedFinal) {
        handleComplete()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [updateProgress, onProgress, isCompletedFinal])

  const handleComplete = async () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60) // minutes
    
    // Mark as completed using the hook
    await markCompleted()
    
    // Call the onComplete callback
    onComplete?.()
  }

  const estimatedReadTime = Math.ceil(
    (tutorial.introduction?.length + tutorial.main_content?.length + tutorial.conclusion?.length || 0) / 1000
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tutorial Header */}
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
                  <BookOpenIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{tutorial.title}</h1>
                  <p className="text-white/80 text-lg mt-1">{tutorial.subtitle}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge className={`${getDifficultyColor(tutorial.difficulty)} border-0`}>
                  {tutorial.difficulty}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {tutorial.time_minutes} min
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <BookOpenIcon className="h-4 w-4 mr-1" />
                  ~{estimatedReadTime} min read
                </Badge>
              </div>

              <p className="text-white/90 text-lg leading-relaxed">
                {tutorial.summary}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Reading Progress</span>
            <span className="text-sm text-gray-600">{Math.round(displayProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-[#094d57] to-[#f1872c] h-2 rounded-full"
              style={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Learning Objectives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AcademicCapIcon className="h-5 w-5" />
              <span>What You'll Learn</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Learning Goals</h4>
                <p className="text-gray-600 leading-relaxed">{tutorial.learning_goals}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Key Takeaways</h4>
                <p className="text-gray-600 leading-relaxed">{tutorial.what_students_learn}</p>
              </div>
            </div>
            
            {tutorial.prerequisites && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Prerequisites</h4>
                <p className="text-yellow-700 text-sm">{tutorial.prerequisites}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>



      {/* Tutorial Content Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <section.icon className="h-5 w-5" />
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HTMLContentRenderer content={section.content} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tags and Languages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorial.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <TagIcon className="h-4 w-4" />
                    <span>Topics Covered</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tutorial.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {tutorial.programming_languages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <CodeBracketIcon className="h-4 w-4" />
                    <span>Programming Languages</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tutorial.programming_languages.map(lang => (
                      <Badge key={lang} variant="info">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Completion Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 mb-12"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Rate this tutorial</span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className="text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!isCompletedFinal && displayProgress >= 80 && (
                  <Button variant="primary" onClick={handleComplete}>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
                {isCompletedFinal && (
                  <Badge variant="success" className="px-4 py-2">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}