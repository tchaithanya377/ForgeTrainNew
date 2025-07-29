import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked_at: string
  type: 'streak' | 'completion' | 'score' | 'milestone'
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'achievement' | 'reminder' | 'update' | 'milestone'
  read: boolean
  created_at: string
}

export function useDashboardNotifications() {
  const { user, student } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [hasShownDailyReminder, setHasShownDailyReminder] = useState(false)

  // Check for new achievements based on user stats
  const checkAchievements = React.useCallback(() => {
    if (!student) return

    setAchievements(prevAchievements => {
      const newAchievements: Achievement[] = []

      // Streak achievements
      if (student.current_streak_days >= 7 && !prevAchievements.find(a => a.title === 'Week Warrior')) {
        newAchievements.push({
          id: `streak-7-${Date.now()}`,
          title: 'Week Warrior',
          description: 'Maintained a 7-day learning streak!',
          icon: '🔥',
          unlocked_at: new Date().toISOString(),
          type: 'streak'
        })
      }

      if (student.current_streak_days >= 30 && !prevAchievements.find(a => a.title === 'Monthly Master')) {
        newAchievements.push({
          id: `streak-30-${Date.now()}`,
          title: 'Monthly Master',
          description: 'Maintained a 30-day learning streak!',
          icon: '👑',
          unlocked_at: new Date().toISOString(),
          type: 'streak'
        })
      }

      // Completion achievements
      if (student.courses_completed >= 5 && !prevAchievements.find(a => a.title === 'Course Collector')) {
        newAchievements.push({
          id: `courses-5-${Date.now()}`,
          title: 'Course Collector',
          description: 'Completed 5 courses!',
          icon: '📚',
          unlocked_at: new Date().toISOString(),
          type: 'completion'
        })
      }

      if (student.quizzes_passed >= 10 && !prevAchievements.find(a => a.title === 'Quiz Champion')) {
        newAchievements.push({
          id: `quizzes-10-${Date.now()}`,
          title: 'Quiz Champion',
          description: 'Passed 10 quizzes!',
          icon: '🏆',
          unlocked_at: new Date().toISOString(),
          type: 'completion'
        })
      }

      // Score achievements
      if (student.average_quiz_score >= 90 && !prevAchievements.find(a => a.title === 'Perfect Score')) {
        newAchievements.push({
          id: `score-90-${Date.now()}`,
          title: 'Perfect Score',
          description: 'Achieved 90%+ average quiz score!',
          icon: '⭐',
          unlocked_at: new Date().toISOString(),
          type: 'score'
        })
      }

      // Study time achievements
      if (student.total_study_hours >= 50 && !prevAchievements.find(a => a.title === 'Study Master')) {
        newAchievements.push({
          id: `hours-50-${Date.now()}`,
          title: 'Study Master',
          description: 'Logged 50+ hours of study time!',
          icon: '⏰',
          unlocked_at: new Date().toISOString(),
          type: 'milestone'
        })
      }

      // Show notifications for new achievements
      newAchievements.forEach(achievement => {
        toast.success(
          React.createElement('div', null,
            React.createElement('div', { className: 'font-semibold' }, achievement.title),
            React.createElement('div', { className: 'text-sm' }, achievement.description)
          ),
          {
            duration: 5000,
            icon: achievement.icon,
            style: {
              background: '#10b981',
              color: 'white',
            },
          }
        )
      })

      return [...prevAchievements, ...newAchievements]
    })
  }, [student])

  // Check for daily reminders (only show once per session)
  const checkDailyReminders = React.useCallback(() => {
    if (!student || hasShownDailyReminder) return

    const today = new Date().toISOString().split('T')[0]
    const lastActive = student.last_active_date

    // If user hasn't been active today, show reminder (only once)
    if (lastActive !== today) {
      const reminder: Notification = {
        id: `reminder-${Date.now()}`,
        title: 'Daily Learning Reminder',
        message: `Don't forget your daily study goal of ${student.daily_study_goal_minutes || 30} minutes!`,
        type: 'reminder',
        read: false,
        created_at: new Date().toISOString()
      }

      setNotifications(prev => [reminder, ...prev])
      setHasShownDailyReminder(true)
      
      toast(
        React.createElement('div', null,
          React.createElement('div', { className: 'font-semibold' }, 'Daily Learning Reminder'),
          React.createElement('div', { className: 'text-sm' }, 'Keep up your learning streak!')
        ),
        {
          duration: 4000,
          icon: '📚',
        }
      )
    }
  }, [student, hasShownDailyReminder])

  // Check for milestone notifications
  const checkMilestones = React.useCallback(() => {
    if (!student) return

    const milestones = [
      { value: 100, title: 'Century Club', message: 'Reached 100 total points!' },
      { value: 500, title: 'Halfway Hero', message: 'Reached 500 total points!' },
      { value: 1000, title: 'Point Master', message: 'Reached 1000 total points!' },
    ]

    setNotifications(prevNotifications => {
      const newNotifications: Notification[] = []

      milestones.forEach(milestone => {
        if (student.total_points >= milestone.value && 
            !prevNotifications.find(n => n.title === milestone.title)) {
          const notification: Notification = {
            id: `milestone-${milestone.value}-${Date.now()}`,
            title: milestone.title,
            message: milestone.message,
            type: 'milestone',
            read: false,
            created_at: new Date().toISOString()
          }

          newNotifications.push(notification)
          
          toast.success(
            React.createElement('div', null,
              React.createElement('div', { className: 'font-semibold' }, milestone.title),
              React.createElement('div', { className: 'text-sm' }, milestone.message)
            ),
            {
              duration: 4000,
              icon: '🎉',
            }
          )
        }
      })

      return [...newNotifications, ...prevNotifications]
    })
  }, [student])

  // Fetch existing achievements from database (with error handling for missing tables)
  const { data: existingAchievements } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('unlocked_at', { ascending: false })

        if (error) {
          // If table doesn't exist, just return empty array
          if (error.code === '42P01') {
            console.log('user_achievements table does not exist, skipping...')
            return []
          }
          console.error('Error fetching achievements:', error)
          return []
        }

        return data || []
      } catch (error) {
        console.error('Error in achievements query:', error)
        return []
      }
    },
    enabled: !!user?.id,
    retry: false, // Don't retry if table doesn't exist
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch existing notifications from database (with error handling for missing tables)
  const { data: existingNotifications } = useQuery({
    queryKey: ['user-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      try {
        const { data, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) {
          // If table doesn't exist, just return empty array
          if (error.code === '42P01') {
            console.log('user_notifications table does not exist, skipping...')
            return []
          }
          console.error('Error fetching notifications:', error)
          return []
        }

        return data || []
      } catch (error) {
        console.error('Error in notifications query:', error)
        return []
      }
    },
    enabled: !!user?.id,
    retry: false, // Don't retry if table doesn't exist
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Initialize achievements and notifications only when we have data
  useEffect(() => {
    if (existingAchievements && existingAchievements.length > 0 && achievements.length === 0) {
      setAchievements(existingAchievements)
    }
  }, [existingAchievements, achievements.length])

  useEffect(() => {
    if (existingNotifications && existingNotifications.length > 0 && notifications.length === 0) {
      setNotifications(existingNotifications)
    }
  }, [existingNotifications, notifications.length])

  // Check for new achievements and notifications periodically
  useEffect(() => {
    if (!student) return

    // Check every 5 minutes (but don't spam daily reminders)
    const interval = setInterval(() => {
      checkAchievements()
      checkMilestones()
      // Don't check daily reminders again in the interval
    }, 5 * 60 * 1000)

    // Also check once after a short delay to avoid immediate setState calls
    const initialCheck = setTimeout(() => {
      checkAchievements()
      checkDailyReminders()
      checkMilestones()
    }, 1000) // Wait 1 second before first check

    return () => {
      clearTimeout(initialCheck)
      clearInterval(interval)
    }
  }, [student, checkAchievements, checkDailyReminders, checkMilestones]) // Include all dependencies

  // Mark notification as read (with error handling for missing tables)
  const markNotificationRead = async (notificationId: string) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error && error.code !== '42P01') {
        console.error('Error marking notification as read:', error)
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Clear all notifications (with error handling for missing tables)
  const clearAllNotifications = async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('user_id', user.id)

      if (error && error.code !== '42P01') {
        console.error('Error clearing notifications:', error)
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }

  return {
    notifications: notifications.filter(n => !n.read),
    achievements,
    markNotificationRead,
    clearAllNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  }
} 