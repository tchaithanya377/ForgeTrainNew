import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import toast from 'react-hot-toast'

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  otp: z.string().optional(),
})

type SignInFormData = z.infer<typeof signInSchema>

export function SignInPage() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showOTPField, setShowOTPField] = React.useState(false)
  const [otpSent, setOtpSent] = React.useState(false)
  const [countdown, setCountdown] = React.useState(0)
  const { signIn, sendOTP, verifyOTP, resendOTP, loading } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      otp: '',
    },
  })

  const email = watch('email')
  const password = watch('password')

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password first')
      return
    }

    try {
      await sendOTP(email)
      setShowOTPField(true)
      setOtpSent(true)
      setCountdown(60) // 60 seconds countdown
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP')
    }
  }

  const handleResendOTP = async () => {
    try {
      await resendOTP(email)
      setCountdown(60)
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP')
    }
  }

  const onSubmit = async (data: SignInFormData) => {
    try {
      if (showOTPField && data.otp) {
        // First verify OTP, then sign in
        await verifyOTP(data.email, data.otp)
        // Now sign in with verified email
        await signIn(data.email, data.password)
        toast.success('Sign in successful!')
        setTimeout(() => navigate('/dashboard'), 500)
      } else if (!showOTPField) {
        // Send OTP for verification
        await handleSendOTP()
      } else {
        toast.error('Please enter the OTP')
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials.')
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please verify your email with OTP first.')
      } else {
        toast.error(error.message || 'Sign in failed. Please try again.')
      }
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
              <img src="/log-t.png" alt="ForgeTrain Logo" className="w-10 h-10 rounded-lg object-contain" />
              <span className="text-2xl font-bold text-[#094d57]">ForgeTrain</span>
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Sign in to continue your learning journey
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  leftIcon={<EnvelopeIcon />}
                  autoComplete="email"
                  disabled={otpSent}
                  required
                />
              </div>

              <div>
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  autoComplete="current-password"
                  disabled={otpSent}
                  required
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  }
                />
              </div>

              {/* OTP Field */}
              {showOTPField && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    {...register('otp')}
                    type="text"
                    label="Enter OTP"
                    placeholder="Enter 6-digit OTP"
                    error={errors.otp?.message}
                    leftIcon={<DevicePhoneMobileIcon />}
                    maxLength={6}
                    required
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">
                      OTP sent to {email}
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={countdown > 0}
                      className="text-sm text-[#094d57] hover:text-[#073e47] font-medium disabled:text-gray-400"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#094d57] focus:ring-[#094d57] border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-[#094d57] hover:text-[#073e47] font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {!showOTPField ? 'Send OTP' : 'Verify & Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/auth/signup"
                  className="text-[#094d57] hover:text-[#073e47] font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}