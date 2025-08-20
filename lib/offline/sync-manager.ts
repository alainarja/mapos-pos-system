// Sync Manager for Offline Queue Processing
import { offlineDB, QueuedRequest } from './indexed-db'

export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: Array<{ id: string; error: string }>
}

class SyncManager {
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null
  private retryDelays = [1000, 5000, 15000, 30000, 60000] // Progressive retry delays
  private maxRetries = 5
  private listeners: Map<string, (event: any) => void> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners()
      this.startAutoSync()
    }
  }

  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('[SyncManager] Network online, triggering sync')
      this.sync()
    })

    window.addEventListener('offline', () => {
      console.log('[SyncManager] Network offline')
      this.emit('offline', { timestamp: Date.now() })
    })

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'QUEUE_REQUEST') {
          this.handleQueueRequest(event.data.data)
        } else if (event.data.type === 'SYNC_QUEUE') {
          this.sync()
        }
      })
    }
  }

  private async handleQueueRequest(requestData: QueuedRequest) {
    try {
      await offlineDB.addToQueue(requestData)
      console.log('[SyncManager] Request queued:', requestData.id)
      this.emit('queued', { 
        id: requestData.id, 
        url: requestData.url,
        queueSize: await offlineDB.getQueueSize()
      })
    } catch (error) {
      console.error('[SyncManager] Failed to queue request:', error)
    }
  }

  private startAutoSync() {
    // Auto-sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.sync()
      }
    }, 30000)
  }

  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[SyncManager] Sync already in progress')
      return { success: false, synced: 0, failed: 0, errors: [] }
    }

    if (!navigator.onLine) {
      console.log('[SyncManager] Cannot sync - offline')
      return { success: false, synced: 0, failed: 0, errors: [] }
    }

    this.isSyncing = true
    this.emit('sync-start', { timestamp: Date.now() })

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    }

    try {
      // Get all queued requests
      const queue = await offlineDB.getQueuedRequests()
      console.log(`[SyncManager] Processing ${queue.length} queued requests`)

      // Process each request
      for (const request of queue) {
        try {
          const success = await this.processQueuedRequest(request)
          
          if (success) {
            await offlineDB.removeFromQueue(request.id)
            result.synced++
            this.emit('request-synced', { id: request.id })
          } else {
            result.failed++
            result.errors.push({ 
              id: request.id, 
              error: 'Request failed' 
            })
          }
        } catch (error) {
          console.error(`[SyncManager] Failed to process request ${request.id}:`, error)
          result.failed++
          result.errors.push({ 
            id: request.id, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
          
          // Handle retry logic
          await this.handleRetry(request)
        }
      }

      // Sync unsynced transactions
      const unsyncedTransactions = await offlineDB.getUnsyncedTransactions()
      console.log(`[SyncManager] Syncing ${unsyncedTransactions.length} transactions`)

      for (const transaction of unsyncedTransactions) {
        try {
          const response = await fetch('/api/transactions/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
          })

          if (response.ok) {
            await offlineDB.markTransactionSynced(transaction.id)
            result.synced++
            this.emit('transaction-synced', { id: transaction.id })
          } else {
            result.failed++
            result.errors.push({ 
              id: transaction.id, 
              error: `HTTP ${response.status}` 
            })
          }
        } catch (error) {
          console.error(`[SyncManager] Failed to sync transaction ${transaction.id}:`, error)
          result.failed++
          result.errors.push({ 
            id: transaction.id, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
        }
      }

      result.success = result.failed === 0

    } catch (error) {
      console.error('[SyncManager] Sync failed:', error)
      result.success = false
    } finally {
      this.isSyncing = false
      this.emit('sync-complete', result)
    }

    return result
  }

  private async processQueuedRequest(request: QueuedRequest): Promise<boolean> {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      })

      if (response.ok) {
        console.log(`[SyncManager] Successfully synced request ${request.id}`)
        return true
      }

      // Handle specific error codes
      if (response.status === 409) {
        // Conflict - might be duplicate, consider it success
        console.log(`[SyncManager] Request ${request.id} conflict - treating as success`)
        return true
      }

      if (response.status >= 500) {
        // Server error - retry later
        throw new Error(`Server error: ${response.status}`)
      }

      // Client error - don't retry
      console.error(`[SyncManager] Client error for request ${request.id}: ${response.status}`)
      return false

    } catch (error) {
      console.error(`[SyncManager] Network error for request ${request.id}:`, error)
      throw error
    }
  }

  private async handleRetry(request: QueuedRequest) {
    const retryCount = request.retryCount || 0
    
    if (retryCount >= this.maxRetries) {
      console.log(`[SyncManager] Max retries reached for request ${request.id}`)
      await offlineDB.removeFromQueue(request.id)
      this.emit('request-failed', { 
        id: request.id, 
        error: 'Max retries exceeded' 
      })
      return
    }

    const delay = this.retryDelays[Math.min(retryCount, this.retryDelays.length - 1)]
    
    await offlineDB.updateQueueItem(request.id, {
      retryCount: retryCount + 1,
      lastError: `Retry ${retryCount + 1}/${this.maxRetries}`
    })

    console.log(`[SyncManager] Will retry request ${request.id} in ${delay}ms`)
    
    setTimeout(() => {
      if (navigator.onLine) {
        this.processQueuedRequest(request).then(success => {
          if (success) {
            offlineDB.removeFromQueue(request.id)
          }
        })
      }
    }, delay)
  }

  // Event emitter methods
  on(event: string, callback: (data: any) => void) {
    this.listeners.set(event, callback)
  }

  off(event: string) {
    this.listeners.delete(event)
  }

  private emit(event: string, data: any) {
    const callback = this.listeners.get(event)
    if (callback) {
      callback(data)
    }
  }

  // Force sync
  async forceSync(): Promise<SyncResult> {
    console.log('[SyncManager] Force sync triggered')
    return this.sync()
  }

  // Get sync status
  async getStatus(): Promise<{
    online: boolean
    syncing: boolean
    queueSize: number
    stats: any
  }> {
    const stats = await offlineDB.getStats()
    
    return {
      online: navigator.onLine,
      syncing: this.isSyncing,
      queueSize: stats.queued,
      stats
    }
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    await offlineDB.clearAll()
    this.emit('data-cleared', { timestamp: Date.now() })
  }

  // Stop auto-sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Queue a transaction for sync
  async queueTransaction(transaction: any): Promise<void> {
    const request: QueuedRequest = {
      id: `txn-${transaction.id}`,
      url: '/api/transactions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
      timestamp: Date.now()
    }
    
    await offlineDB.addToQueue(request)
    await offlineDB.saveTransaction({ ...transaction, synced: false })
    
    this.emit('transaction-queued', { 
      id: transaction.id,
      queueSize: await offlineDB.getQueueSize()
    })
  }

  // Check if offline mode is supported
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'serviceWorker' in navigator && 
           'indexedDB' in window
  }
}

// Export singleton instance
export const syncManager = new SyncManager()