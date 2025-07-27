import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Bars3Icon, 
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

export function Header() {
  const { user, student, signOut } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#094d57]"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
            <Link to={user ? "/dashboard" : "/"} className="flex items-center ml-2 lg:ml-0 gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow border border-gray-200">
                  <img src="/logo-t.png" alt="ForgeTrain Logo" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-xl font-bold text-[#094d57] tracking-tight">ForgeTrain</span>
              </motion.div>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          {user && (
            <nav className="hidden lg:flex gap-6 items-center">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-[#094d57] transition-colors font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#094d57]"
              >
                Dashboard
              </Link>
              <Link
                to="/courses"
                className="text-gray-700 hover:text-[#094d57] transition-colors font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#094d57]"
              >
                Courses
              </Link>
              <Link
                to="/tutorials"
                className="text-gray-700 hover:text-[#094d57] transition-colors font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#094d57]"
              >
                Text Tutorials
              </Link>
              <Link
                to="/challenges"
                className="text-gray-700 hover:text-[#094d57] transition-colors font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#094d57]"
              >
                Challenges
              </Link>
              <Link
                to="/quizzes"
                className="text-gray-700 hover:text-[#094d57] transition-colors font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#094d57]"
              >
                Quizzes
              </Link>
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#f1872c]" aria-label="Notifications">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#f1872c] rounded-full"></span>
                </button>

                {/* User Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#094d57]">
                    <div className="w-8 h-8 bg-[#094d57] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {student?.first_name?.[0] || user.full_name[0]}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {student?.first_name || user.full_name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  </Menu.Button>

                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50">
                      <div className="p-2">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={cn(
                                'flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors',
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              )}
                            >
                              <UserCircleIcon className="h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/settings"
                              className={cn(
                                'flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors',
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              )}
                            >
                              <CogIcon className="h-4 w-4" />
                              <span>Settings</span>
                            </Link>
                          )}
                        </Menu.Item>
                        <hr className="my-2" />
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={cn(
                                'flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors w-full text-left',
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              )}
                            >
                              <ArrowRightOnRectangleIcon className="h-4 w-4" />
                              <span>Sign out</span>
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link to="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}