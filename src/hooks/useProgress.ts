import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

interface ProgressData {
  completed: boolean
  score?: number
  progress_percentage?: number
  completed_at?: string
}

export function useProgress(contentId: string, contentType: string) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [localProgress, setLocalProgress] = useState(0)

  // Fetch current progress from database
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['progress', contentId, user?.id],
    queryFn: async (): Promise<ProgressData | null> => {
      if (!user?.id || !contentId) return null

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching progress:', error)
        return null
      }

      return data
    },
    enabled: !!user?.id && !!contentId,
  })

  // Update progress in database
  const updateProgress = useCallback(async (progress: number, completed: boolean = false) => {
    if (!user?.id || !contentId) return

    try {
      // Ensure progress is an integer between 0 and 100
      const roundedProgress = Math.round(Math.max(0, Math.min(100, progress)))
      
      const updateData: any = {
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        progress_percentage: roundedProgress,
        score: roundedProgress,
        updated_at: new Date().toISOString()
      }

      if (completed) {
        updateData.completed = true
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert(updateData)

      if (error) {
        console.error('Error updating progress:', error)
        return
      }

      // Invalidate related queries
      queryClient.invalidateQueries(['progress', contentId, user.id])
      queryClient.invalidateQueries(['user-progress'])
      
      console.log('Progress updated successfully:', { progress: roundedProgress, completed })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }, [user?.id, contentId, contentType, queryClient])

  // Mark as completed
  const markCompleted = useCallback(async () => {
    await updateProgress(100, true)
    setLocalProgress(100)
  }, [updateProgress])

  // Update local progress
  const updateLocalProgress = useCallback((progress: number) => {
    setLocalProgress(progress)
    updateProgress(progress)
  }, [updateProgress])

  // Initialize local progress from database
  useEffect(() => {
    if (progressData) {
      setLocalProgress(progressData.progress_percentage || 0)
    }
  }, [progressData])

  return {
    progress: progressData?.progress_percentage || localProgress,
    isCompleted: progressData?.completed || false,
    score: progressData?.score,
    completedAt: progressData?.completed_at,
    isLoading,
    updateProgress: updateLocalProgress,
    markCompleted,
    updateProgressDirect: updateProgress
  }
} 