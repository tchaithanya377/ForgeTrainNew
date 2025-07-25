// This file is now deprecated - all course data comes from Supabase modules table
// Keeping only type definitions for reference

export interface CourseModule {
  id: string
  title: string
  description: string
  learning_objectives: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_hours: number
  prerequisites: string
  tags: string[]
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

// All static course data has been removed
// Course data now comes dynamically from Supabase modules table
export const courseModules: CourseModule[] = []

// Categories will be generated dynamically from module tags
export const categories = {
  tutorial_categories: [],
  video_tutorial_categories: [],
  quiz_categories: [],
  code_challenge_categories: []
}

// Learning tracks will be generated dynamically
export const learningTracks: any[] = []

// Difficulty progression mapping
export const difficultyProgression = {
  beginner: {
    next: 'intermediate',
    color: '#10b981',
    description: 'Perfect for newcomers'
  },
  intermediate: {
    next: 'advanced',
    color: '#f59e0b',
    description: 'Building on the basics'
  },
  advanced: {
    next: null,
    color: '#ef4444',
    description: 'For experienced learners'
  }
}

// Popular programming languages supported
export const supportedLanguages = [
  {
    name: 'JavaScript',
    icon: 'javascript',
    color: '#f7df1e',
    popularity: 95
  },
  {
    name: 'Python',
    icon: 'python',
    color: '#3776ab',
    popularity: 90
  },
  {
    name: 'Java',
    icon: 'java',
    color: '#ed8b00',
    popularity: 85
  },
  {
    name: 'C++',
    icon: 'cpp',
    color: '#00599c',
    popularity: 80
  },
  {
    name: 'TypeScript',
    icon: 'typescript',
    color: '#3178c6',
    popularity: 75
  }
]