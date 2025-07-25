import React from 'react'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  CodeBracketIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  PlayIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatDuration } from '../lib/utils'

const recentActivity = [
  {
    type: 'tutorial',
    title: 'JavaScript Fundamentals',
    progress: 85,
    timeAgo: '2 hours ago',
    icon: BookOpenIcon,
  },
  {
    type: 'challenge',
    title: 'Two Sum Problem',
    status: 'completed',
    timeAgo: '1 day ago',
    icon: CodeBracketIcon,
  },
  {
    type: 'quiz',
    title: 'React Basics Quiz',
    score: 95,
    timeAgo: '2 days ago',
    icon: TrophyIcon,
  },
]

const recommendedCourses = [
  {
    id: '1',
    title: 'Advanced React Patterns',
    description: 'Learn advanced React concepts and patterns',
    difficulty: 'intermediate',
    duration: 180,
    progress: 0,
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '2',
    title: 'Data Structures Deep Dive',
    description: 'Master fundamental data structures',
    difficulty: 'beginner',
    duration: 240,
    progress: 25,
    thumbnail: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '3',
    title: 'System Design Basics',
    description: 'Introduction to scalable system design',
    difficulty: 'advanced',
    duration: 300,
    progress: 0,
    thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
]

const upcomingChallenges = [
  {
    id: '1',
    title: 'Weekly Coding Contest #145',
    description: '4 problems • 2 hours',
    startTime: 'Tomorrow at 8:00 PM',
    participants: 1200,
  },
  {
    id: '2',
    title: 'Array Manipulation Challenge',
    description: 'Beginner level • 30 minutes',
    startTime: 'Friday at 6:00 PM',
    participants: 450,
  },
]

export function Dashboard() {
  const { user, student } = useAuthStore()
  const { logFeatureUsage } = useLogger()

  React.useEffect(() => {
    logFeatureUsage('dashboard_view', {
      user_role: user?.role,
      student_level: student?.skill_level
    })
  }, [logFeatureUsage, user?.role, student?.skill_level])

  if (!user || !student) {
    return null
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
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 text-[#f1872c]">
              <FireIcon className="h-6 w-6" />
              <span className="text-2xl font-bold">{student.current_streak_days}</span>
              <span className="text-sm font-medium">day streak</span>
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
            value: Math.round(student.total_study_hours),
            suffix: 'hrs',
            icon: ClockIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
          },
          {
            title: 'Challenges Solved',
            value: student.challenges_solved,
            suffix: '',
            icon: CodeBracketIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
          },
          {
            title: 'Quizzes Passed',
            value: student.quizzes_passed,
            suffix: '',
            icon: TrophyIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
          },
          {
            title: 'Total Points',
            value: student.total_points,
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
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="p-2 bg-white rounded-lg">
                      <activity.icon className="h-5 w-5 text-[#094d57]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {activity.progress && (
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
                ))}
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
                      style={{ width: `${(45 / student.daily_study_goal_minutes) * 100}%` }}
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            </CardContent>
          </Card>

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
          <Button variant="ghost">
            View All
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <Card hover className="h-full">
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
          ))}
        </div>
      </motion.div>
    </div>
  )
}