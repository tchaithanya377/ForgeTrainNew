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

interface CodeExample {
  title?: string
  language?: string
  code?: string
  explanation?: string
}

interface LearningSection {
  title?: string
  content?: string
  code_examples?: CodeExample[]
}

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
  learning_sections: LearningSection[]
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

  const mainSections = [
    { title: 'Introduction', content: tutorial.introduction, icon: BookOpenIcon },
    { title: 'Main Content', content: tutorial.main_content, icon: AcademicCapIcon },
  ].filter(section => section.content)

  const conclusionSections = [
    { title: 'Conclusion', content: tutorial.conclusion, icon: CheckCircleIcon },
    ...(tutorial.fun_facts ? [{ title: 'Fun Facts', content: tutorial.fun_facts, icon: LightBulbIcon }] : []),
  ].filter(section => section.content)

  // Get the direct update function for immediate updates
  const { updateProgressDirect } = useProgress(tutorial.id, 'text_tutorial')

  // Track reading progress with throttling
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let lastProgress = 0

    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      
      const newProgress = Math.min(100, Math.max(0, scrollPercent))
      
      // Only update if progress changed significantly (more than 5%)
      if (Math.abs(newProgress - lastProgress) >= 5) {
        lastProgress = newProgress
        
        // Throttle updates to every 2 seconds
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          // Update progress using the hook
          updateProgress(newProgress)
          
          // Call the onProgress callback for backward compatibility
          if (onProgress) {
            onProgress(newProgress)
          }
        }, 2000)
      }
      
      // Auto-complete when user reaches 90% of the content
      if (newProgress >= 90 && !isCompletedFinal) {
        // Use immediate update for completion
        updateProgressDirect(newProgress, false, true)
        handleComplete()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
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



      {/* Main Tutorial Content Sections */}
      <div className="space-y-8">
        {mainSections.map((section, index) => (
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

      {/* Learning Sections - GeeksforGeeks/W3Schools Style */}
      {tutorial.learning_sections && tutorial.learning_sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AcademicCapIcon className="h-5 w-5" />
                <span>Tutorial Sections</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-12">
                {tutorial.learning_sections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border-b border-gray-200 pb-8 last:border-b-0"
                  >
                    {/* Section Header */}
                    {section.title && (
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {index + 1}. {section.title}
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-[#094d57] to-[#f1872c] rounded"></div>
                      </div>
                    )}
                    
                    {/* Theory/Concept Section */}
                    {section.content && (
                      <div className="mb-8">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                          <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <BookOpenIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Theory & Concepts</h3>
                          </div>
                          <div className="text-gray-700 leading-relaxed text-base">
                            <HTMLContentRenderer content={section.content} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Code Examples Section */}
                    {section.code_examples && section.code_examples.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <CodeBracketIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Examples & Practice</h3>
                        </div>
                        
                        {section.code_examples.map((example: CodeExample, exampleIndex: number) => (
                          <motion.div
                            key={exampleIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: exampleIndex * 0.1 }}
                            className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
                          >
                            {/* Example Header */}
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {example.title && (
                                    <h4 className="font-semibold text-gray-900">{example.title}</h4>
                                  )}
                                  {example.language && (
                                    <Badge variant="info" className="text-xs">
                                      {example.language}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">Example {exampleIndex + 1}</span>
                              </div>
                            </div>
                            
                            {/* Code Block */}
                            {example.code && (
                              <div className="bg-gray-900 p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-400 uppercase tracking-wide">Code</span>
                                  <button className="text-xs text-gray-400 hover:text-white transition-colors">
                                    Copy
                                  </button>
                                </div>
                                <pre className="text-green-400 text-sm leading-relaxed overflow-x-auto">
                                  <code>{example.code}</code>
                                </pre>
                              </div>
                            )}
                            
                            {/* Explanation */}
                            {example.explanation && (
                              <div className="bg-white p-4 border-t border-gray-200">
                                <div className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-[#f1872c] rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                                    <div className="text-gray-700 leading-relaxed text-sm">
                                      <HTMLContentRenderer content={example.explanation} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {/* Quick Summary */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <LightBulbIcon className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Key Takeaway</span>
                      </div>
                      <p className="text-blue-800 text-sm">
                        {section.title ? `In this section, you learned about ${section.title.toLowerCase()}. ` : ''}
                        {section.content ? 'Review the concepts and practice with the examples above.' : 'Practice with the examples above to reinforce your understanding.'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Tutorial Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Tutorial Progress</h4>
                      <p className="text-sm text-gray-600">
                        {tutorial.learning_sections.length} sections completed • Ready for next topic
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm">
                      <BookOpenIcon className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    <Button variant="primary" size="sm">
                      Next Topic
                      <AcademicCapIcon className="h-4 w-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Conclusion Sections */}
      <div className="space-y-8">
        {conclusionSections.map((section, index) => (
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