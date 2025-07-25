import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  PlayIcon,
  BookOpenIcon,
  AcademicCapIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WifiIcon,
  CloudIcon,
  SparklesIcon,
  ArrowRightIcon,
  UsersIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { formatDuration, getDifficultyColor } from '../lib/utils'

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

// Generate modern thumbnail based on course content
const generateThumbnail = (title: string, tags: string[]) => {
  const lowerTitle = title.toLowerCase()
  const lowerTags = tags.map(tag => tag.toLowerCase()).join(' ')
  const content = `${lowerTitle} ${lowerTags}`
  
  if (content.includes('python')) return 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=600'
  if (content.includes('javascript') || content.includes('js')) return 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600'
  if (content.includes('react')) return 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600'
  if (content.includes('data') || content.includes('algorithm')) return 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=600'
  if (content.includes('web') || content.includes('frontend') || content.includes('backend')) return 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600'
  if (content.includes('machine') || content.includes('ai') || content.includes('ml')) return 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600'
  if (content.includes('mobile') || content.includes('android') || content.includes('ios')) return 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=600'
  if (content.includes('database') || content.includes('sql')) return 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=600'
  
  // Default programming image
  return 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600'
}

export function CoursesPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedDifficulty, setSelectedDifficulty] = React.useState('All')
  const [sortBy, setSortBy] = React.useState('popular')
  const { user } = useAuthStore()
  const { logSearch, logFeatureUsage } = useLogger()
  const navigate = useNavigate()

  // Fetch ONLY published modules from Supabase
  const { 
    data: modules, 
    isLoading, 
    error,
    isSuccess,
    refetch 
  } = useQuery({
    queryKey: ['published-modules'],
    queryFn: async () => {
      const startTime = performance.now()
      
      try {
        console.log('Fetching PUBLISHED modules from Supabase...')
        const { data, error } = await supabase
          .from('modules')
          .select(`
            id,
            title,
            description,
            difficulty,
            estimated_duration_hours,
            tags,
            learning_objectives,
            prerequisites,
            is_published,
            sort_order,
            created_at,
            updated_at
          `)
          .eq('is_published', true)  // Only published modules
          .order('sort_order', { ascending: true })
        
        const endTime = performance.now()
        console.log(`Supabase published modules query took ${endTime - startTime}ms, found ${data?.length || 0} modules`)
        console.log('Published modules data:', data)
        
        if (error) {
          console.error('Supabase query error:', error)
          throw error
        }
        
        return data || []
      } catch (err) {
        console.error('Failed to fetch published modules:', err)
        throw err
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  })

  // Transform modules to modern course format
  const courses = React.useMemo(() => {
    if (!modules || modules.length === 0) return []
    
    return modules.map((module: any) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      difficulty: module.difficulty,
      estimated_duration_hours: module.estimated_duration_hours,
      tags: Array.isArray(module.tags) ? module.tags : [],
      learning_objectives: module.learning_objectives,
      prerequisites: module.prerequisites,
      is_published: module.is_published,
      sort_order: module.sort_order,
      created_at: module.created_at,
      updated_at: module.updated_at,
      // Generated fields for modern display
      thumbnail: generateThumbnail(module.title, Array.isArray(module.tags) ? module.tags : []),
      instructor: 'ForgeTrain Expert Team',
      rating: 4.5 + Math.random() * 0.4,
      students: Math.floor(Math.random() * 2000) + 500,
      completion_rate: Math.floor(Math.random() * 20) + 75,
      lessons: Math.floor(Math.random() * 15) + 8,
      level: module.difficulty,
      price: 'Free',
      certificate: true,
      trending: Math.random() > 0.7,
    }))
  }, [modules])

  // Dynamic categories from actual course tags
  const categories = React.useMemo(() => {
    if (!courses || courses.length === 0) return ['All']
    
    const allTags = courses.flatMap(course => course.tags)
    const uniqueTags = [...new Set(allTags)]
    return ['All', ...uniqueTags.slice(0, 8)]
  }, [courses])

  // Filter courses based on search and filters
  const filteredCourses = React.useMemo(() => {
    if (!courses) return []
    
    const startTime = performance.now()
    
    let filtered = courses.filter(course => {
      const matchesSearch = !searchQuery || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        course.learning_objectives?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDifficulty = selectedDifficulty === 'All' || 
        course.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
      
      return matchesSearch && matchesDifficulty
    })

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'duration':
        filtered.sort((a, b) => (a.estimated_duration_hours || 0) - (b.estimated_duration_hours || 0))
        break
      default: // popular
        filtered.sort((a, b) => (b.students || 0) - (a.students || 0))
    }

    const endTime = performance.now()
    console.log(`Filtering ${courses.length} courses took ${endTime - startTime}ms`)

    if (searchQuery) {
      logSearch(searchQuery, filtered.length, {
        difficulty: selectedDifficulty,
        sort_by: sortBy,
        total_modules: courses.length,
        performance_ms: endTime - startTime
      })
    }

    return filtered
  }, [courses, searchQuery, selectedDifficulty, sortBy, logSearch])

  // Handle course enrollment
  const handleEnrollCourse = async (courseId: string, courseTitle: string) => {
    if (!user) {
      navigate('/auth/signin')
      return
    }

    try {
      // Log enrollment
      logFeatureUsage('course_enrollment_clicked', {
        course_id: courseId,
        course_title: courseTitle,
        user_id: user.id
      })

      // Navigate to course learning page
      navigate(`/learn/${courseId}`)
    } catch (error) {
      console.error('Enrollment error:', error)
    }
  }

  // Log page view
  React.useEffect(() => {
    logFeatureUsage('courses_page_view', {
      total_published_modules: modules?.length || 0,
      filtered_courses: filteredCourses.length,
      supabase_connected: isSuccess,
      has_error: !!error,
      is_loading: isLoading
    })
  }, [logFeatureUsage, modules?.length, filteredCourses.length, isSuccess, error, isLoading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Modern Header with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] p-8 md:p-12">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex items-center space-x-3 mb-4"
                  >
                    <SparklesIcon className="h-8 w-8 text-[#f1872c]" />
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                      Course Catalog
                    </h1>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-xl text-gray-200 mb-6 max-w-2xl"
                  >
                    Discover cutting-edge courses powered by our dynamic learning platform
                  </motion.p>
                  
                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex items-center space-x-8"
                  >
                    <div className="flex items-center space-x-2 text-white">
                      <BookOpenIcon className="h-5 w-5 text-[#f1872c]" />
                      <span className="font-semibold">{modules?.length || 0} Courses</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <UsersIcon className="h-5 w-5 text-[#f1872c]" />
                      <span className="font-semibold">10K+ Students</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <TrophyIcon className="h-5 w-5 text-[#f1872c]" />
                      <span className="font-semibold">95% Success Rate</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Connection Status - Modern Design */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="hidden lg:block"
                >
                  {isLoading && (
                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span className="text-white font-medium">Loading courses...</span>
                    </div>
                  )}
                  {isSuccess && modules && modules.length > 0 && (
                    <div className="flex items-center space-x-3 bg-green-500/20 backdrop-blur-md border border-green-400/30 px-6 py-3 rounded-2xl">
                      <CheckCircleIcon className="h-5 w-5 text-green-300" />
                      <span className="text-white font-medium">Live • {modules.length} courses</span>
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center space-x-3 bg-red-500/20 backdrop-blur-md border border-red-400/30 px-6 py-3 rounded-2xl">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-300" />
                      <button 
                        onClick={() => refetch()}
                        className="text-white font-medium hover:text-red-200 transition-colors"
                      >
                        Retry Connection
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modern Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    placeholder="Search courses, topics, or learning objectives..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<MagnifyingGlassIcon />}
                    className="pl-12 pr-4 py-4 text-lg bg-white/50 border-0 rounded-2xl focus:ring-2 focus:ring-[#094d57]/20 focus:bg-white/80 transition-all duration-300"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-6 py-4 bg-white/50 border-0 rounded-2xl focus:ring-2 focus:ring-[#094d57]/20 focus:bg-white/80 transition-all duration-300 font-medium"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-6 py-4 bg-white/50 border-0 rounded-2xl focus:ring-2 focus:ring-[#094d57]/20 focus:bg-white/80 transition-all duration-300 font-medium"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>

            {/* Dynamic Category Pills */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-3 mt-6">
                {categories.map(category => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (category === 'All') {
                        setSearchQuery('')
                      } else {
                        setSearchQuery(category)
                      }
                    }}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                      (category === 'All' && !searchQuery) || searchQuery === category
                        ? 'bg-[#094d57] text-white shadow-lg shadow-[#094d57]/25'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-lg">
              {isLoading ? (
                'Loading courses from database...'
              ) : (
                <>
                  Showing <span className="font-bold text-[#094d57]">{filteredCourses.length}</span> courses
                  {searchQuery && ` for "${searchQuery}"`}
                  {modules && ` from ${modules.length} published modules`}
                </>
              )}
            </p>
            
            {/* View Toggle */}
            <div className="hidden md:flex items-center space-x-2 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-1">
              <button className="px-4 py-2 bg-[#094d57] text-white rounded-xl font-medium">
                Grid View
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-[#094d57] rounded-xl font-medium transition-colors">
                List View
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State - Modern Skeleton */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-3xl"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-3"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-3/4 mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-20"></div>
                      <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connection Failed</h3>
              <p className="text-gray-600 mb-6">
                Unable to connect to the course database. Please check your connection.
              </p>
              <Button variant="primary" onClick={() => refetch()} className="rounded-2xl">
                <CloudIcon className="h-5 w-5 mr-2" />
                Retry Connection
              </Button>
            </div>
          </motion.div>
        )}

        {/* Modern Course Grid */}
        {!isLoading && !error && filteredCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-0">
                    {/* Course Thumbnail with Modern Overlay */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Trending Badge */}
                      {course.trending && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-[#f1872c] to-[#ff6b35] text-white border-0 rounded-2xl px-3 py-1">
                            🔥 Trending
                          </Badge>
                        </div>
                      )}
                      
                      {/* Difficulty Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className={`${getDifficultyColor(course.difficulty)} border-0 rounded-2xl px-3 py-1 font-medium`}>
                          {course.difficulty}
                        </Badge>
                      </div>
                      
                      {/* Rating */}
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-2xl">
                          <StarIcon className="h-4 w-4 fill-current text-yellow-400" />
                          <span className="font-medium">{course.rating?.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl"
                        >
                          <PlayIcon className="h-8 w-8 text-[#094d57] ml-1" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      {/* Course Meta */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{formatDuration((course.estimated_duration_hours || 1) * 60)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpenIcon className="h-4 w-4" />
                            <span>{course.lessons} lessons</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <UsersIcon className="h-4 w-4" />
                            <span>{(course.students / 1000).toFixed(1)}K</span>
                          </div>
                        </div>
                        <Badge variant="success" className="rounded-2xl px-3 py-1">
                          {course.price}
                        </Badge>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#094d57] transition-colors">
                        {course.title}
                      </h3>
                      
                      {/* Course Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Learning Objectives */}
                      {course.learning_objectives && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2 font-medium">What you'll learn:</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.learning_objectives}
                          </p>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <span>Completion Rate</span>
                          <span className="font-medium">{course.completion_rate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.completion_rate}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="bg-gradient-to-r from-[#094d57] to-[#0c5a66] h-2 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {course.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="rounded-2xl px-3 py-1 text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {course.tags.length > 3 && (
                          <Badge variant="default" className="rounded-2xl px-3 py-1 text-xs">
                            +{course.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Instructor */}
                      {/* Removed instructor, expert instructor, and certificate display as requested */}

                      {/* Enroll Button */}
                      <Button 
                        variant="primary" 
                        className="w-full rounded-2xl py-3 bg-gradient-to-r from-[#094d57] to-[#0c5a66] hover:from-[#073e47] hover:to-[#094d57] shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => handleEnrollCourse(course.id, course.title)}
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <BookOpenIcon className="h-5 w-5" />
                          <span className="font-semibold">Start Learning</span>
                          <ArrowRightIcon className="h-4 w-4" />
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State - No Published Modules */}
        {!isLoading && !error && filteredCourses.length === 0 && modules && modules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CloudIcon className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Published Courses</h3>
              <p className="text-gray-600 mb-6">
                No published modules found in the database. Publish some modules to get started.
              </p>
              <Button variant="outline" onClick={() => refetch()} className="rounded-2xl">
                <WifiIcon className="h-5 w-5 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>
        )}

        {/* No Results State */}
        {!isLoading && !error && filteredCourses.length === 0 && modules && modules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No courses found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDifficulty('All')
                }}
                className="rounded-2xl"
              >
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}

        {/* Performance Debug Info (Development Only) */}
        {import.meta.env.DEV && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-md text-white p-4 rounded-2xl text-xs font-mono border border-white/10"
          >
            <div className="space-y-1">
              <div>Published Modules: {modules?.length || 0}</div>
              <div>Filtered: {filteredCourses.length}</div>
              <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
              <div>Error: {error ? 'Yes' : 'No'}</div>
              <div>Connected: {isSuccess ? 'Yes' : 'No'}</div>
              <div>Query: is_published = true</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}