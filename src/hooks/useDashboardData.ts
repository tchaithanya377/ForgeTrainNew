import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import React from 'react'

interface RecentActivity {
  id: string
  type: 'tutorial' | 'challenge' | 'quiz'
  title: string
  progress?: number
  status?: string
  score?: number
  timeAgo: string
  icon: string
  content_id: string
  content_type: string
}

interface RecommendedCourse {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  progress: number
  thumbnail: string
  tags: string[]
  estimated_duration_hours: number
}

interface UpcomingChallenge {
  id: string
  title: string
  description: string
  startTime: string
  participants: number
  difficulty: string
}

interface DashboardStats {
  studyHours: number
  challengesSolved: number
  quizzesPassed: number
  totalPoints: number
  dailyGoalProgress: number
  currentStreak: number
  coursesCompleted: number
  averageScore: number
}

export function useDashboardData() {
  const { user, student } = useAuthStore()

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-recent-activity', user?.id],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!user?.id) return []

      try {
        // Get recent progress entries
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select(`
            id,
            content_id,
            content_type,
            progress_percentage,
            score,
            completed,
            completed_at,
            updated_at
          `)
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(10)

        if (progressError) {
          console.error('Error fetching recent activity:', progressError)
          return []
        }

        if (!progressData || progressData.length === 0) {
          return []
        }

        // Get content details for each progress entry
        const activityPromises = progressData.map(async (progress) => {
          try {
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

            const { data: contentData, error: contentError } = await supabase
              .from(tableName)
              .select(selectColumns)
              .eq('id', progress.content_id)
              .single()

            if (contentError) {
              // If table doesn't exist, just skip this content
              if (contentError.code === '42P01') {
                console.log(`${tableName} table does not exist, skipping content ${progress.content_id}`)
                return null
              }
              console.error(`Error fetching content for ${progress.content_id}:`, contentError)
              return null
            }

            if (!contentData) {
              console.log(`No content found for ${progress.content_id} in ${tableName}`)
              return null
            }

            const timeAgo = getTimeAgo(progress.updated_at)
            const title = contentData.title || contentData.subtitle || 'Unknown Content'

            return {
              id: progress.id,
              type: progress.content_type === 'text_tutorial' || progress.content_type === 'video_tutorial' 
                ? 'tutorial' 
                : progress.content_type === 'quiz' 
                ? 'quiz' 
                : 'challenge',
              title,
              progress: progress.progress_percentage,
              status: progress.completed ? 'completed' : undefined,
              score: progress.score,
              timeAgo,
              icon: getActivityIcon(progress.content_type),
              content_id: progress.content_id,
              content_type: progress.content_type
            }
          } catch (error) {
            console.error('Error processing activity item:', error)
            return null
          }
        })

        const activities = await Promise.all(activityPromises)
        return activities.filter(Boolean) as RecentActivity[]
      } catch (error) {
        console.error('Error in recent activity query:', error)
        return []
      }
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Fetch recommended courses based on user's skill level and interests
  const { data: recommendedCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['dashboard-recommended-courses', student?.skill_level, student?.interests],
    queryFn: async (): Promise<RecommendedCourse[]> => {
      if (!student || !user?.id) return []

      try {
        // Get user's current enrollments and progress
        const { data: userProgress, error: progressError } = await supabase
          .from('user_progress')
          .select('content_id, content_type, progress_percentage')
          .eq('user_id', user.id)

        if (progressError) {
          console.error('Error fetching user progress:', progressError)
        }

        const enrolledContentIds = (userProgress || []).map(p => p.content_id)

        // Fetch modules that match user's skill level and interests
        let query = supabase
          .from('modules')
          .select(`
            id,
            title,
            description,
            difficulty,
            estimated_duration_hours,
            tags,
            is_published,
            created_at
          `)
          .eq('is_published', true)

        // For now, just fetch all published modules
        // TODO: Implement proper filtering to exclude enrolled content

        // Filter by skill level if not beginner
        if (student.skill_level && student.skill_level !== 'beginner') {
          query = query.gte('difficulty', student.skill_level)
        }

        const { data: modules, error } = await query
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) {
          // If modules table doesn't exist, return empty array
          if (error.code === '42P01') {
            console.log('modules table does not exist, returning empty recommended courses')
            return []
          }
          console.error('Error fetching recommended courses:', error)
          return []
        }

        return (modules || []).map(module => ({
          id: module.id,
          title: module.title,
          description: module.description,
          difficulty: module.difficulty,
          duration: module.estimated_duration_hours * 60, // Convert to minutes
          progress: 0, // New courses have 0 progress
          thumbnail: generateThumbnail(module.title, module.tags || []),
          tags: module.tags || [],
          estimated_duration_hours: module.estimated_duration_hours
        }))
      } catch (error) {
        console.error('Error in recommended courses query:', error)
        return []
      }
    },
    enabled: !!student && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch upcoming challenges (mock data for now, can be replaced with real challenges)
  const { data: upcomingChallenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['dashboard-upcoming-challenges'],
    queryFn: async (): Promise<UpcomingChallenge[]> => {
      // For now, return mock data. In a real app, this would fetch from a challenges table
      return [
        {
          id: '1',
          title: 'Weekly Coding Contest #145',
          description: '4 problems • 2 hours',
          startTime: 'Tomorrow at 8:00 PM',
          participants: 1200,
          difficulty: 'Intermediate'
        },
        {
          id: '2',
          title: 'Array Manipulation Challenge',
          description: 'Beginner level • 30 minutes',
          startTime: 'Friday at 6:00 PM',
          participants: 450,
          difficulty: 'Beginner'
        }
      ]
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Calculate dashboard stats from student data
  const dashboardStats: DashboardStats = React.useMemo(() => {
    if (!student) {
      return {
        studyHours: 0,
        challengesSolved: 0,
        quizzesPassed: 0,
        totalPoints: 0,
        dailyGoalProgress: 0,
        currentStreak: 0,
        coursesCompleted: 0,
        averageScore: 0
      }
    }

    // Ensure all values are numbers and have fallbacks
    const stats = {
      studyHours: Number(student.total_study_hours) || 0,
      challengesSolved: Number(student.challenges_solved) || 0,
      quizzesPassed: Number(student.quizzes_passed) || 0,
      totalPoints: Number(student.total_points) || 0,
      dailyGoalProgress: calculateDailyGoalProgress(student),
      currentStreak: Number(student.current_streak_days) || 0,
      coursesCompleted: Number(student.courses_completed) || 0,
      averageScore: Number(student.average_quiz_score) || 0
    }

    return stats
  }, [student])

  return {
    recentActivity: recentActivity || [],
    recommendedCourses: recommendedCourses || [],
    upcomingChallenges: upcomingChallenges || [],
    dashboardStats,
    isLoading: activityLoading || coursesLoading || challengesLoading
  }
}

// Helper functions
function getTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  } catch (error) {
    console.error('Error calculating time ago:', error)
    return 'Recently'
  }
}

function getActivityIcon(contentType: string): string {
  switch (contentType) {
    case 'text_tutorial':
    case 'video_tutorial':
      return 'BookOpenIcon'
    case 'quiz':
      return 'TrophyIcon'
    case 'code_challenge':
      return 'CodeBracketIcon'
    default:
      return 'DocumentTextIcon'
  }
}

function generateThumbnail(title: string, tags: string[]): string {
  // Generate a placeholder thumbnail based on title and tags
  const colors = [
    'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=300'
  ]
  
  const index = title.length % colors.length
  return colors[index]
}

function calculateDailyGoalProgress(student: any): number {
  if (!student?.daily_study_goal_minutes) return 0
  
  // This would typically calculate based on today's study time
  // For now, return a mock progress
  const todayStudyMinutes = 45 // This would come from time tracking
  return Math.min((todayStudyMinutes / student.daily_study_goal_minutes) * 100, 100)
} 