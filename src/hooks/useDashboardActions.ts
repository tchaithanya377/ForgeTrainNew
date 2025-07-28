import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export function useDashboardActions() {
  const { user, student, updateProfile } = useAuthStore()
  const queryClient = useQueryClient()

  // Start a course and track study session
  const startCourseMutation = useMutation({
    mutationFn: async ({ courseId, courseTitle }: { courseId: string; courseTitle: string }) => {
      if (!user?.id) throw new Error('User not authenticated')

      // Create or update study session
      const { error: sessionError } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          content_id: courseId,
          content_type: 'module',
          started_at: new Date().toISOString(),
          session_type: 'course_start'
        })

      if (sessionError) {
        console.error('Error creating study session:', sessionError)
      }

      // Update user's last active date
      await updateProfile({
        last_active_date: new Date().toISOString().split('T')[0]
      })

      return { courseId, courseTitle }
    },
    onSuccess: ({ courseTitle }) => {
      toast.success(`Started learning ${courseTitle}!`)
      // Invalidate dashboard data to refresh
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-activity'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-recommended-courses'] })
    },
    onError: (error) => {
      console.error('Error starting course:', error)
      toast.error('Failed to start course. Please try again.')
    }
  })

  // Track study time
  const trackStudyTimeMutation = useMutation({
    mutationFn: async ({ minutes, contentId, contentType }: { 
      minutes: number; 
      contentId?: string; 
      contentType?: string 
    }) => {
      if (!user?.id) throw new Error('User not authenticated')

      // Update total study hours
      const currentHours = student?.total_study_hours || 0
      const newHours = currentHours + (minutes / 60)
      
      await updateProfile({
        total_study_hours: newHours
      })

      // If content is specified, update progress
      if (contentId && contentType) {
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('progress_percentage')
          .eq('user_id', user.id)
          .eq('content_id', contentId)
          .eq('content_type', contentType)
          .single()

        const currentProgress = existingProgress?.progress_percentage || 0
        const newProgress = Math.min(currentProgress + (minutes / 10), 100) // Rough estimate

        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            content_id: contentId,
            content_type: contentType,
            progress_percentage: newProgress,
            updated_at: new Date().toISOString()
          })
      }

      return { minutes, newHours }
    },
    onSuccess: ({ minutes }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-activity'] })
      queryClient.invalidateQueries({ queryKey: ['user-progress'] })
    },
    onError: (error) => {
      console.error('Error tracking study time:', error)
    }
  })

  // Complete a quiz and update stats
  const completeQuizMutation = useMutation({
    mutationFn: async ({ 
      quizId, 
      score, 
      passed, 
      timeSpent 
    }: { 
      quizId: string; 
      score: number; 
      passed: boolean; 
      timeSpent: number 
    }) => {
      if (!user?.id) throw new Error('User not authenticated')

      // Record quiz attempt
      const { error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          passed,
          time_spent_minutes: timeSpent,
          completed_at: new Date().toISOString()
        })

      if (attemptError) throw attemptError

      // Update user stats
      const currentQuizzesPassed = student?.quizzes_passed || 0
      const currentTotalPoints = student?.total_points || 0
      const currentAverageScore = student?.average_quiz_score || 0
      const totalQuizAttempts = (student?.quizzes_passed || 0) + (student?.challenges_solved || 0)

      const updates: any = {
        total_points: currentTotalPoints + score,
        average_quiz_score: totalQuizAttempts > 0 
          ? ((currentAverageScore * totalQuizAttempts) + score) / (totalQuizAttempts + 1)
          : score
      }

      if (passed) {
        updates.quizzes_passed = currentQuizzesPassed + 1
      }

      await updateProfile(updates)

      return { score, passed }
    },
    onSuccess: ({ score, passed }) => {
      const message = passed 
        ? `Quiz completed! Score: ${score}%` 
        : `Quiz completed. Score: ${score}% - Keep practicing!`
      toast.success(message)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-activity'] })
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] })
    },
    onError: (error) => {
      console.error('Error completing quiz:', error)
      toast.error('Failed to record quiz completion. Please try again.')
    }
  })

  // Complete a challenge and update stats
  const completeChallengeMutation = useMutation({
    mutationFn: async ({ 
      challengeId, 
      score, 
      timeSpent 
    }: { 
      challengeId: string; 
      score: number; 
      timeSpent: number 
    }) => {
      if (!user?.id) throw new Error('User not authenticated')

      // Record challenge completion
      const { error: challengeError } = await supabase
        .from('challenge_attempts')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          score,
          time_spent_minutes: timeSpent,
          completed_at: new Date().toISOString()
        })

      if (challengeError) throw challengeError

      // Update user stats
      const currentChallengesSolved = student?.challenges_solved || 0
      const currentTotalPoints = student?.total_points || 0
      const currentAverageScore = student?.average_challenge_score || 0
      const totalChallengeAttempts = currentChallengesSolved

      await updateProfile({
        challenges_solved: currentChallengesSolved + 1,
        total_points: currentTotalPoints + score,
        average_challenge_score: totalChallengeAttempts > 0 
          ? ((currentAverageScore * totalChallengeAttempts) + score) / (totalChallengeAttempts + 1)
          : score
      })

      return { score }
    },
    onSuccess: ({ score }) => {
      toast.success(`Challenge completed! Score: ${score}%`)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-activity'] })
      queryClient.invalidateQueries({ queryKey: ['challenge-attempts'] })
    },
    onError: (error) => {
      console.error('Error completing challenge:', error)
      toast.error('Failed to record challenge completion. Please try again.')
    }
  })

  // Update daily study goal
  const updateStudyGoalMutation = useMutation({
    mutationFn: async ({ minutes }: { minutes: number }) => {
      if (!user?.id) throw new Error('User not authenticated')

      await updateProfile({
        daily_study_goal_minutes: minutes
      })

      return { minutes }
    },
    onSuccess: ({ minutes }) => {
      toast.success(`Daily study goal updated to ${minutes} minutes`)
    },
    onError: (error) => {
      console.error('Error updating study goal:', error)
      toast.error('Failed to update study goal. Please try again.')
    }
  })

  // Mark content as completed
  const markContentCompletedMutation = useMutation({
    mutationFn: async ({ 
      contentId, 
      contentType, 
      score = 100 
    }: { 
      contentId: string; 
      contentType: string; 
      score?: number 
    }) => {
      if (!user?.id) throw new Error('User not authenticated')

      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
          progress_percentage: 100,
          score,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      return { contentId, contentType, score }
    },
    onSuccess: () => {
      toast.success('Progress updated!')
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-activity'] })
      queryClient.invalidateQueries({ queryKey: ['user-progress'] })
    },
    onError: (error) => {
      console.error('Error marking content completed:', error)
      toast.error('Failed to update progress. Please try again.')
    }
  })

  return {
    startCourse: startCourseMutation.mutate,
    trackStudyTime: trackStudyTimeMutation.mutate,
    completeQuiz: completeQuizMutation.mutate,
    completeChallenge: completeChallengeMutation.mutate,
    updateStudyGoal: updateStudyGoalMutation.mutate,
    markContentCompleted: markContentCompletedMutation.mutate,
    isLoading: startCourseMutation.isPending || 
               trackStudyTimeMutation.isPending || 
               completeQuizMutation.isPending || 
               completeChallengeMutation.isPending ||
               updateStudyGoalMutation.isPending ||
               markContentCompletedMutation.isPending
  }
} 