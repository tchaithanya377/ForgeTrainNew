import React from 'react'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  CodeBracketIcon,
  QuestionMarkCircleIcon,
  PlayIcon,
  ChartBarIcon,
  TagIcon,
  ClockIcon,
  TrophyIcon,
  UsersIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { 
  extractAllCourses, 
  analyzeCourseData, 
  getCoursesByDifficulty,
  exportForDatabase 
} from '../../utils/courseExtractor'
import { formatDuration, getDifficultyColor } from '../../lib/utils'

const contentTypeIcons = {
  text_tutorial: BookOpenIcon,
  video_tutorial: PlayIcon,
  quiz: QuestionMarkCircleIcon,
  code_challenge: CodeBracketIcon,
}

const contentTypeColors = {
  text_tutorial: 'text-blue-600 bg-blue-50',
  video_tutorial: 'text-green-600 bg-green-50',
  quiz: 'text-purple-600 bg-purple-50',
  code_challenge: 'text-orange-600 bg-orange-50',
}

export function CourseAnalyticsPage() {
  const [courses] = React.useState(() => extractAllCourses())
  const [analytics] = React.useState(() => analyzeCourseData())
  const [selectedDifficulty, setSelectedDifficulty] = React.useState('all')
  const [exportData, setExportData] = React.useState<any>(null)

  const filteredCourses = React.useMemo(() => {
    if (selectedDifficulty === 'all') return courses
    return getCoursesByDifficulty(selectedDifficulty)
  }, [courses, selectedDifficulty])

  const handleExportData = () => {
    const data = exportForDatabase()
    setExportData(data)
    
    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'forgetrain-course-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Analytics</h1>
            <p className="text-gray-600">
              Comprehensive analysis of all courses and content in the ForgeTrain platform
            </p>
          </div>
          <Button onClick={handleExportData} variant="secondary">
            Export Course Data
          </Button>
        </div>
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
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalCourses}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Items</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalContentItems}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageDuration}h</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Paths</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.learningPathways.length}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Distribution Charts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Difficulty Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Courses by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.coursesByDifficulty).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getDifficultyColor(difficulty)}>
                        {difficulty}
                      </Badge>
                      <span className="text-sm text-gray-600">{count} courses</span>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#094d57] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(count / analytics.totalCourses) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round((count / analytics.totalCourses) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Content Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(analytics.contentTypeDistribution).map(([type, count]) => {
                  const Icon = contentTypeIcons[type as keyof typeof contentTypeIcons]
                  return (
                    <div key={type} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${contentTypeColors[type as keyof typeof contentTypeColors]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{count}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Learning Pathways */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Pathways</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.learningPathways.map((pathway, index) => (
                  <motion.div
                    key={pathway.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{pathway.name}</h4>
                      <Badge variant="info">{pathway.weeks} weeks</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {pathway.courses.length} courses included
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pathway.courses.slice(0, 3).map(courseId => (
                        <Badge key={courseId} variant="secondary" size="sm">
                          {courseId}
                        </Badge>
                      ))}
                      {pathway.courses.length > 3 && (
                        <Badge variant="default" size="sm">
                          +{pathway.courses.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </motion.div>
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
          {/* Popular Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.popularTags.slice(0, 8).map((tag, index) => (
                  <div key={tag.tag} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TagIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{tag.tag}</span>
                    </div>
                    <Badge variant="secondary" size="sm">{tag.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094d57] focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-600">
                    Showing {filteredCourses.length} of {analytics.totalCourses} courses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Study Hours</span>
                  <span className="font-medium">
                    {courses.reduce((sum, course) => sum + course.estimatedHours, 0)}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Items per Course</span>
                  <span className="font-medium">
                    {Math.round(analytics.totalContentItems / analytics.totalCourses)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Languages Covered</span>
                  <span className="font-medium">8+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Course List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              Course Catalog ({filteredCourses.length} courses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.moduleId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.courseTitle}
                        </h3>
                        <Badge variant="secondary" size="sm">
                          {course.courseCode}
                        </Badge>
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{course.description}</p>
                      <p className="text-sm text-gray-500 mb-3">
                        <strong>Learning Objectives:</strong> {course.learningObjectives}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {course.estimatedHours}h
                      </p>
                      <p className="text-xs text-gray-500">
                        {course.totalItems} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 4).map(tag => (
                        <Badge key={tag} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {course.tags.length > 4 && (
                        <Badge variant="default" size="sm">
                          +{course.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {Object.entries(
                        course.contentItems.reduce((acc, item) => {
                          acc[item.type] = (acc[item.type] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => {
                        const Icon = contentTypeIcons[type as keyof typeof contentTypeIcons]
                        return (
                          <div key={type} className="flex items-center space-x-1 text-xs text-gray-500">
                            <Icon className="h-3 w-3" />
                            <span>{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {course.prerequisites && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                      <p className="text-sm text-yellow-800">
                        <strong>Prerequisites:</strong> {course.prerequisites}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
                    <p className="text-sm text-green-800">
                      <strong>Completion:</strong> {course.completionCriteria}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export Data Modal */}
      {exportData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setExportData(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Export Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Courses:</span>
                <span className="font-medium">{exportData.summary.totalCourses}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Content Items:</span>
                <span className="font-medium">{exportData.summary.totalContentItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Duration:</span>
                <span className="font-medium">{exportData.summary.averageDuration}h</span>
              </div>
              <div className="flex justify-between">
                <span>Content Types:</span>
                <span className="font-medium">{exportData.summary.contentTypes.join(', ')}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setExportData(null)}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}