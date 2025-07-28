import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CodeBracketIcon,
  BookOpenIcon,
  TrophyIcon,
  ChartBarIcon,
  SparklesIcon,
  PlayIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const features = [
  {
    icon: BookOpenIcon,
    title: 'Interactive Tutorials',
    description: 'Learn with hands-on text and video tutorials covering all programming concepts from basics to advanced.',
    color: 'bg-blue-500',
  },
  {
    icon: CodeBracketIcon,
    title: 'Coding Challenges',
    description: 'Practice with real-world coding problems ranging from easy to expert level with instant feedback.',
    color: 'bg-green-500',
  },
  {
    icon: TrophyIcon,
    title: 'Quizzes & Assessments',
    description: 'Test your knowledge with interactive quizzes and earn certificates to showcase your skills.',
    color: 'bg-purple-500',
  },
  {
    icon: ChartBarIcon,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics and progress reports.',
    color: 'bg-orange-500',
  },
  {
    icon: SparklesIcon,
    title: 'AI-Powered Learning',
    color: 'bg-pink-500',
  },
  {
    icon: UsersIcon,
    title: 'College Integration',
    description: 'Seamless integration for colleges to track student progress and placement preparation.',
    color: 'bg-indigo-500',
  },
]

const stats = [
  { value: '10,000+', label: 'Students Learning' },
  { value: '500+', label: 'Coding Challenges' },
  { value: '100+', label: 'Video Tutorials' },
  { value: '95%', label: 'Success Rate' },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Computer Science Student',
    institution: 'IIT Delhi',
    content: 'ForgeTrain helped me improve my coding skills dramatically. The AI-powered hints are incredibly helpful!',
    rating: 5,
  },
  {
    name: 'Rahul Kumar',
    role: 'Software Engineer',
    institution: 'Placed at Google',
    content: 'The platform\'s structured approach to learning helped me crack my dream job interview.',
    rating: 5,
  },
  {
    name: 'Dr. Anita Desai',
    role: 'Professor',
    institution: 'Mumbai University',
    content: 'As an educator, I find ForgeTrain\'s college integration features extremely valuable for tracking student progress.',
    rating: 5,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#094d57] via-[#0c5a66] to-[#f1872c] pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="secondary" className="mb-4">
                🚀 New AI-Powered Learning Features
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                Master Coding with{' '}
                <span className="bg-gradient-to-r from-[#f1872c] to-[#ffa726] bg-clip-text text-transparent">
                  ForgeTrain
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
                From zero knowledge to complete problem-solving mastery. Learn, practice, and excel with our comprehensive coding platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/auth/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                    Start Learning Free
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <PlayIcon className="h-6 w-6 ml-1" />
                  </div>
                  <span className="text-lg font-medium">Watch Demo</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-2"
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Excel
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our comprehensive platform combines the best of LeetCode, W3Schools, and GeeksforGeeks into one powerful learning experience.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How ForgeTrain Works
              </h2>
              <p className="text-xl text-gray-600">
                A simple, structured approach to mastering programming
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Learn Fundamentals',
                description: 'Start with interactive tutorials covering programming basics to advanced concepts.',
                icon: BookOpenIcon,
              },
              {
                step: '02',
                title: 'Practice Challenges',
                description: 'Apply your knowledge with coding challenges of varying difficulty levels.',
                icon: CodeBracketIcon,
              },
              {
                step: '03',
                title: 'Track Progress',
                description: 'Monitor your improvement and earn certificates to showcase your skills.',
                icon: TrophyIcon,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-[#094d57] rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#f1872c] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Students Say
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of students who have transformed their careers with ForgeTrain
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <p className="text-sm text-[#094d57]">{testimonial.institution}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#094d57] to-[#f1872c]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Coding Journey?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Join thousands of students who are already learning and growing with ForgeTrain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-white text-[#094d57] hover:bg-gray-100 text-lg px-8 py-4">
                  Get Started Free
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth/signin">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#094d57] text-lg px-8 py-4">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#094d57] to-[#f1872c] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FT</span>
                </div>
                <span className="text-xl font-bold">ForgeTrain</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering students to master coding through interactive learning, practical challenges, and AI-powered guidance.
              </p>
              <div className="flex space-x-4">
                <span className="text-sm text-gray-400">© 2025 ForgeTrain. All rights reserved.</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/colleges" className="hover:text-white transition-colors">For Colleges</Link></li>
                <li><Link to="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}