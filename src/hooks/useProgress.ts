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
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null)

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

  // Update progress in database with debouncing
  const updateProgress = useCallback(async (progress: number, completed: boolean = false, immediate: boolean = false) => {
    if (!user?.id || !contentId) return

    // Clear existing timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout)
    }

    // If immediate update is requested (for completion), update right away
    if (immediate || completed) {
      await performProgressUpdate(progress, completed)
      return
    }

    // Debounce regular progress updates
    const timeoutId = setTimeout(() => {
      performProgressUpdate(progress, completed)
    }, 1000) // 1 second debounce

    setUpdateTimeout(timeoutId)
  }, [user?.id, contentId, contentType, queryClient, updateTimeout])

  // Actual progress update function
  const performProgressUpdate = useCallback(async (progress: number, completed: boolean = false) => {
    if (!user?.id || !contentId) return

    try {
      // Ensure progress is an integer between 0 and 100
      const roundedProgress = Math.round(Math.max(0, Math.min(100, progress)))
      
      const updateData: any = {
        progress_percentage: roundedProgress,
        score: roundedProgress,
        updated_at: new Date().toISOString()
      }

      if (completed) {
        updateData.completed = true
        updateData.completed_at = new Date().toISOString()
      }

      // First, try to update existing record
      let { data: updateResult, error } = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .select()

      // If no rows were updated (no existing record), insert a new record
      if (!updateResult || updateResult.length === 0) {
        const insertData = {
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
          ...updateData
        }

        const { error: insertError } = await supabase
          .from('user_progress')
          .insert(insertData)

        if (insertError) {
          console.error('Error inserting progress:', insertError)
          return
        }
      } else if (error) {
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
    await updateProgress(100, true, true) // Immediate update for completion
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout)
      }
    }
  }, [updateTimeout])

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