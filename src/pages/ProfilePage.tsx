import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BookOpenIcon,
  TrophyIcon,
  ClockIcon,
  ChartBarIcon,
  StarIcon,
  FireIcon,
  CalendarIcon,
  GlobeAltIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
  LockClosedIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Progress } from '../components/ui/Progress'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
  institution: z.string().optional(),
  program: z.string().optional(),
  year_of_study: z.number().min(1).max(8).optional(),
  major: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
  learning_goals: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  preferred_learning_style: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']),
  preferred_difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  daily_study_goal_minutes: z.number().min(15).max(480),
  weekly_study_goal_hours: z.number().min(1).max(40),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const { user, student, updateProfile } = useAuthStore()
  const { logFeatureUsage } = useLogger()
  const [isEditing, setIsEditing] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = React.useState(false)
  const [showPasswordModal, setShowPasswordModal] = React.useState(false)
  const [passwordLoading, setPasswordLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: student?.first_name || '',
      last_name: student?.last_name || '',
      phone_number: student?.phone_number || '',
      institution: student?.institution || '',
      program: student?.program || '',
      year_of_study: student?.year_of_study || undefined,
      major: student?.major || '',
      gpa: student?.gpa || undefined,
      learning_goals: student?.learning_goals || [],
      interests: student?.interests || [],
      preferred_learning_style: student?.preferred_learning_style || 'visual',
      preferred_difficulty: student?.preferred_difficulty || 'beginner',
      daily_study_goal_minutes: student?.daily_study_goal_minutes || 60,
      weekly_study_goal_hours: student?.weekly_study_goal_hours || 10,
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const watchedValues = watch()

  React.useEffect(() => {
    logFeatureUsage('profile_page_view', {
      user_role: user?.role,
      has_complete_profile: !!(student?.institution && student?.program)
    })
  }, [logFeatureUsage, user?.role, student?.institution, student?.program])

  React.useEffect(() => {
    if (student) {
      reset({
        first_name: student.first_name,
        last_name: student.last_name,
        phone_number: student.phone_number || '',
        institution: student.institution || '',
        program: student.program || '',
        year_of_study: student.year_of_study || undefined,
        major: student.major || '',
        gpa: student.gpa || undefined,
        learning_goals: student.learning_goals || [],
        interests: student.interests || [],
        preferred_learning_style: student.preferred_learning_style || 'visual',
        preferred_difficulty: student.preferred_difficulty || 'beginner',
        daily_study_goal_minutes: student.daily_study_goal_minutes || 60,
        weekly_study_goal_hours: student.weekly_study_goal_hours || 10,
      })
    }
  }, [student, reset])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return

    setAvatarUploading(true)
    try {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, avatarFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath)

      // Update user profile with avatar URL
      await updateProfile({ avatar_url: publicUrl })
      
      toast.success('Avatar updated successfully!')
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      await updateProfile(data)
      
      // Upload avatar if selected
      if (avatarFile) {
        await uploadAvatar()
      }
      
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      logFeatureUsage('profile_updated', {
        fields_updated: Object.keys(data).filter(key => data[key as keyof ProfileFormData])
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.new_password
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      setShowPasswordModal(false)
      resetPassword()
      logFeatureUsage('password_changed')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual': return '👁️'
      case 'auditory': return '🎧'
      case 'kinesthetic': return '🤲'
      case 'reading': return '📖'
      default: return '📚'
    }
  }

  const getProfileCompletion = () => {
    if (!student) return 0
    
    const fields = [
      student.first_name,
      student.last_name,
      student.institution,
      student.program,
      student.major,
      student.phone_number,
    ]
    
    const completed = fields.filter(field => field && field.trim() !== '').length
    return Math.round((completed / fields.length) * 100)
  }

  if (!user || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094d57] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const profileCompletion = getProfileCompletion()

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">
              Manage your personal information, learning preferences, and track your progress
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
            >
              <KeyIcon className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit(onSubmit)}
                  loading={loading}
                  disabled={!isDirty && !avatarFile}
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardContent className="p-6 text-center">
              {/* Avatar Section */}
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-[#094d57] to-[#0f7a8a] rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : student.avatar_url ? (
                    <img 
                      src={student.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl font-bold">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </span>
                  )}
                  {isEditing && (
                    <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition-all">
                      <CameraIcon className="h-6 w-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {student.first_name} {student.last_name}
              </h2>
              <p className="text-gray-600 mb-3">{user.email}</p>
              
              <Badge 
                variant="info" 
                className={`mb-4 ${getSkillLevelColor(student.skill_level)}`}
              >
                {student.skill_level.charAt(0).toUpperCase() + student.skill_level.slice(1)}
              </Badge>

              {/* Profile Completion */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                  <span className="text-sm text-gray-500">{profileCompletion}%</span>
                </div>
                <Progress 
                  value={profileCompletion} 
                  className="h-2"
                  variant={profileCompletion >= 80 ? 'success' : profileCompletion >= 60 ? 'default' : 'warning'}
                />
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                {student.institution && (
                  <div className="flex items-center justify-center space-x-2">
                    <AcademicCapIcon className="h-4 w-4" />
                    <span className="truncate">{student.institution}</span>
                  </div>
                )}
                {student.program && (
                  <div className="flex items-center justify-center space-x-2">
                    <BookOpenIcon className="h-4 w-4" />
                    <span className="truncate">{student.program}</span>
                  </div>
                )}
                {student.phone_number && (
                  <div className="flex items-center justify-center space-x-2">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{student.phone_number}</span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-[#094d57]">
                      {student.current_streak_days}
                    </div>
                    <p className="text-xs text-gray-600">Day Streak</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#094d57]">
                      {student.total_points.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600">Points</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      {...register('first_name')}
                      label="First Name"
                      placeholder="Enter your first name"
                      error={errors.first_name?.message}
                      leftIcon={<UserIcon />}
                      disabled={!isEditing}
                      required
                    />
                    <Input
                      {...register('last_name')}
                      label="Last Name"
                      placeholder="Enter your last name"
                      error={errors.last_name?.message}
                      leftIcon={<UserIcon />}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <Input
                    value={user.email}
                    label="Email Address"
                    leftIcon={<EnvelopeIcon />}
                    disabled
                  />

                  <Input
                    {...register('phone_number')}
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    error={errors.phone_number?.message}
                    leftIcon={<PhoneIcon />}
                    disabled={!isEditing}
                  />
                </form>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AcademicCapIcon className="h-5 w-5" />
                  <span>Academic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register('institution')}
                    label="Institution"
                    placeholder="Your college/university"
                    error={errors.institution?.message}
                    leftIcon={<AcademicCapIcon />}
                    disabled={!isEditing}
                  />
                  <Input
                    {...register('program')}
                    label="Program"
                    placeholder="e.g., Computer Science"
                    error={errors.program?.message}
                    leftIcon={<BookOpenIcon />}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year of Study
                    </label>
                    <select
                      {...register('year_of_study', { valueAsNumber: true })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#094d57] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Select year</option>
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                      <option value={5}>5th Year</option>
                      <option value={6}>6th Year</option>
                      <option value={7}>7th Year</option>
                      <option value={8}>8th Year</option>
                    </select>
                  </div>
                  <Input
                    {...register('major')}
                    label="Major/Specialization"
                    placeholder="e.g., Software Engineering"
                    error={errors.major?.message}
                    disabled={!isEditing}
                  />
                  <Input
                    {...register('gpa', { valueAsNumber: true })}
                    label="GPA"
                    placeholder="0.00 - 4.00"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    error={errors.gpa?.message}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Learning Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CogIcon className="h-5 w-5" />
                  <span>Learning Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Difficulty
                    </label>
                    <select
                      {...register('preferred_difficulty')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#094d57] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Style
                    </label>
                    <select
                      {...register('preferred_learning_style')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#094d57] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="kinesthetic">Kinesthetic</option>
                      <option value="reading">Reading/Writing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Study Goal (minutes)
                    </label>
                    <input
                      {...register('daily_study_goal_minutes', { valueAsNumber: true })}
                      type="number"
                      min="15"
                      max="480"
                      disabled={!isEditing}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#094d57] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekly Study Goal (hours)
                    </label>
                    <input
                      {...register('weekly_study_goal_hours', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      max="40"
                      disabled={!isEditing}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#094d57] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Learning Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5" />
              <span>Learning Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {student.total_study_hours.toFixed(1)}h
                </div>
                <p className="text-sm text-blue-700">Total Study Time</p>
                <ClockIcon className="h-6 w-6 mx-auto mt-2 text-blue-500" />
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {student.challenges_solved}
                </div>
                <p className="text-sm text-green-700">Challenges Solved</p>
                <TrophyIcon className="h-6 w-6 mx-auto mt-2 text-green-500" />
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {student.quizzes_passed}
                </div>
                <p className="text-sm text-purple-700">Quizzes Passed</p>
                <StarIcon className="h-6 w-6 mx-auto mt-2 text-purple-500" />
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {student.total_points.toLocaleString()}
                </div>
                <p className="text-sm text-orange-700">Total Points</p>
                <FireIcon className="h-6 w-6 mx-auto mt-2 text-orange-500" />
              </div>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Streak</span>
                  <span className="text-sm text-gray-500">{student.current_streak_days} days</span>
                </div>
                <Progress 
                  value={(student.current_streak_days / Math.max(student.longest_streak_days, 1)) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">Longest: {student.longest_streak_days} days</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Quiz Score</span>
                  <span className="text-sm text-gray-500">{student.average_quiz_score.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={student.average_quiz_score} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrophyIcon className="h-5 w-5" />
              <span>Achievements & Badges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {student.badges_earned}
                </div>
                <p className="text-sm text-yellow-700">Badges Earned</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {student.certificates_earned}
                </div>
                <p className="text-sm text-indigo-700">Certificates</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                <div className="text-2xl font-bold text-pink-600 mb-1">
                  {student.courses_completed}
                </div>
                <p className="text-sm text-pink-700">Courses Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    {...registerPassword('current_password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094d57] focus:border-transparent"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.current_password && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  {...registerPassword('new_password')}
                  type="password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094d57] focus:border-transparent"
                  placeholder="Enter new password"
                />
                {passwordErrors.new_password && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.new_password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  {...registerPassword('confirm_password')}
                  type="password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094d57] focus:border-transparent"
                  placeholder="Confirm new password"
                />
                {passwordErrors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirm_password.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={passwordLoading}
                  className="flex-1"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}