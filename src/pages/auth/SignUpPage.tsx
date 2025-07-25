import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

const signUpSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignUpFormData = z.infer<typeof signUpSchema>

export function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signUp, loading } = useAuthStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [emailForResend, setEmailForResend] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: SignUpFormData) => {
    setError('')
    setSuccess(false)
    try {
      await signUp(data.email, data.password, data.fullName)
      setEmailForResend(data.email)
      setAwaitingConfirmation(true)
      setSuccess(true)
      reset()
    } catch (err: any) {
      setError(err.message || 'Account creation failed. Please try again.')
    }
  }

  // Optionally, implement resend confirmation email logic here
  const handleResend = async () => {
    setError('')
    setSuccess(false)
    try {
      // You may need to implement a resend confirmation function in your authStore
      await signUp(emailForResend, '', '') // Or call a custom resend function
      setSuccess(true)
    } catch (err: any) {
      setError('Failed to resend confirmation email. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#094d57] via-[#0c5a66] to-[#f1872c] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#094d57] to-[#f1872c] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FT</span>
              </div>
              <span className="text-2xl font-bold text-[#094d57]">ForgeTrain</span>
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create Your Account
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Start your coding journey today
            </p>
          </CardHeader>

          <CardContent>
            {!awaitingConfirmation ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  {...register('fullName')}
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={errors.fullName?.message}
                  leftIcon={<UserIcon />}
                  autoComplete="name"
                  required
                  disabled={loading}
                />
                <Input
                  {...register('email')}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  leftIcon={<EnvelopeIcon />}
                  autoComplete="email"
                  required
                  disabled={loading}
                />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Create a password"
                  error={errors.password?.message}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  }
                />
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  error={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  }
                />
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    className="h-4 w-4 text-[#094d57] focus:ring-[#094d57] border-gray-300 rounded mt-1"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-[#094d57] hover:text-[#073e47] font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-[#094d57] hover:text-[#073e47] font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
                {error && (
                  <div className="mt-2 text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </form>
            ) : (
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className="text-green-700 text-lg font-semibold text-center">
                  Please check your email to confirm your account.<br />
                  After confirming, you can sign in.
                </div>
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={() => navigate('/auth/signin')}
                >
                  Go to Sign In
                </Button>
                {error && (
                  <div className="mt-2 text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/auth/signin"
                  className="text-[#094d57] hover:text-[#073e47] font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}