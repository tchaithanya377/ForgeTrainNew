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
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
  institution: z.string().optional(),
  program: z.string().optional(),
  year_of_study: z.number().min(1).max(8).optional(),
  major: z.string().optional(),
  learning_goals: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user, student, updateProfile } = useAuthStore()
  const { logFeatureUsage } = useLogger()
  const [isEditing, setIsEditing] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
      learning_goals: student?.learning_goals || [],
      interests: student?.interests || [],
    },
  })

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
        learning_goals: student.learning_goals || [],
        interests: student.interests || [],
      })
    }
  }, [student, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      await updateProfile(data)
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

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  if (!user || !student) {
    return null
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">
              Manage your personal information and learning preferences
            </p>
          </div>
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
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-[#094d57] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {student.first_name?.[0]}{student.last_name?.[0]}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {student.first_name} {student.last_name}
              </h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <Badge variant="info" className="mb-4">
                {student.skill_level}
              </Badge>
              
              <div className="space-y-2 text-sm text-gray-600">
                {student.institution && (
                  <div className="flex items-center justify-center space-x-2">
                    <AcademicCapIcon className="h-4 w-4" />
                    <span>{student.institution}</span>
                  </div>
                )}
                {student.program && (
                  <div className="flex items-center justify-center space-x-2">
                    <UserIcon className="h-4 w-4" />
                    <span>{student.program}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
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

                {/* Academic Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
                  
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                  </div>
                </div>

                {/* Learning Preferences */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Difficulty
                      </label>
                      <select
                        value={student.preferred_difficulty}
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
                        value={student.preferred_learning_style}
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
                </div>
              </form>
            </CardContent>
          </Card>
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
            <CardTitle>Learning Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#094d57] mb-1">
                  {student.total_study_hours.toFixed(1)}h
                </div>
                <p className="text-sm text-gray-600">Total Study Time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#094d57] mb-1">
                  {student.challenges_solved}
                </div>
                <p className="text-sm text-gray-600">Challenges Solved</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#094d57] mb-1">
                  {student.quizzes_passed}
                </div>
                <p className="text-sm text-gray-600">Quizzes Passed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#094d57] mb-1">
                  {student.total_points.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}