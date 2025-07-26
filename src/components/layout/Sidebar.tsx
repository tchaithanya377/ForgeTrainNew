import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  BookOpenIcon,
  CodeBracketIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  TrophyIcon,
  CogIcon,
  XMarkIcon,
  DocumentTextIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Courses', href: '/courses', icon: BookOpenIcon },
  { name: 'Text Tutorials', href: '/text-tutorials', icon: DocumentTextIcon },
  { name: 'Challenges', href: '/challenges', icon: CodeBracketIcon },
  { name: 'Quizzes', href: '/quizzes', icon: QuestionMarkCircleIcon },
  { name: 'Progress', href: '/progress', icon: ChartBarIcon },
  { name: 'Achievements', href: '/achievements', icon: TrophyIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

const adminNavigation = [
  { name: 'System Logs', href: '/admin/logs', icon: DocumentTextIcon },
  { name: 'Course Analytics', href: '/admin/courses', icon: AcademicCapIcon },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const { user } = useAuthStore()

  if (!user) return null

  const isAdmin = user.role === 'super_admin' || user.role === 'instructor'

  return (
    <>
      {/* Mobile sidebar backdrop and sidebar with AnimatePresence for exit animation */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.09, ease: 'easeInOut' }}
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              tabIndex={0}
              role="button"
            />
            <motion.div
              key="sidebar-panel"
              initial={{ x: '-100%', opacity: 0.7, scale: 0.98 }}
              animate={{ x: sidebarOpen ? 0 : '-100%', opacity: sidebarOpen ? 1 : 0.7, scale: sidebarOpen ? 1 : 0.98 }}
              exit={{ x: '-100%', opacity: 0.7, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320, delay: 0.001 }}
              className={cn(
                'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg lg:shadow-none lg:translate-x-0 lg:static lg:inset-0',
                'flex flex-col',
                'transition-transform duration-300 ease-in-out'
              )}
              tabIndex={-1}
              aria-modal={sidebarOpen ? 'true' : undefined}
              role="dialog"
            >
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:hidden">
                <Link to="/dashboard" className="flex items-center space-x-2">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow border border-gray-200">
                    <img src="/logo-t.png" alt="ForgeTrain Logo" className="w-8 h-8 object-contain" />
                  </div>
                  <span className="text-xl font-bold text-[#094d57] tracking-tight">ForgeTrain</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#094d57]"
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-[#094d57] text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                        'focus:outline-none focus:ring-2 focus:ring-[#094d57]'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}

                {/* Admin Navigation */}
                {isAdmin && (
                  <>
                    <hr className="my-4" />
                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Administration
                    </p>
                    {adminNavigation.map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-[#094d57] text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                            'focus:outline-none focus:ring-2 focus:ring-[#094d57]'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </>
                )}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#094d57] to-[#f1872c] rounded-lg text-white">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <TrophyIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Keep Learning!</p>
                    <p className="text-xs opacity-90">Level up your skills</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}