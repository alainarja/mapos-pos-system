// IndexedDB Manager for Offline Storage
import { Transaction } from '@/types'

const DB_NAME = 'MAPOS_OFFLINE_DB'
const DB_VERSION = 1

export interface QueuedRequest {
  id: string
  url: string
  method: string
  headers: Record<string, string>
  body: string
  timestamp: number
  retryCount?: number
  lastError?: string
}

export interface OfflineTransaction extends Transaction {
  synced: boolean
  syncError?: string
  queueId?: string
}

class IndexedDBManager {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB initialized successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { 
            keyPath: 'id',
            autoIncrement: false 
          })
          transactionStore.createIndex('synced', 'synced', { unique: false })
          transactionStore.createIndex('date', 'date', { unique: false })
        }

        if (!db.objectStoreNames.contains('queue')) {
          const queueStore = db.createObjectStore('queue', { 
            keyPath: 'id',
            autoIncrement: false
          })
          queueStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { 
            keyPath: 'id',
            autoIncrement: false 
          })
          productsStore.createIndex('category', 'category', { unique: false })
        }

        if (!db.objectStoreNames.contains('customers')) {
          const customersStore = db.createObjectStore('customers', { 
            keyPath: 'id',
            autoIncrement: false 
          })
          customersStore.createIndex('email', 'email', { unique: false })
        }

        console.log('IndexedDB stores created')
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error('Failed to initialize database')
    }
    return this.db
  }

  // Transaction Management
  async saveTransaction(transaction: OfflineTransaction): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['transactions'], 'readwrite')
      const store = tx.objectStore('transactions')
      
      const request = store.put({
        ...transaction,
        synced: false,
        timestamp: Date.now()
      })

      request.onsuccess = () => {
        console.log('Transaction saved offline:', transaction.id)
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to save transaction:', request.error)
        reject(request.error)
      }
    })
  }

  async getUnsyncedTransactions(): Promise<OfflineTransaction[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['transactions'], 'readonly')
      const store = tx.objectStore('transactions')
      const index = store.index('synced')
      
      const request = index.getAll(false)

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('Failed to get unsynced transactions:', request.error)
        reject(request.error)
      }
    })
  }

  async markTransactionSynced(id: string): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['transactions'], 'readwrite')
      const store = tx.objectStore('transactions')
      
      const getRequest = store.get(id)
      
      getRequest.onsuccess = () => {
        const transaction = getRequest.result
        if (transaction) {
          transaction.synced = true
          const putRequest = store.put(transaction)
          
          putRequest.onsuccess = () => {
            console.log('Transaction marked as synced:', id)
            resolve()
          }
          
          putRequest.onerror = () => {
            reject(putRequest.error)
          }
        } else {
          resolve()
        }
      }
      
      getRequest.onerror = () => {
        reject(getRequest.error)
      }
    })
  }

  async getAllTransactions(): Promise<OfflineTransaction[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['transactions'], 'readonly')
      const store = tx.objectStore('transactions')
      
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('Failed to get all transactions:', request.error)
        reject(request.error)
      }
    })
  }

  async getTransactionById(id: string): Promise<OfflineTransaction | null> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['transactions'], 'readonly')
      const store = tx.objectStore('transactions')
      
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        console.error('Failed to get transaction by id:', request.error)
        reject(request.error)
      }
    })
  }

  // Queue Management
  async addToQueue(request: QueuedRequest): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['queue'], 'readwrite')
      const store = tx.objectStore('queue')
      
      const req = store.put(request)

      req.onsuccess = () => {
        console.log('Request added to queue:', request.id)
        resolve()
      }

      req.onerror = () => {
        console.error('Failed to queue request:', req.error)
        reject(req.error)
      }
    })
  }

  async getQueuedRequests(): Promise<QueuedRequest[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['queue'], 'readonly')
      const store = tx.objectStore('queue')
      const index = store.index('timestamp')
      
      const request = index.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('Failed to get queued requests:', request.error)
        reject(request.error)
      }
    })
  }

  async removeFromQueue(id: string): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['queue'], 'readwrite')
      const store = tx.objectStore('queue')
      
      const request = store.delete(id)

      request.onsuccess = () => {
        console.log('Request removed from queue:', id)
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to remove from queue:', request.error)
        reject(request.error)
      }
    })
  }

  async updateQueueItem(id: string, updates: Partial<QueuedRequest>): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['queue'], 'readwrite')
      const store = tx.objectStore('queue')
      
      const getRequest = store.get(id)
      
      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          const updated = { ...item, ...updates }
          const putRequest = store.put(updated)
          
          putRequest.onsuccess = () => {
            resolve()
          }
          
          putRequest.onerror = () => {
            reject(putRequest.error)
          }
        } else {
          resolve()
        }
      }
      
      getRequest.onerror = () => {
        reject(getRequest.error)
      }
    })
  }

  // Product Cache
  async cacheProducts(products: any[]): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['products'], 'readwrite')
      const store = tx.objectStore('products')
      
      let completed = 0
      const total = products.length

      products.forEach(product => {
        const request = store.put(product)
        
        request.onsuccess = () => {
          completed++
          if (completed === total) {
            console.log(`Cached ${total} products for offline use`)
            resolve()
          }
        }
        
        request.onerror = () => {
          console.error('Failed to cache product:', request.error)
        }
      })

      if (total === 0) {
        resolve()
      }
    })
  }

  async getCachedProducts(): Promise<any[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['products'], 'readonly')
      const store = tx.objectStore('products')
      
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('Failed to get cached products:', request.error)
        reject(request.error)
      }
    })
  }

  // Customer Cache
  async cacheCustomers(customers: any[]): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['customers'], 'readwrite')
      const store = tx.objectStore('customers')
      
      let completed = 0
      const total = customers.length

      customers.forEach(customer => {
        const request = store.put(customer)
        
        request.onsuccess = () => {
          completed++
          if (completed === total) {
            console.log(`Cached ${total} customers for offline use`)
            resolve()
          }
        }
        
        request.onerror = () => {
          console.error('Failed to cache customer:', request.error)
        }
      })

      if (total === 0) {
        resolve()
      }
    })
  }

  async getCachedCustomers(): Promise<any[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['customers'], 'readonly')
      const store = tx.objectStore('customers')
      
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('Failed to get cached customers:', request.error)
        reject(request.error)
      }
    })
  }

  // Clear all data
  async clearAll(): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const stores = ['transactions', 'queue', 'products', 'customers']
      const tx = db.transaction(stores, 'readwrite')
      
      stores.forEach(storeName => {
        tx.objectStore(storeName).clear()
      })

      tx.oncomplete = () => {
        console.log('All offline data cleared')
        resolve()
      }

      tx.onerror = () => {
        console.error('Failed to clear data:', tx.error)
        reject(tx.error)
      }
    })
  }

  // Get queue size
  async getQueueSize(): Promise<number> {
    const queue = await this.getQueuedRequests()
    return queue.length
  }

  // Get database stats
  async getStats(): Promise<{
    transactions: number
    unsynced: number
    queued: number
    products: number
    customers: number
  }> {
    const db = await this.ensureDB()
    
    const getCount = (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], 'readonly')
        const store = tx.objectStore(storeName)
        const request = store.count()
        
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }
    
    const [transactions, queued, products, customers] = await Promise.all([
      getCount('transactions'),
      getCount('queue'),
      getCount('products'),
      getCount('customers')
    ])
    
    const unsynced = await this.getUnsyncedTransactions().then(t => t.length)
    
    return {
      transactions,
      unsynced,
      queued,
      products,
      customers
    }
  }
}

// Export singleton instance
export const offlineDB = new IndexedDBManager()