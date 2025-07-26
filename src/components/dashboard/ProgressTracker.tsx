import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Progress } from '../ui/Progress'

interface ProgressData {
  content_id: string
  content_type: string
  progress_percentage: number
  completed: boolean
  completed_at?: string
  updated_at: string
}

interface ContentInfo {
  id: string
  title: string
  type: string
}

export function ProgressTracker() {
  const { user } = useAuthStore()

  // Fetch user's recent progress
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['user-progress-summary', user?.id],
    queryFn: async (): Promise<ProgressData[]> => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching progress:', error)
        return []
      }

      return data || []
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch content details for progress items
  const { data: contentDetails } = useQuery({
    queryKey: ['progress-content-details', progressData],
    queryFn: async (): Promise<ContentInfo[]> => {
      if (!progressData || progressData.length === 0) return []

      const contentPromises = progressData.map(async (progress) => {
        let tableName = ''
        let selectColumns = ''
        
        switch (progress.content_type) {
          case 'text_tutorial':
          case 'video_tutorial':
            tableName = progress.content_type === 'text_tutorial' ? 'text_tutorials' : 'video_tutorials'
            selectColumns = 'id, title, subtitle'
            break
          case 'quiz':
            tableName = 'quizzes'
            selectColumns = 'id, title, description'
            break
          case 'code_challenge':
            tableName = 'code_challenges'
            selectColumns = 'id, title, description'
            break
          default:
            return null
        }

        const { data } = await supabase
          .from(tableName)
          .select(selectColumns)
          .eq('id', progress.content_id)
          .single()

        if (!data) return null

        return {
          id: progress.content_id,
          title: data.title || data.subtitle || 'Unknown Content',
          type: progress.content_type
        }
      })

      const results = await Promise.all(contentPromises)
      return results.filter(Boolean) as ContentInfo[]
    },
    enabled: !!progressData && progressData.length > 0,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!progressData || progressData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No progress data yet</p>
            <p className="text-sm">Start learning to see your progress here!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progressData.map((progress, index) => {
            const contentInfo = contentDetails?.find(c => c.id === progress.content_id)
            const title = contentInfo?.title || 'Unknown Content'
            const type = contentInfo?.type || progress.content_type

            return (
              <motion.div
                key={progress.content_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="info" className="text-xs">
                        {type.replace('_', ' ')}
                      </Badge>
                      {progress.completed && (
                        <Badge variant="success" className="text-xs">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-sm font-medium text-gray-900">
                      {progress.progress_percentage}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={progress.progress_percentage} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  Updated {new Date(progress.updated_at).toLocaleDateString()}
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 