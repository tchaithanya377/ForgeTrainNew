import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing'
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
})

// Types based on your database schema
export type User = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'instructor' | 'placement_officer' | 'coordinator' | 'student' | 'editor'
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Student = {
  id: string
  user_id: string
  student_id: string
  first_name: string
  last_name: string
  date_of_birth?: string
  phone_number?: string
  address?: Record<string, any>
  institution?: string
  program?: string
  year_of_study?: number
  major?: string
  gpa?: number
  total_study_hours: number
  courses_completed: number
  courses_in_progress: number
  challenges_solved: number
  quizzes_passed: number
  current_streak_days: number
  longest_streak_days: number
  average_quiz_score: number
  average_challenge_score: number
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  preferred_learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  preferred_difficulty: 'beginner' | 'intermediate' | 'advanced'
  learning_goals?: string[]
  interests?: string[]
  total_points: number
  badges_earned: number
  certificates_earned: number
  daily_study_goal_minutes: number
  weekly_study_goal_hours: number
  last_active_date: string
  registration_date: string
  learning_analytics: Record<string, any>
  skill_assessments: Record<string, any>
  time_analytics: Record<string, any>
  engagement_metrics: Record<string, any>
  is_active: boolean
  enrollment_status: 'active' | 'inactive' | 'suspended' | 'graduated'
  notes?: string
  created_at: string
  updated_at: string
}

export type Module = {
  id: string
  title: string
  description: string
  learning_objectives: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_hours: number
  prerequisites: string
  tags: string[]
  is_published: boolean
  sort_order: number
  created_by: string
  created_at: string
  updated_at: string
}

export type ModuleItem = {
  id: string
  module_id: string
  item_type: 'text_tutorial' | 'video_tutorial' | 'quiz' | 'code_challenge'
  item_id: string
  sort_order: number
  is_required: boolean
  estimated_duration_minutes: number
  created_at: string
}

export type CodeChallenge = {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category_id?: string
  tags: string[]
  company_tags: string[]
  supported_languages: string[]
  starter_code: Record<string, any>
  solution_code: Record<string, any>
  test_cases: any[]
  constraints: string
  hints: string[]
  time_complexity: string
  space_complexity: string
  acceptance_rate: number
  total_submissions: number
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type Quiz = {
  id: string
  title: string
  description: string
  category_id?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  time_limit_minutes: number
  passing_score: number
  tags: string[]
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type TextTutorial = {
  id: string
  title: string
  subtitle: string
  learning_track: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  time_minutes: number
  summary: string
  category: string
  tags: string[]
  programming_languages: string[]
  learning_goals: string
  what_students_learn: string
  prerequisites: string
  introduction: string
  main_content: string
  conclusion: string
  fun_facts: string
  memes_humor: string
  learning_sections: any[]
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
  category_id?: string
}

export type VideoTutorial = {
  id: string
  title: string
  subtitle: string
  learning_track: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  summary: string
  category_id?: string
  tags: string[]
  programming_languages: string[]
  learning_goals: string
  what_students_learn: string
  prerequisites: string
  video_url: string
  thumbnail_url: string
  video_chapters: any[]
  resources: any[]
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
}