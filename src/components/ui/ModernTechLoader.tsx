import React from 'react'
import { motion } from 'framer-motion'
import {
  CodeBracketIcon,
  CpuChipIcon,
  CommandLineIcon,
  SparklesIcon,
  BoltIcon,
  RocketLaunchIcon,
  BeakerIcon,
  ServerIcon,
} from '@heroicons/react/24/outline'

interface ModernTechLoaderProps {
  message?: string
  subMessage?: string
  type?: 'quiz' | 'course' | 'challenge' | 'general'
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  progress?: number
}

export function ModernTechLoader({ 
  message = "Loading...", 
  subMessage,
  type = 'general',
  size = 'md',
  showProgress = false,
  progress = 0
}: ModernTechLoaderProps) {
  const [currentIcon, setCurrentIcon] = React.useState(0)
  const [loadingText, setLoadingText] = React.useState(message)

  const techIcons = [
    CodeBracketIcon,
    CpuChipIcon,
    CommandLineIcon,
    SparklesIcon,
    BoltIcon,
    RocketLaunchIcon,
    BeakerIcon,
    ServerIcon,
  ]

  const loadingMessages = {
    quiz: [
      "Initializing secure quiz environment...",
      "Loading anti-cheat protocols...",
      "Preparing question database...",
      "Setting up camera surveillance...",
      "Finalizing quiz interface..."
    ],
    course: [
      "Loading course modules...",
      "Preparing interactive content...",
      "Syncing progress data...",
      "Optimizing learning experience..."
    ],
    challenge: [
      "Compiling code environment...",
      "Loading test cases...",
      "Preparing code editor...",
      "Initializing execution engine..."
    ],
    general: [
      "Loading...",
      "Preparing content...",
      "Almost ready..."
    ]
  }

  // Cycle through icons and messages
  React.useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentIcon(prev => (prev + 1) % techIcons.length)
    }, 800)

    const messageInterval = setInterval(() => {
      const messages = loadingMessages[type]
      setLoadingText(messages[Math.floor(Math.random() * messages.length)])
    }, 2000)

    return () => {
      clearInterval(iconInterval)
      clearInterval(messageInterval)
    }
  }, [type])

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const containerSizes = {
    sm: 'p-8',
    md: 'p-12',
    lg: 'p-16'
  }

  const CurrentIcon = techIcons[currentIcon]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid animate-pulse" />
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10"
        />
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0.1,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <div className="w-2 h-2 bg-cyan-400 rounded-full blur-sm" />
          </motion.div>
        ))}
      </div>

      {/* Main Loading Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className={`relative ${containerSizes[size]} text-center`}
      >
        {/* Holographic Card */}
        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Animated Border */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1), transparent, rgba(255, 0, 255, 0.1), transparent)',
              backgroundSize: '400% 400%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />

          {/* ForgeTrain Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center space-x-3 mb-8"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">FT</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ForgeTrain
            </span>
          </motion.div>

          {/* Animated Tech Icon */}
          <motion.div
            key={currentIcon}
            initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotateY: 180 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative">
              {/* Glowing Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 p-1"
              >
                <div className="w-full h-full rounded-full bg-gray-900" />
              </motion.div>
              
              {/* Icon Container */}
              <div className={`relative ${sizeClasses[size]} mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20`}>
                <CurrentIcon className="w-8 h-8 text-cyan-400" />
              </div>

              {/* Pulse Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className={`absolute inset-0 ${sizeClasses[size]} mx-auto bg-cyan-400/30 rounded-full`}
              />
            </div>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            key={loadingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              {type === 'quiz' && '🛡️ Secure Quiz Loading'}
              {type === 'course' && '📚 Course Preparation'}
              {type === 'challenge' && '💻 Code Environment'}
              {type === 'general' && '⚡ System Loading'}
            </h3>
            <p className="text-cyan-300 text-sm font-medium">
              {loadingText}
            </p>
            {subMessage && (
              <p className="text-cyan-400/70 text-xs mt-1">
                {subMessage}
              </p>
            )}
          </motion.div>

          {/* Progress Bar */}
          {showProgress && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-white/70 text-xs mt-2">{progress}% Complete</p>
            </motion.div>
          )}

          {/* Tech Specs Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-2 gap-4 text-xs text-cyan-300/80"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Database: Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Security: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span>Neural Net: Ready</span>
            </div>
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            className="flex justify-center space-x-2 mt-6"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-white/40 text-xs font-mono">
            ForgeTrain v2025.1 • Neural Learning Engine
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Specialized loaders for different contexts
export function QuizSecurityLoader() {
  return (
    <ModernTechLoader 
      type="quiz" 
      size="lg"
      showProgress={true}
      progress={75}
    />
  )
}

export function CourseContentLoader() {
  return (
    <ModernTechLoader 
      type="course" 
      size="md"
    />
  )
}

export function ChallengeEnvironmentLoader() {
  return (
    <ModernTechLoader 
      type="challenge" 
      size="lg"
      showProgress={true}
      progress={60}
    />
  )
}

// Compact loader for inline use
export function CompactTechLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-transparent bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full p-0.5"
        >
          <div className="w-full h-full rounded-full bg-white" />
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute inset-0 w-8 h-8 bg-cyan-400/30 rounded-full"
        />
      </div>
      <span className="ml-3 text-gray-600 font-medium">{message}</span>
    </div>
  )
}
