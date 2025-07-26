import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'instructor' | 'editor' | 'student'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Student {
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
  learning_goals: string[]
  interests: string[]
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

interface AuthState {
  user: User | null
  student: Student | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => void
  initialize: () => void
  updateProfile: (updates: Partial<Student>) => void
  sendOTP: (email: string) => Promise<void>
  verifyOTP: (email: string, otp: string) => Promise<void>
  resendOTP: (email: string) => Promise<void>
}

// OTP storage for verification
let otpStorage: Record<string, { otp: string; expires: number; email: string; verified: boolean }> = {}

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send real email using Supabase Edge Function
const sendRealEmail = async (email: string, otp: string, type: 'signin' | 'signup') => {
  try {
    // Call Supabase Edge Function with actual project ref
    const response = await fetch('https://gwqcpnoxbflbvdvpvnyj.supabase.co/functions/v1/send-otp-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, otp, type })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function error:', errorText);
      throw new Error(`Email delivery failed: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      student: null,
      loading: false,
      initialized: false,

      initialize: async () => {
        try {
          // Check if user is already signed in with Supabase
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Session check error:', error)
            set({ initialized: true })
            return
          }

          if (session?.user) {
            // Fetch user data from database
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (userData) {
              // Fetch student data
              const { data: studentData } = await supabase
                .from('students')
                .select('*')
                .eq('user_id', session.user.id)
                .single()

              set({ 
                user: userData, 
                student: studentData,
                initialized: true 
              })
            } else {
              await supabase.auth.signOut()
              set({ initialized: true })
            }
          } else {
            set({ initialized: true })
          }
        } catch (error) {
          console.error('Initialize error:', error)
          set({ initialized: true })
        }
      },

      signIn: async (email: string, password: string) => {
        set({ loading: true })
        try {
          // Check if OTP was verified for this email
          const otpData = otpStorage[email]
          if (!otpData || !otpData.verified) {
            throw new Error('Please verify your email with OTP first')
          }
          // Sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (error) {
            console.error('Supabase sign in error:', error)
            throw new Error(error.message)
          }
          if (!data.user) {
            throw new Error('Sign in failed - no user data returned')
          }
          // Ensure user exists in public.users
          let { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()
          if (userError && userError.code === 'PGRST116') { // Not found
            // Insert into public.users
            const { error: userInsertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || '',
                role: 'student', // Set default role
              })
            if (userInsertError) {
              console.error('User insert error:', userInsertError)
              throw new Error('Failed to create user record')
            }
            // Refetch
            const userFetch = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            userData = userFetch.data
          } else if (userError && userError.code !== 'PGRST116') {
            console.error('User fetch error:', userError)
            throw new Error('Failed to fetch user data')
          }
          // Ensure student exists in students
          let { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', data.user.id)
            .single()
          if (studentError && studentError.code === 'PGRST116') { // Not found
            // Insert into students
            const fullName = data.user.user_metadata?.full_name || ''
            const [firstName, ...lastNameArr] = fullName.split(' ')
            const lastName = lastNameArr.join(' ')
            const { error: studentInsertError } = await supabase
              .from('students')
              .insert({
                user_id: data.user.id,
                student_id: data.user.email,
                first_name: firstName || 'Student',
                last_name: lastName || 'User',
                total_study_hours: 0,
                courses_completed: 0,
                courses_in_progress: 0,
                challenges_solved: 0,
                quizzes_passed: 0,
                current_streak_days: 0,
                longest_streak_days: 0,
                average_quiz_score: 0,
                average_challenge_score: 0,
                skill_level: 'beginner',
                preferred_learning_style: 'visual',
                preferred_difficulty: 'beginner',
                learning_goals: [],
                interests: [],
                total_points: 0,
                badges_earned: 0,
                certificates_earned: 0,
                daily_study_goal_minutes: 60,
                weekly_study_goal_hours: 10,
                last_active_date: new Date().toISOString().split('T')[0],
                registration_date: new Date().toISOString().split('T')[0],
                learning_analytics: {},
                skill_assessments: {},
                time_analytics: {},
                engagement_metrics: {},
                is_active: true,
                enrollment_status: 'active'
              })
            if (studentInsertError) {
              console.error('Student insert error:', studentInsertError)
              throw new Error('Failed to create student profile')
            }
            // Refetch
            const studentFetch = await supabase
              .from('students')
              .select('*')
              .eq('user_id', data.user.id)
              .single()
            studentData = studentFetch.data
          } else if (studentError && studentError.code !== 'PGRST116') {
            console.error('Student fetch error:', studentError)
            throw new Error('Failed to fetch student data')
          }
          // Clear OTP data
          delete otpStorage[email]
          localStorage.removeItem(`otp_${email}`)
          set({ 
            user: userData, 
            student: studentData,
            loading: false 
          })
          toast.success('Welcome back!')
        } catch (error) {
          set({ loading: false })
          console.error('❌ Sign in error:', error)
          throw error
        }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        set({ loading: true })
        try {
          // Sign up with Supabase
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              }
            }
          })
          if (error) {
            console.error('Supabase sign up error:', error)
            throw new Error(error.message)
          }
          if (!data.user) {
            throw new Error('Sign up failed - no user data returned')
          }
          set({ loading: false })
          // No DB insert here; will be handled on first sign in
          toast.success('Account created! Please check your email to confirm and then sign in.')
        } catch (error: any) {
          set({ loading: false })
          console.error('❌ Sign up error:', error)
          throw error
        }
      },

      sendOTP: async (email: string) => {
        set({ loading: true })
        
        try {
          const otp = generateOTP()
          const expires = Date.now() + 5 * 60 * 1000 // 5 minutes
          
          // Store OTP
          otpStorage[email] = { otp, expires, email, verified: false }
          localStorage.setItem(`otp_${email}`, JSON.stringify({
            otp,
            expires,
            verified: false,
            timestamp: new Date().toISOString()
          }))

          try {
            // Try to send real email
            await sendRealEmail(email, otp, 'signin')
            toast.success(`OTP sent to ${email}`)
          } catch (emailError) {
            console.warn('❌ Real email failed, using fallback:', emailError)
            // Fallback: Show OTP in console and toast for demo
            toast.success(`OTP generated for ${email}. Demo OTP: ${otp}`)
          }

          set({ loading: false })
        } catch (error: any) {
          set({ loading: false })
          console.error('❌ Send OTP error:', error)
          throw error
        }
      },

      verifyOTP: async (email: string, otp: string) => {
        set({ loading: true })
        
        try {
          // Check memory storage first
          let storedOTP = otpStorage[email]
          
          // Fallback to localStorage
          if (!storedOTP) {
            const localOTP = localStorage.getItem(`otp_${email}`)
            if (localOTP) {
              const parsed = JSON.parse(localOTP)
              storedOTP = {
                otp: parsed.otp,
                expires: parsed.expires,
                email: email,
                verified: parsed.verified || false
              }
              // Restore to memory
              otpStorage[email] = storedOTP
            }
          }
          
          if (!storedOTP) {
            throw new Error('OTP not found. Please request a new one.')
          }
          
          if (Date.now() > storedOTP.expires) {
            delete otpStorage[email]
            localStorage.removeItem(`otp_${email}`)
            throw new Error('OTP has expired. Please request a new one.')
          }
          
          if (storedOTP.otp !== otp) {
            throw new Error('Invalid OTP. Please check and try again.')
          }
          
          // Mark as verified
          storedOTP.verified = true
          otpStorage[email] = storedOTP
          localStorage.setItem(`otp_${email}`, JSON.stringify({
            ...storedOTP,
            verified: true,
            verifiedAt: new Date().toISOString()
          }))
          
          set({ loading: false })
          toast.success('OTP verified successfully!')
        } catch (error: any) {
          set({ loading: false })
          console.error('❌ OTP verification error:', error)
          throw error
        }
      },

      resendOTP: async (email: string) => {
        // Just call sendOTP again
        await get().sendOTP(email)
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut()
          set({ user: null, student: null })
          toast.success('Signed out successfully')
        } catch (error) {
          console.error('Sign out error:', error)
          set({ user: null, student: null })
        }
      },

      updateProfile: async (updates: Partial<Student>) => {
        const { student, user } = get()
        if (!student || !user) return

        try {
          const { error } = await supabase
            .from('students')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)

          if (error) throw error

          const updatedStudent = { 
            ...student, 
            ...updates,
            updated_at: new Date().toISOString()
          }
          
          set({ student: updatedStudent })
        } catch (error) {
          console.error('Update profile error:', error)
          throw error
        }
      },
    }),
    {
      name: 'forgetrain-auth',
      partialize: (state) => ({ 
        user: state.user, 
        student: state.student,
        initialized: state.initialized
      }),
    }
  )
)