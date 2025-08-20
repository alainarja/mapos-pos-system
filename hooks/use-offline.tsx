"use client"

import { useState, useEffect, useCallback } from 'react'
import { syncManager } from '@/lib/offline/sync-manager'
import { offlineDB } from '@/lib/offline/indexed-db'

export interface OfflineStatus {
  isOnline: boolean
  isSupported: boolean
  isSyncing: boolean
  queueSize: number
  unsyncedCount: number
  lastSync?: Date
  nextRetry?: Date
}

export function useOffline() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    isSupported: false,
    isSyncing: false,
    queueSize: 0,
    unsyncedCount: 0
  })

  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if offline mode is supported
    const supported = syncManager.constructor.isSupported()
    
    if (!supported) {
      setStatus(prev => ({ ...prev, isSupported: false }))
      return
    }

    // Initialize offline functionality
    const init = async () => {
      try {
        // Initialize IndexedDB
        await offlineDB.init()
        
        // Register service worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/service-worker.js')
          console.log('Service Worker registered:', registration)
        }

        // Update initial status
        const stats = await offlineDB.getStats()
        setStatus({
          isOnline: navigator.onLine,
          isSupported: true,
          isSyncing: false,
          queueSize: stats.queued,
          unsyncedCount: stats.unsynced
        })
        
        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize offline mode:', error)
        setStatus(prev => ({ ...prev, isSupported: false }))
      }
    }

    init()

    // Set up event listeners
    const handleOnline = () => {
      console.log('Network: Online')
      setStatus(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      console.log('Network: Offline')
      setStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen to sync events
    syncManager.on('sync-start', () => {
      setStatus(prev => ({ ...prev, isSyncing: true }))
    })

    syncManager.on('sync-complete', async (result) => {
      const stats = await offlineDB.getStats()
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        queueSize: stats.queued,
        unsyncedCount: stats.unsynced,
        lastSync: new Date()
      }))
    })

    syncManager.on('queued', async (data) => {
      const stats = await offlineDB.getStats()
      setStatus(prev => ({
        ...prev,
        queueSize: stats.queued,
        unsyncedCount: stats.unsynced
      }))
    })

    syncManager.on('transaction-synced', async () => {
      const stats = await offlineDB.getStats()
      setStatus(prev => ({
        ...prev,
        unsyncedCount: stats.unsynced
      }))
    })

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      syncManager.off('sync-start')
      syncManager.off('sync-complete')
      syncManager.off('queued')
      syncManager.off('transaction-synced')
    }
  }, [])

  // Force sync
  const forceSync = useCallback(async () => {
    if (!status.isOnline || status.isSyncing) {
      return { success: false, synced: 0, failed: 0, errors: [] }
    }
    return await syncManager.forceSync()
  }, [status.isOnline, status.isSyncing])

  // Queue a transaction
  const queueTransaction = useCallback(async (transaction: any) => {
    if (status.isOnline) {
      // Try to sync immediately if online
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        return { success: true, queued: false }
      } catch (error) {
        console.error('Failed to sync transaction, queuing:', error)
      }
    }
    
    // Queue for later sync
    await syncManager.queueTransaction(transaction)
    return { success: true, queued: true }
  }, [status.isOnline])

  // Get cached data
  const getCachedData = useCallback(async () => {
    const [products, customers] = await Promise.all([
      offlineDB.getCachedProducts(),
      offlineDB.getCachedCustomers()
    ])
    
    return { products, customers }
  }, [])

  // Cache data for offline use
  const cacheData = useCallback(async (data: {
    products?: any[]
    customers?: any[]
  }) => {
    const promises = []
    
    if (data.products) {
      promises.push(offlineDB.cacheProducts(data.products))
    }
    
    if (data.customers) {
      promises.push(offlineDB.cacheCustomers(data.customers))
    }
    
    await Promise.all(promises)
  }, [])

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    await syncManager.clearOfflineData()
    const stats = await offlineDB.getStats()
    setStatus(prev => ({
      ...prev,
      queueSize: stats.queued,
      unsyncedCount: stats.unsynced
    }))
  }, [])

  return {
    status,
    isReady,
    forceSync,
    queueTransaction,
    getCachedData,
    cacheData,
    clearOfflineData
  }
}