import { create } from 'zustand'
import { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  getUnreadNotifications: () => Notification[]
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const { notifications } = get()
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isRead: false
    }
    
    const updatedNotifications = [newNotification, ...notifications]
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length
    
    set({ 
      notifications: updatedNotifications,
      unreadCount
    })
  },

  markAsRead: (id: string) => {
    const { notifications } = get()
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    )
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length
    
    set({ 
      notifications: updatedNotifications,
      unreadCount
    })
  },

  markAllAsRead: () => {
    const { notifications } = get()
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true
    }))
    
    set({ 
      notifications: updatedNotifications,
      unreadCount: 0
    })
  },

  removeNotification: (id: string) => {
    const { notifications } = get()
    const updatedNotifications = notifications.filter(notification => notification.id !== id)
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length
    
    set({ 
      notifications: updatedNotifications,
      unreadCount
    })
  },

  clearAllNotifications: () => {
    set({ 
      notifications: [],
      unreadCount: 0
    })
  },

  getUnreadNotifications: () => {
    const { notifications } = get()
    return notifications.filter(notification => !notification.isRead)
  }
}))

// WebSocket simulation for real-time notifications
let notificationInterval: NodeJS.Timeout | null = null

export const startNotificationService = () => {
  if (notificationInterval) return
  
  const { addNotification } = useNotificationStore.getState()
  
  // Simulate real-time notifications
  notificationInterval = setInterval(() => {
    const mockNotifications = [
      {
        type: 'info' as const,
        title: 'Low Stock Alert',
        message: 'Fresh Croissant is running low (5 items left)'
      },
      {
        type: 'success' as const,
        title: 'Sale Completed',
        message: 'Transaction #TXN-' + Math.random().toString(36).substr(2, 6).toUpperCase() + ' processed successfully'
      },
      {
        type: 'warning' as const,
        title: 'Shift Reminder',
        message: 'Your shift has been active for 4 hours'
      }
    ]
    
    // Randomly add notifications (10% chance every 30 seconds)
    if (Math.random() < 0.1) {
      const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)]
      addNotification(randomNotification)
    }
  }, 30000) // Check every 30 seconds
}

export const stopNotificationService = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval)
    notificationInterval = null
  }
}