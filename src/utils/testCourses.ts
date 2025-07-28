// Test utility for course catalog functionality
import { seedSampleCourses, checkDatabaseCourses, analyzeCourseData } from './courseExtractor'

export async function testCourseCatalog() {
  console.log('🧪 Testing Course Catalog Functionality...')
  
  // Check current database state
  console.log('📊 Checking database state...')
  const dbCheck = await checkDatabaseCourses()
  
  if (dbCheck.success) {
    console.log(`✅ Database connected. Found ${dbCheck.count} published courses.`)
    
    if (dbCheck.count === 0) {
      console.log('📝 No courses found. Seeding sample data...')
      const seedResult = await seedSampleCourses()
      
      if (seedResult.success) {
        console.log('✅ Sample courses seeded successfully!')
        
        // Re-check database
        const reCheck = await checkDatabaseCourses()
        if (reCheck.success) {
          console.log(`📊 Database now contains ${reCheck.count} courses.`)
          
          // Analyze the data
          if (reCheck.data) {
            const analytics = analyzeCourseData(reCheck.data)
            console.log('📈 Course Analytics:', analytics)
          }
        }
      } else {
        console.error('❌ Failed to seed sample courses:', seedResult.error)
      }
    } else {
      console.log('📊 Courses already exist in database.')
      
      // Analyze existing data
      if (dbCheck.data) {
        const analytics = analyzeCourseData(dbCheck.data)
        console.log('📈 Course Analytics:', analytics)
      }
    }
  } else {
    console.error('❌ Database connection failed:', dbCheck.error)
  }
  
  console.log('🏁 Course catalog test completed.')
}

// Function to get course statistics for display
export function getCourseStats(courses: any[]) {
  if (!courses || courses.length === 0) {
    return {
      totalCourses: 0,
      totalStudents: 0,
      averageRating: 0,
      averageCompletion: 0,
      difficultyBreakdown: {},
      topCategories: []
    }
  }
  
  const totalStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0)
  const totalRating = courses.reduce((sum, course) => sum + (course.rating || 0), 0)
  const totalCompletion = courses.reduce((sum, course) => sum + (course.completion_rate || 0), 0)
  
  const difficultyBreakdown = courses.reduce((acc, course) => {
    acc[course.difficulty] = (acc[course.difficulty] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const categoryCounts = courses.reduce((acc, course) => {
    course.tags?.forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)
  
  const topCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }))
  
  return {
    totalCourses: courses.length,
    totalStudents,
    averageRating: Math.round((totalRating / courses.length) * 10) / 10,
    averageCompletion: Math.round(totalCompletion / courses.length),
    difficultyBreakdown,
    topCategories
  }
}

// Function to validate course data structure
export function validateCourseData(course: any) {
  const requiredFields = ['id', 'title', 'description', 'difficulty', 'tags']
  const missingFields = requiredFields.filter(field => !course[field])
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      missingFields,
      errors: [`Missing required fields: ${missingFields.join(', ')}`]
    }
  }
  
  const errors = []
  
  // Validate difficulty
  if (!['beginner', 'intermediate', 'advanced'].includes(course.difficulty)) {
    errors.push(`Invalid difficulty: ${course.difficulty}`)
  }
  
  // Validate tags
  if (!Array.isArray(course.tags)) {
    errors.push('Tags must be an array')
  }
  
  // Validate duration
  if (course.estimated_duration_hours && course.estimated_duration_hours <= 0) {
    errors.push('Duration must be positive')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Export test function for use in development
if (import.meta.env.DEV) {
  // @ts-ignore
  window.testCourseCatalog = testCourseCatalog
  // @ts-ignore
  window.getCourseStats = getCourseStats
  // @ts-ignore
  window.validateCourseData = validateCourseData
} 