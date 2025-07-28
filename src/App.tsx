import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/layout/Layout'
import { useAuthStore } from './stores/authStore'

// Direct imports instead of lazy loading to avoid errors
import { Dashboard } from './pages/Dashboard'
import { CoursesPage } from './pages/CoursesPage'
import { QuizzesPage } from './pages/QuizzesPage'
import { ProgressPage } from './pages/ProgressPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { LandingPage } from './pages/LandingPage'
import { CourseLearningPage } from './pages/CourseLearningPage'
import { SignInPage } from './pages/auth/SignInPage'
import { SignUpPage } from './pages/auth/SignUpPage'
import { LogsPage } from './pages/admin/LogsPage'
import { CourseAnalyticsPage } from './pages/admin/CourseAnalyticsPage'
import { QuizDetailsPage } from './pages/QuizDetailsPage'
import { QuizTakingPage } from './pages/QuizTakingPage'
import { TextTutorialsPage } from './pages/TextTutorialsPage'
import { TextTutorialPage } from './pages/TextTutorialPage'
import { ChallengesPage } from './pages/ChallengesPage'
import { ChallengeDetailPage } from './pages/ChallengeDetailPage'
import { ChallengeSolvingPage } from './pages/ChallengeSolvingPage'
import { ChatPage } from './pages/ChatPage'
import { Judge0TestPage } from './pages/Judge0TestPage'
import { FloatingChat } from './components/chat/FloatingChat'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes - aggressive caching
      gcTime: 60 * 60 * 1000, // 1 hour
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 1, // Quick retry only
      retryDelay: 300, // Fast retry
      networkMode: 'offlineFirst', // Prioritize cache
    },
  },
})

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094d57] mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />
  }

  return <>{children}</>
}

// Public Route Component
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094d57] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Auth Initializer Component
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize, initialized } = useAuthStore()

  React.useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialize, initialized])

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthInitializer>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <Layout showSidebar={false}>
                    <LandingPage />
                  </Layout>
                }
              />
              <Route
                path="/auth/signin"
                element={
                  <PublicRoute>
                    <Layout showSidebar={false}>
                      <SignInPage />
                    </Layout>
                  </PublicRoute>
                }
              />
              <Route
                path="/auth/signup"
                element={
                  <PublicRoute>
                    <Layout showSidebar={false}>
                      <SignUpPage />
                    </Layout>
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CoursesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/:courseId"
                element={
                  <ProtectedRoute>
                    <CourseLearningPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <QuizzesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <QuizDetailsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId/take"
                element={
                  <ProtectedRoute>
                    <QuizTakingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tutorials"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TextTutorialsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tutorial/:tutorialId"
                element={
                  <ProtectedRoute>
                    <TextTutorialPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenges"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChallengesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenge/:challengeId/solve"
                element={
                  <ProtectedRoute>
                    <ChallengeSolvingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenge/:challengeId"
                element={
                  <ProtectedRoute>
                    <ChallengeDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/judge0-test"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Judge0TestPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProgressPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/achievements"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold">Achievements</h1>
                        <p className="text-gray-600 mt-2">Coming soon...</p>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SettingsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <LogsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CourseAnalyticsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Floating AI Chat - Available on all protected routes */}
            <FloatingChat />

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#059669',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#dc2626',
                    secondary: '#ffffff',
                  },
                },
              }}
            />

            {/* React Query DevTools */}
            <ReactQueryDevtools initialIsOpen={false} />
          </div>
        </AuthInitializer>
      </Router>
    </QueryClientProvider>
  )
}

export default App