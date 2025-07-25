import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, UserIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import toast from 'react-hot-toast'

const signUpSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  otp: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignUpFormData = z.infer<typeof signUpSchema>

export function SignUpPage() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [showOTPField, setShowOTPField] = React.useState(false)
  const [otpSent, setOtpSent] = React.useState(false)
  const [countdown, setCountdown] = React.useState(0)
  const { signUp, sendOTP, verifyOTP, resendOTP, loading } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
    },
  })

  const email = watch('email')
  const fullName = watch('fullName')
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async () => {
    if (!email || !fullName || !password || !confirmPassword) {
      toast.error('Please fill in all fields first')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
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

  const onSubmit = async (data: SignUpFormData) => {
    try {
      if (showOTPField && data.otp) {
        // First verify OTP, then create account
        await verifyOTP(data.email, data.otp)
        // Now create account with verified email
        await signUp(data.email, data.password, data.fullName)
        setTimeout(() => navigate('/auth/signin'), 1000)
      } else if (!showOTPField) {
        // Send OTP for verification
        await handleSendOTP()
      } else {
        toast.error('Please enter the OTP')
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      if (error.message.includes('User already registered')) {
        toast.error('An account with this email already exists.')
      } else if (error.message.includes('OTP')) {
        toast.error(error.message)
      } else {
        toast.error(error.message || 'Account creation failed. Please try again.')
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Input
                  {...register('fullName')}
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={errors.fullName?.message}
                  leftIcon={<UserIcon />}
                  autoComplete="name"
                  disabled={otpSent}
                  required
                />
              </div>

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
                  placeholder="Create a password"
                  error={errors.password?.message}
                  autoComplete="new-password"
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

              <div>
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  error={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  disabled={otpSent}
                  required
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
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
                  
                  {/* Demo OTP Display */}
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                    <strong>Demo Mode:</strong> Check browser console for OTP
                  </div>
                </motion.div>
              )}

              <div className="flex items-start">
                <input
                  type="checkbox"
                  required
                  disabled={otpSent}
                  className="h-4 w-4 text-[#094d57] focus:ring-[#094d57] border-gray-300 rounded mt-1"
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
              >
                {!showOTPField ? 'Send OTP' : 'Verify & Create Account'}
              </Button>
            </form>

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