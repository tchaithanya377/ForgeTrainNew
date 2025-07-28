import React from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon,
  BookOpenIcon,
  CodeBracketIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { getProgressColor } from '../lib/utils'

const progressData = {
  overall: {
    completed_courses: 3,
    total_courses: 12,
    completed_challenges: 45,
    total_challenges: 150,
    completed_quizzes: 8,
    total_quizzes: 25,
    study_streak: 12,
    total_study_hours: 87.5,
  },
  recent_activity: [
    {
      type: 'course',
      title: 'JavaScript Fundamentals',
      progress: 100,
      completed_at: '2025-01-15',
      icon: BookOpenIcon,
    },
    {
      type: 'challenge',
      title: 'Two Sum Problem',
      progress: 100,
      completed_at: '2025-01-14',
      icon: CodeBracketIcon,
    },
    {
      type: 'quiz',
      title: 'React Basics Quiz',
      progress: 95,
      completed_at: '2025-01-13',
      icon: QuestionMarkCircleIcon,
    },
  ],
  weekly_progress: [
    { week: 'Week 1', hours: 12, challenges: 8, quizzes: 2 },
    { week: 'Week 2', hours: 15, challenges: 12, quizzes: 3 },
    { week: 'Week 3', hours: 18, challenges: 15, quizzes: 2 },
    { week: 'Week 4', hours: 14, challenges: 10, quizzes: 1 },
  ],
  skill_progress: [
    { skill: 'JavaScript', level: 85, total_hours: 25 },
    { skill: 'React', level: 70, total_hours: 18 },
    { skill: 'Data Structures', level: 60, total_hours: 22 },
    { skill: 'Algorithms', level: 45, total_hours: 15 },
    { skill: 'Python', level: 30, total_hours: 8 },
  ],
}

export function ProgressPage() {
  const { user, student } = useAuthStore()
  const { logFeatureUsage } = useLogger()

  React.useEffect(() => {
    logFeatureUsage('progress_page_view', {
      user_role: user?.role,
      student_level: student?.skill_level
    })
  }, [logFeatureUsage, user?.role, student?.skill_level])

  if (!user || !student) {
    return null
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Progress</h1>
        <p className="text-gray-600">
          Track your learning journey and see how far you've come
        </p>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900">{progressData.overall.study_streak}</p>
                <p className="text-sm text-gray-500">days</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <FireIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Hours</p>
                <p className="text-2xl font-bold text-gray-900">{progressData.overall.total_study_hours}</p>
                <p className="text-sm text-gray-500">total hours</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Challenges Solved</p>
                <p className="text-2xl font-bold text-gray-900">{progressData.overall.completed_challenges}</p>
                <p className="text-sm text-gray-500">of {progressData.overall.total_challenges}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CodeBracketIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quizzes Passed</p>
                <p className="text-2xl font-bold text-gray-900">{progressData.overall.completed_quizzes}</p>
                <p className="text-sm text-gray-500">of {progressData.overall.total_quizzes}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Course Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Courses Completed</span>
                  <span className="text-sm text-gray-500">
                    {progressData.overall.completed_courses} / {progressData.overall.total_courses}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#094d57] h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(progressData.overall.completed_courses / progressData.overall.total_courses) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {Math.round((progressData.overall.completed_courses / progressData.overall.total_courses) * 100)}% complete
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skill Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Development</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.skill_progress.map((skill, index) => (
                  <motion.div
                    key={skill.skill}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{skill.total_hours}h</span>
                        <span className="text-sm font-medium text-gray-900">{skill.level}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(skill.level)}`}
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.weekly_progress.map((week, index) => (
                  <div key={week.week} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{week.week}</span>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{week.hours}h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CodeBracketIcon className="h-4 w-4" />
                        <span>{week.challenges}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <QuestionMarkCircleIcon className="h-4 w-4" />
                        <span>{week.quizzes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.recent_activity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <activity.icon className="h-4 w-4 text-[#094d57]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={activity.progress === 100 ? "success" : "info"} 
                          size="sm"
                        >
                          {activity.progress}%
                        </Badge>
                        <span className="text-xs text-gray-500">{activity.completed_at}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Daily Goal</span>
                    <span className="text-sm text-gray-500">2.5 / 3 hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: '83%' }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Weekly Goal</span>
                    <span className="text-sm text-gray-500">18 / 20 hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: '90%' }}
                    />
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-4">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Set New Goals
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                  <TrophyIcon className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">First Course Complete</p>
                    <p className="text-xs text-gray-500">Completed JavaScript Fundamentals</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                  <FireIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">10 Day Streak</p>
                    <p className="text-xs text-gray-500">Consistent daily learning</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}