// Course extraction and analysis utilities
import { courseModules, categories, learningTracks } from '../data/courseData'
import type { CourseModule, ModuleItem } from '../data/courseData'

export interface ExtractedCourse {
  courseTitle: string
  courseCode: string
  moduleId: string
  moduleName: string
  description: string
  difficulty: string
  estimatedHours: number
  prerequisites: string
  tags: string[]
  contentItems: ContentItem[]
  learningObjectives: string
  totalItems: number
  completionCriteria: string
}

export interface ContentItem {
  type: string
  title: string
  description: string
  difficulty: string
  estimatedMinutes: number
  order: number
  category: string
  programmingLanguages: string[]
}

// Sample course data for demonstration
export const sampleCourses = [
  {
    id: 'course-1',
    title: 'JavaScript Fundamentals',
    description: 'Master the basics of JavaScript programming with hands-on projects and real-world examples.',
    learning_objectives: 'Learn variables, functions, objects, arrays, and DOM manipulation',
    difficulty: 'beginner',
    estimated_duration_hours: 8,
    prerequisites: 'Basic computer literacy',
    tags: ['JavaScript', 'Web Development', 'Frontend'],
    is_published: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-2',
    title: 'React Development',
    description: 'Build modern web applications with React. Learn hooks, state management, and component architecture.',
    learning_objectives: 'Master React components, hooks, state management, and modern React patterns',
    difficulty: 'intermediate',
    estimated_duration_hours: 12,
    prerequisites: 'JavaScript Fundamentals',
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    is_published: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-3',
    title: 'Python for Data Science',
    description: 'Learn Python programming for data analysis, machine learning, and scientific computing.',
    learning_objectives: 'Master Python basics, data manipulation, visualization, and machine learning',
    difficulty: 'intermediate',
    estimated_duration_hours: 15,
    prerequisites: 'Basic programming concepts',
    tags: ['Python', 'Data Science', 'Machine Learning', 'AI'],
    is_published: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-4',
    title: 'Advanced Algorithms',
    description: 'Deep dive into algorithm design, complexity analysis, and problem-solving techniques.',
    learning_objectives: 'Master algorithm design, complexity analysis, and advanced problem-solving',
    difficulty: 'advanced',
    estimated_duration_hours: 20,
    prerequisites: 'Strong programming fundamentals',
    tags: ['Algorithms', 'Data Structures', 'Computer Science'],
    is_published: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-5',
    title: 'Full Stack Web Development',
    description: 'Build complete web applications from frontend to backend with modern technologies.',
    learning_objectives: 'Master full-stack development with React, Node.js, and databases',
    difficulty: 'intermediate',
    estimated_duration_hours: 18,
    prerequisites: 'JavaScript and basic web concepts',
    tags: ['Full Stack', 'React', 'Node.js', 'Database', 'Web Development'],
    is_published: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-6',
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to machine learning concepts, algorithms, and practical applications.',
    learning_objectives: 'Learn ML concepts, algorithms, and build your first ML models',
    difficulty: 'advanced',
    estimated_duration_hours: 16,
    prerequisites: 'Python and basic statistics',
    tags: ['Machine Learning', 'AI', 'Python', 'Data Science'],
    is_published: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-7',
    title: 'Mobile App Development',
    description: 'Create mobile applications for iOS and Android using React Native.',
    learning_objectives: 'Build cross-platform mobile apps with React Native',
    difficulty: 'intermediate',
    estimated_duration_hours: 14,
    prerequisites: 'React fundamentals',
    tags: ['Mobile Development', 'React Native', 'iOS', 'Android'],
    is_published: true,
    sort_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-8',
    title: 'Database Design & SQL',
    description: 'Learn database design principles, SQL programming, and data modeling.',
    learning_objectives: 'Master database design, SQL, and data modeling concepts',
    difficulty: 'beginner',
    estimated_duration_hours: 10,
    prerequisites: 'Basic computer concepts',
    tags: ['Database', 'SQL', 'Data Modeling', 'Backend'],
    is_published: true,
    sort_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
]

// Function to seed sample data to Supabase
export async function seedSampleCourses() {
  const { supabase } = await import('../lib/supabase')
  
  try {
    // Insert sample courses
    const { data, error } = await supabase
      .from('modules')
      .insert(sampleCourses)
      .select()
    
    if (error) {
      console.error('Error seeding sample courses:', error)
      return { success: false, error }
    }
    
    console.log('Sample courses seeded successfully:', data)
    return { success: true, data }
  } catch (err) {
    console.error('Failed to seed sample courses:', err)
    return { success: false, error: err }
  }
}

// Function to check if database has courses
export async function checkDatabaseCourses() {
  const { supabase } = await import('../lib/supabase')
  
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('id, title, is_published')
      .eq('is_published', true)
    
    if (error) {
      console.error('Error checking database courses:', error)
      return { success: false, error, count: 0 }
    }
    
    return { success: true, count: data?.length || 0, data }
  } catch (err) {
    console.error('Failed to check database courses:', err)
    return { success: false, error: err, count: 0 }
  }
}

// Function to get course analytics
export function analyzeCourseData(courses: any[]) {
  if (!courses || courses.length === 0) {
    return {
      totalCourses: 0,
      coursesByDifficulty: {},
      coursesByCategory: {},
      averageDuration: 0,
      totalContentItems: 0,
      contentTypeDistribution: {}
    }
  }

  const coursesByDifficulty = courses.reduce((acc, course) => {
    acc[course.difficulty] = (acc[course.difficulty] || 0) + 1
    return acc
  }, {})

  const coursesByCategory = courses.reduce((acc, course) => {
    course.tags?.forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {})

  const totalDuration = courses.reduce((sum, course) => sum + (course.estimated_duration_hours || 0), 0)
  const averageDuration = totalDuration / courses.length

  return {
    totalCourses: courses.length,
    coursesByDifficulty,
    coursesByCategory,
    averageDuration: Math.round(averageDuration * 10) / 10,
    totalContentItems: courses.length * 8, // Estimate 8 items per course
    contentTypeDistribution: {
      tutorials: Math.round(courses.length * 0.4),
      quizzes: Math.round(courses.length * 0.3),
      challenges: Math.round(courses.length * 0.2),
      videos: Math.round(courses.length * 0.1)
    }
  }
}

/**
 * Extract all courses from the module data
 */
export function extractAllCourses(): ExtractedCourse[] {
  const extractedCourses: ExtractedCourse[] = []

  courseModules.forEach((module) => {
    const contentItems: ContentItem[] = module.items.map((item, index) => ({
      type: item.item_type,
      title: item.title,
      description: item.description,
      difficulty: item.difficulty,
      estimatedMinutes: item.estimated_duration_minutes,
      order: item.sort_order || index + 1,
      category: getCategoryForContentType(item.item_type),
      programmingLanguages: getLanguagesForContent(item)
    }))

    const extractedCourse: ExtractedCourse = {
      courseTitle: module.title,
      courseCode: generateCourseCode(module.title, module.id),
      moduleId: module.id,
      moduleName: module.title,
      description: module.description,
      difficulty: module.difficulty,
      estimatedHours: module.estimated_duration_hours,
      prerequisites: module.prerequisites,
      tags: module.tags,
      contentItems,
      learningObjectives: module.learning_objectives,
      totalItems: contentItems.length,
      completionCriteria: generateCompletionCriteria(contentItems)
    }

    extractedCourses.push(extractedCourse)
  })

  return extractedCourses
}

/**
 * Generate a course code based on title and ID
 */
function generateCourseCode(title: string, id: string): string {
  const words = title.split(' ')
  const acronym = words.map(word => word.charAt(0).toUpperCase()).join('')
  const numericPart = id.split('-')[0].toUpperCase().slice(0, 3)
  return `${acronym}${numericPart}`
}

/**
 * Get category for content type
 */
function getCategoryForContentType(contentType: string): string {
  const categoryMap = {
    'text_tutorial': 'Tutorial',
    'video_tutorial': 'Video',
    'quiz': 'Assessment',
    'code_challenge': 'Practice'
  }
  return categoryMap[contentType as keyof typeof categoryMap] || 'General'
}

/**
 * Extract programming languages from content
 */
function getLanguagesForContent(item: ModuleItem): string[] {
  if (item.content && item.content.programming_languages) {
    return item.content.programming_languages
  }
  if (item.content && item.content.supported_languages) {
    return item.content.supported_languages
  }
  return []
}

/**
 * Generate completion criteria based on content items
 */
function generateCompletionCriteria(items: ContentItem[]): string {
  const tutorialCount = items.filter(item => 
    item.type === 'text_tutorial' || item.type === 'video_tutorial'
  ).length
  
  const assessmentCount = items.filter(item => 
    item.type === 'quiz' || item.type === 'code_challenge'
  ).length

  let criteria = []
  
  if (tutorialCount > 0) {
    criteria.push(`Complete all ${tutorialCount} tutorial(s)`)
  }
  
  if (assessmentCount > 0) {
    criteria.push(`Pass all ${assessmentCount} assessment(s) with 70% or higher`)
  }

  return criteria.join(' and ')
}

/**
 * Find courses by difficulty level
 */
export function getCoursesByDifficulty(difficulty: string): ExtractedCourse[] {
  return extractAllCourses().filter(course => 
    course.difficulty.toLowerCase() === difficulty.toLowerCase()
  )
}

/**
 * Find courses by tag
 */
export function getCoursesByTag(tag: string): ExtractedCourse[] {
  return extractAllCourses().filter(course => 
    course.tags.some(courseTag => 
      courseTag.toLowerCase().includes(tag.toLowerCase())
    )
  )
}

/**
 * Get recommended courses based on completed courses
 */
export function getRecommendedCourses(completedCourseIds: string[]): ExtractedCourse[] {
  const allCourses = extractAllCourses()
  const completedCourses = allCourses.filter(course => 
    completedCourseIds.includes(course.moduleId)
  )
  
  // Get tags from completed courses
  const completedTags = completedCourses.flatMap(course => course.tags)
  const tagFrequency = completedTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Find courses with similar tags that haven't been completed
  const recommendations = allCourses
    .filter(course => !completedCourseIds.includes(course.moduleId))
    .map(course => {
      const relevanceScore = course.tags.reduce((score, tag) => {
        return score + (tagFrequency[tag] || 0)
      }, 0)
      return { course, relevanceScore }
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5)
    .map(item => item.course)

  return recommendations
}

/**
 * Export course data for seeding database
 */
export function exportForDatabase() {
  const courses = extractAllCourses()
  const analytics = analyzeCourseData(courses) // Pass the extracted courses to analyzeCourseData
  
  return {
    modules: courseModules,
    categories,
    learningTracks,
    extractedCourses: courses,
    analytics,
    summary: {
      totalCourses: analytics.totalCourses,
      totalContentItems: analytics.totalContentItems,
      averageDuration: analytics.averageDuration,
      supportedDifficulties: Object.keys(analytics.coursesByDifficulty),
      contentTypes: Object.keys(analytics.contentTypeDistribution)
    }
  }
}