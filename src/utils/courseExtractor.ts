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
  type: 'text_tutorial' | 'video_tutorial' | 'quiz' | 'code_challenge'
  title: string
  description: string
  difficulty: string
  estimatedMinutes: number
  order: number
  category?: string
  programmingLanguages?: string[]
}

export interface CourseAnalytics {
  totalCourses: number
  coursesByDifficulty: Record<string, number>
  coursesByCategory: Record<string, number>
  averageDuration: number
  totalContentItems: number
  contentTypeDistribution: Record<string, number>
  popularTags: Array<{ tag: string; count: number }>
  learningPathways: Array<{ name: string; courses: string[]; weeks: number }>
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
 * Analyze course data and provide comprehensive analytics
 */
export function analyzeCourseData(): CourseAnalytics {
  const courses = extractAllCourses()
  
  // Count courses by difficulty
  const coursesByDifficulty = courses.reduce((acc, course) => {
    acc[course.difficulty] = (acc[course.difficulty] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Count courses by category (based on tags)
  const coursesByCategory = courses.reduce((acc, course) => {
    course.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  // Calculate average duration
  const totalHours = courses.reduce((sum, course) => sum + course.estimatedHours, 0)
  const averageDuration = totalHours / courses.length

  // Count total content items
  const totalContentItems = courses.reduce((sum, course) => sum + course.totalItems, 0)

  // Content type distribution
  const contentTypeDistribution = courses.reduce((acc, course) => {
    course.contentItems.forEach(item => {
      acc[item.type] = (acc[item.type] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  // Popular tags
  const tagCounts = courses.reduce((acc, course) => {
    course.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const popularTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Learning pathways
  const learningPathways = learningTracks.map(track => ({
    name: track.name,
    courses: track.modules,
    weeks: track.estimated_weeks
  }))

  return {
    totalCourses: courses.length,
    coursesByDifficulty,
    coursesByCategory,
    averageDuration: Math.round(averageDuration * 10) / 10,
    totalContentItems,
    contentTypeDistribution,
    popularTags,
    learningPathways
  }
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
  const analytics = analyzeCourseData()
  
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