import React from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '../../stores/authStore'

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {user && showSidebar && (
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        )}
        <main className="flex-1">
          {children}
        </main>
      </div>
      {user && showSidebar && <Sidebar />}
    </div>
  )
}