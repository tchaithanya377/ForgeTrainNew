import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '../../stores/authStore'

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const { user } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={handleSidebarToggle} />
      <div className="flex">
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
      {/* Mobile Sidebar - only show on mobile screens */}
      {user && showSidebar && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={handleSidebarClose}
        />
      )}
    </div>
  )
}