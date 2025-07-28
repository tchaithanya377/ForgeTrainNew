import React from 'react'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { TextTutorialComponent } from './TextTutorialComponent'
import { VideoTutorialComponent } from './VideoTutorialComponent'
import { QuizComponent } from './QuizComponent'
import { CodingChallengeComponent } from './CodingChallengeComponent'
import { Card, CardContent } from '../ui/Card'

interface LessonRendererProps {
  lessonType: 'text_tutorial' | 'video_tutorial' | 'quiz' | 'code_challenge'
  lessonData: any
  onComplete?: () => void
  onProgress?: (progress: number) => void
  isCompleted?: boolean
  progress?: number
  userAttempts?: any
}

export function LessonRenderer({
  lessonType,
  lessonData,
  onComplete,
  onProgress,
  isCompleted = false,
  progress = 0,
  userAttempts
}: LessonRendererProps) {
  if (!lessonData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Not Available</h3>
            <p className="text-gray-600">
              This lesson content is not available or hasn't been loaded yet.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderLessonContent = () => {
    switch (lessonType) {
      case 'text_tutorial':
        return (
          <TextTutorialComponent
            tutorial={lessonData}
            onComplete={onComplete}
            onProgress={onProgress}
            isCompleted={isCompleted}
            progress={progress}
          />
        )

      case 'video_tutorial':
        return (
          <VideoTutorialComponent
            tutorial={lessonData}
            onComplete={onComplete}
            onProgress={onProgress}
            isCompleted={isCompleted}
            progress={progress}
          />
        )

      case 'quiz':
        return (
          <QuizComponent
            quiz={lessonData}
            onComplete={onComplete}
            onProgress={onProgress}
            isCompleted={isCompleted}
            progress={progress}
            lastScore={userAttempts?.lastScore}
          />
        )

      case 'code_challenge':
        return (
          <CodingChallengeComponent
            challenge={lessonData}
            onComplete={onComplete}
            onProgress={onProgress}
            isCompleted={isCompleted}
            progress={progress}
            lastAttempt={userAttempts?.lastAttempt}
          />
        )

      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[400px]"
          >
            <Card className="max-w-md">
              <CardContent className="p-8 text-center">
                <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unknown Lesson Type</h3>
                <p className="text-gray-600">
                  The lesson type "{lessonType}" is not supported.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {renderLessonContent()}
    </motion.div>
  )
}

// Helper function to get lesson type icon
export function getLessonTypeIcon(lessonType: string) {
  switch (lessonType) {
    case 'text_tutorial':
      return BookOpenIcon
    case 'video_tutorial':
      return VideoCameraIcon
    case 'quiz':
      return QuestionMarkCircleIcon
    case 'code_challenge':
      return CodeBracketIcon
    default:
      return BookOpenIcon
  }
}

// Helper function to get lesson type color
export function getLessonTypeColor(lessonType: string) {
  switch (lessonType) {
    case 'text_tutorial':
      return 'text-blue-600 bg-blue-50'
    case 'video_tutorial':
      return 'text-green-600 bg-green-50'
    case 'quiz':
      return 'text-purple-600 bg-purple-50'
    case 'code_challenge':
      return 'text-orange-600 bg-orange-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

// Helper function to get lesson type name
export function getLessonTypeName(lessonType: string) {
  switch (lessonType) {
    case 'text_tutorial':
      return 'Text Tutorial'
    case 'video_tutorial':
      return 'Video Tutorial'
    case 'quiz':
      return 'Quiz'
    case 'code_challenge':
      return 'Coding Challenge'
    default:
      return 'Unknown'
  }
}