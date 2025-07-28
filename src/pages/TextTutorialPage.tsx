import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  StarIcon,
  TagIcon,
  CodeBracketIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { getDifficultyColor } from '../lib/utils'
import { TextTutorialComponent } from '../components/course/TextTutorialComponent'
import type { TextTutorial } from '../lib/supabase'

export function TextTutorialPage() {
  const { tutorialId } = useParams<{ tutorialId: string }>()
  const { user } = useAuthStore()
  const { logFeatureUsage, logError } = useLogger()
  const navigate = useNavigate()

  // Fetch the specific text tutorial
  const { data: tutorial, isLoading, error } = useQuery({
    queryKey: ['text-tutorial', tutorialId],
    queryFn: async () => {
      if (!tutorialId) throw new Error('Tutorial ID is required')

      const { data, error } = await supabase
        .from('text_tutorials')
        .select(`
          id,
          title,
          subtitle,
          learning_track,
          difficulty,
          time_minutes,
          summary,
          category,
          tags,
          programming_languages,
          learning_goals,
          what_students_learn,
          prerequisites,
          introduction,
          main_content,
          conclusion,
          fun_facts,
          memes_humor,
          learning_sections,
          is_published,
          created_by,
          created_at,
          updated_at
        `)
        .eq('id', tutorialId)
        .eq('is_published', true)
        .single()

      if (error) {
        console.error('Error fetching tutorial:', error)
        throw error
      }

      if (!data) {
        throw new Error('Tutorial not found')
      }

      return data as TextTutorial
    },
    enabled: !!tutorialId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  })

  // Fetch user progress for this tutorial
  const { data: userProgress } = useQuery({
    queryKey: ['tutorial-progress', tutorialId, user?.id],
    queryFn: async () => {
      if (!tutorialId || !user?.id) return null

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_id', tutorialId)
        .eq('content_type', 'text_tutorial')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user progress:', error)
      }

      return data
    },
    enabled: !!tutorialId && !!user?.id,
  })

  const handleComplete = async () => {
    if (!tutorial || !user) return

    try {
      logFeatureUsage('complete_text_tutorial', { 
        tutorialId: tutorial.id, 
        title: tutorial.title 
      })

      // Navigate back to tutorials list or show completion message
      navigate('/tutorials', { 
        state: { 
          message: `Congratulations! You've completed "${tutorial.title}"`,
          type: 'success'
        }
      })
    } catch (error) {
      logError('error_completing_tutorial', { 
        tutorialId: tutorial.id, 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleProgress = (progress: number) => {
    if (!tutorial || !user) return

    logFeatureUsage('tutorial_progress', { 
      tutorialId: tutorial.id, 
      progress 
    })
  }

  const handleBack = () => {
    navigate('/tutorials')
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Tutorial</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'There was an error loading the tutorial.'}
            </p>
            <div className="flex gap-3">
              <Button onClick={handleBack} variant="secondary">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Tutorials
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] rounded-3xl p-8 mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 bg-white/20 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-8 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-2/3"></div>
                </div>
              </div>
              <div className="flex gap-3 mb-4">
                <div className="h-6 w-20 bg-white/20 rounded"></div>
                <div className="h-6 w-24 bg-white/20 rounded"></div>
                <div className="h-6 w-28 bg-white/20 rounded"></div>
              </div>
              <div className="h-4 bg-white/20 rounded w-full"></div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutorial Not Found</h3>
            <p className="text-gray-600 mb-4">
              The tutorial you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack} variant="primary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Tutorials
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={handleBack}
            variant="secondary"
            className="mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Tutorials
          </Button>
        </motion.div>
      </div>

      {/* Tutorial Content */}
      <TextTutorialComponent
        tutorial={tutorial}
        onComplete={handleComplete}
        onProgress={handleProgress}
        isCompleted={userProgress?.is_completed || false}
        progress={userProgress?.progress || 0}
      />
    </div>
  )
} 