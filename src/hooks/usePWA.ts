import React from 'react'
import { useAppStore } from '../stores/appStore'

export function usePWA() {
  const { addNotification } = useAppStore()

  // Simplified PWA hook without service worker registration for now
  const needRefresh = false
  const handleUpdateApp = () => {}
  const setNeedRefresh = () => {}

  return {
    needRefresh,
    updateServiceWorker: handleUpdateApp,
    setNeedRefresh,
  }
}

// Hook for checking online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
  React.useEffect(() => {
    // Monitor bundle size in development
    if (import.meta.env.DEV) {
      // console.log('Performance monitoring enabled in development mode')
    }
  }, [])
}