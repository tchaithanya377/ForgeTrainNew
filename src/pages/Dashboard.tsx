import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BookOpenIcon,
  CodeBracketIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  PlayIcon,
  ArrowRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { useDashboardData } from '../hooks/useDashboardData'
import { useDashboardActions } from '../hooks/useDashboardActions'
import { useDashboardNotifications } from '../hooks/useDashboardNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatDuration } from '../lib/utils'
import { ModernTechLoader } from '../components/ui/ModernTechLoader'
import { ProgressTracker } from '../components/dashboard/ProgressTracker'
import { seedTestData, clearTestData } from '../utils/seedTestData'

// Icon mapping for dynamic activity icons
const iconMap = {
  BookOpenIcon,
  CodeBracketIcon,
  TrophyIcon,
  DocumentTextIcon,
}

export function Dashboard() {
  const { user, student } = useAuthStore()
  const { logFeatureUsage } = useLogger()
  const navigate = useNavigate()
  const { 
    recentActivity, 
    recommendedCourses, 
    upcomingChallenges, 
    dashboardStats, 
    isLoading 
  } = useDashboardData()
  
  const { 
    startCourse, 
    trackStudyTime, 
    completeQuiz, 
    completeChallenge, 
    updateStudyGoal,
    markContentCompleted,
    isLoading: actionsLoading 
  } = useDashboardActions()
  
  const { 
    notifications, 
    achievements, 
    markNotificationRead, 
    clearAllNotifications, 
    unreadCount 
  } = useDashboardNotifications()

  React.useEffect(() => {
    logFeatureUsage('dashboard_view', {
      user_role: user?.role,
      student_level: student?.skill_level
    })
  }, [logFeatureUsage, user?.role, student?.skill_level])

  if (!user || !student) {
    return null
  }

  if (isLoading || actionsLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ModernTechLoader />
      </div>
    )
  }

  const handleStartLearning = () => {
    navigate('/courses')
  }

  const handleViewAllCourses = () => {
    navigate('/courses')
  }

  const handleCourseClick = (course: any) => {
    // Start the course and track the action
    startCourse({ 
      courseId: course.id, 
      courseTitle: course.title 
    })
    navigate(`/course/${course.id}`)
  }

  const handleActivityClick = (activity: any) => {
    // Navigate based on activity type
    switch (activity.content_type) {
      case 'text_tutorial':
        navigate(`/tutorial/${activity.content_id}`)
        break
      case 'video_tutorial':
        navigate(`/course/${activity.content_id}`)
        break
      case 'quiz':
        navigate(`/quiz/${activity.content_id}`)
        break
      case 'code_challenge':
        navigate(`/course/${activity.content_id}`)
        break
      default:
        navigate('/courses')
    }
  }

  const handleSeedTestData = async () => {
    const success = await seedTestData()
    if (success) {
      // Refresh the dashboard data
      window.location.reload()
    }
  }

  const handleClearTestData = async () => {
    const success = await clearTestData()
    if (success) {
      // Refresh the dashboard data
      window.location.reload()
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {student.first_name}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to continue your coding journey? You're doing great!
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-[#f1872c]">
              <FireIcon className="h-6 w-6" />
              <span className="text-2xl font-bold">{dashboardStats.currentStreak}</span>
              <span className="text-sm font-medium">day streak</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSeedTestData}
                className="text-xs"
              >
                Seed Test Data
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearTestData}
                className="text-xs"
              >
                Clear Test Data
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          {
            title: 'Study Hours',
            value: Math.round(dashboardStats.studyHours),
            suffix: 'hrs',
            icon: ClockIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
          },
          {
            title: 'Challenges Solved',
            value: dashboardStats.challengesSolved,
            suffix: '',
            icon: CodeBracketIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
          },
          {
            title: 'Quizzes Passed',
            value: dashboardStats.quizzesPassed,
            suffix: '',
            icon: TrophyIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
          },
          {
            title: 'Total Points',
            value: dashboardStats.totalPoints,
            suffix: 'pts',
            icon: ChartBarIcon,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value.toLocaleString()}{stat.suffix}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || DocumentTextIcon
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className="p-2 bg-white rounded-lg">
                          <IconComponent className="h-5 w-5 text-[#094d57]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {activity.progress && activity.progress > 0 && (
                              <Badge variant="info">{activity.progress}% complete</Badge>
                            )}
                            {activity.status && (
                              <Badge variant="success">{activity.status}</Badge>
                            )}
                            {activity.score && (
                              <Badge variant="success">Score: {activity.score}%</Badge>
                            )}
                            <span className="text-sm text-gray-500">{activity.timeAgo}</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity yet</p>
                    <p className="text-sm">Start learning to see your progress here!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Study Goal Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Study Time</span>
                    <span className="text-sm text-gray-500">
                      45 / {student.daily_study_goal_minutes} min
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#094d57] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dashboardStats.dailyGoalProgress}%` }}
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={handleStartLearning}>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <ProgressTracker />

          {/* Upcoming Challenges */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingChallenges.map((challenge, index) => (
                  <div key={challenge.id} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {challenge.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">{challenge.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#094d57] font-medium">{challenge.startTime}</span>
                      <span className="text-gray-500">{challenge.participants} joined</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recommended Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
          <Button variant="ghost" onClick={handleViewAllCourses}>
            View All
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.length > 0 ? (
            recommendedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <Card hover className="h-full cursor-pointer" onClick={() => handleCourseClick(course)}>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-200 rounded-t-xl overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="info">{course.difficulty}</Badge>
                        <span className="text-sm text-gray-500">
                          {formatDuration(course.duration)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                      {course.progress > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#094d57] h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <Button variant="outline" size="sm" className="w-full mt-3">
                            Continue Learning
                          </Button>
                        </div>
                      ) : (
                        <Button variant="primary" size="sm" className="w-full">
                          Start Course
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <BookOpenIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No courses available</p>
              <p className="text-sm">Check back later for new courses!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}