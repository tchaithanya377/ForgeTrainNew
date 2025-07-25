import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  language: 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'gu' | 'mr' | 'bn'
  notifications: Notification[]
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: string) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: false,
  theme: 'light',
  language: 'en',
  notifications: [],

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  setTheme: (theme: 'light' | 'dark') => {
    set({ theme })
    localStorage.setItem('forgetrain-theme', theme)
  },
  
  setLanguage: (language: string) => {
    set({ language: language as any })
    localStorage.setItem('forgetrain-language', language)
  },
  
  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    set(state => ({
      notifications: [
        { ...notification, id, read: false },
        ...state.notifications
      ]
    }))
  },
  
  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },
}))

// Initialize theme and language from localStorage
const savedTheme = localStorage.getItem('forgetrain-theme') as 'light' | 'dark'
const savedLanguage = localStorage.getItem('forgetrain-language')

if (savedTheme) {
  useAppStore.setState({ theme: savedTheme })
}

if (savedLanguage) {
  useAppStore.setState({ language: savedLanguage as any })
}