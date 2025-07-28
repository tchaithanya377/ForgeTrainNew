import React from 'react'
import { motion } from 'framer-motion'
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  TagIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  StarIcon,
  DocumentTextIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { getDifficultyColor } from '../../lib/utils'

interface VideoTutorial {
  id: string
  title: string
  subtitle: string
  learning_track: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  summary: string
  category_id?: string
  tags: string[]
  programming_languages: string[]
  learning_goals: string
  what_students_learn: string
  prerequisites: string
  video_url: string
  thumbnail_url: string
  video_chapters: any[]
  resources: any[]
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
}

interface VideoTutorialComponentProps {
  tutorial: VideoTutorial
  onComplete?: () => void
  onProgress?: (progress: number) => void
  isCompleted?: boolean
  progress?: number
}

export function VideoTutorialComponent({ 
  tutorial, 
  onComplete, 
  onProgress, 
  isCompleted = false,
  progress = 0 
}: VideoTutorialComponentProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [watchProgress, setWatchProgress] = React.useState(0)
  const [activeChapter, setActiveChapter] = React.useState(0)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  // Handle video progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      setDuration(total)
      
      const progressPercent = (current / total) * 100
      setWatchProgress(progressPercent)
      
      if (onProgress) {
        onProgress(progressPercent)
      }

      // Auto-complete when 90% watched
      if (progressPercent >= 90 && !isCompleted) {
        onComplete?.()
      }

      // Update active chapter
      if (tutorial.video_chapters.length > 0) {
        const currentChapter = tutorial.video_chapters.findIndex((chapter, index) => {
          const nextChapter = tutorial.video_chapters[index + 1]
          return current >= chapter.start_time && (!nextChapter || current < nextChapter.start_time)
        })
        if (currentChapter !== -1) {
          setActiveChapter(currentChapter)
        }
      }
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const jumpToChapter = (chapterIndex: number) => {
    if (videoRef.current && tutorial.video_chapters[chapterIndex]) {
      videoRef.current.currentTime = tutorial.video_chapters[chapterIndex].start_time
      setActiveChapter(chapterIndex)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Video Header */}
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
                  <VideoCameraIcon className="h-8 w-8" />
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
                  {tutorial.duration_minutes} min
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <VideoCameraIcon className="h-4 w-4 mr-1" />
                  HD Video
                </Badge>
              </div>

              <p className="text-white/90 text-lg leading-relaxed">
                {tutorial.summary}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Video Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    src={tutorial.video_url}
                    poster={tutorial.thumbnail_url}
                    className="w-full h-full object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration)
                      }
                    }}
                    controls
                  />
                  
                  {/* Custom Play Button Overlay */}
                  {!isPlaying && currentTime === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePlayPause}
                        className="w-20 h-20 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl"
                      >
                        <PlayIcon className="h-10 w-10 text-[#094d57] ml-2" />
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Video Progress */}
                <div className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Watch Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(watchProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-[#094d57] to-[#f1872c] h-2 rounded-full"
                      style={{ width: `${watchProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Learning Objectives */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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

          {/* Resources */}
          {tutorial.resources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>Additional Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tutorial.resources.map((resource, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <LinkIcon className="h-5 w-5 text-[#094d57]" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{resource.title}</h4>
                          <p className="text-sm text-gray-600">{resource.description}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Video Chapters */}
          {tutorial.video_chapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Video Chapters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tutorial.video_chapters.map((chapter, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => jumpToChapter(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeChapter === index
                            ? 'bg-[#094d57] text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{chapter.title}</h4>
                            <p className={`text-xs mt-1 ${
                              activeChapter === index ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {formatTime(chapter.start_time)}
                            </p>
                          </div>
                          <PlayIcon className="h-4 w-4 ml-2" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tags and Languages */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                {tutorial.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <TagIcon className="h-4 w-4" />
                      <span>Topics</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tutorial.tags.map(tag => (
                        <Badge key={tag} variant="secondary" size="sm">
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
                      <span>Languages</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tutorial.programming_languages.map(lang => (
                        <Badge key={lang} variant="info" size="sm">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Completion Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  {isCompleted ? (
                    <div>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">Completed!</h3>
                      <p className="text-sm text-gray-600 mb-4">Great job finishing this video tutorial.</p>
                      <div className="flex items-center justify-center space-x-1 mb-4">
                        <span className="text-sm text-gray-600">Rate this video:</span>
                      </div>
                      <div className="flex justify-center space-x-1">
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
                  ) : (
                    <div>
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <VideoCameraIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">Keep Watching</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Watch {Math.round(90 - watchProgress)}% more to complete
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${watchProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}