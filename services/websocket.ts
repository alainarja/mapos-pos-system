import { useInventoryStore } from '@/stores/inventory'
import { useNotificationStore } from '@/stores/notifications'

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false

  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.isConnecting = true

    try {
      // In a real app, this would be a WebSocket URL
      // For demo purposes, we'll simulate WebSocket functionality
      this.simulateWebSocket()
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.handleConnectionError()
    }
  }

  private simulateWebSocket() {
    // Simulate WebSocket connection success
    setTimeout(() => {
      this.isConnecting = false
      this.reconnectAttempts = 0
      console.log('WebSocket simulation connected')
      
      this.startSimulation()
    }, 1000)
  }

  private startSimulation() {
    // Simulate real-time inventory updates
    this.simulateInventoryUpdates()
    
    // Simulate multi-terminal sync
    this.simulateMultiTerminalSync()
    
    // Simulate notifications
    this.simulateNotifications()
  }

  private simulateInventoryUpdates() {
    const updateInterval = setInterval(() => {
      const { products, updateStock } = useInventoryStore.getState()
      
      // Randomly update stock for a product (simulate sales from other terminals)
      if (products.length > 0) {
        const randomProduct = products[Math.floor(Math.random() * products.length)]
        
        // 20% chance of stock update
        if (Math.random() < 0.2) {
          const change = Math.floor(Math.random() * 3) + 1 // 1-3 items
          const operation = Math.random() < 0.7 ? 'subtract' : 'add' // 70% sales, 30% restocking
          
          updateStock(randomProduct.id, change, operation)
          
          // Notify about the update
          this.broadcastMessage({
            type: 'inventory_update',
            productId: randomProduct.id,
            productName: randomProduct.name,
            change,
            operation,
            newStock: operation === 'subtract' 
              ? Math.max(0, randomProduct.stock - change)
              : randomProduct.stock + change,
            timestamp: new Date().toISOString()
          })
        }
      }
    }, 15000) // Every 15 seconds

    // Store interval ID for cleanup
    this.addCleanupTask(() => clearInterval(updateInterval))
  }

  private simulateMultiTerminalSync() {
    const syncInterval = setInterval(() => {
      // Simulate receiving transaction from another terminal
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const mockTransaction = {
          id: `TXN-${Math.random().toString(36).substr(2, 9)}`,
          terminal: `Terminal-${Math.floor(Math.random() * 5) + 1}`,
          amount: Math.floor(Math.random() * 100) + 10,
          timestamp: new Date().toISOString()
        }

        this.broadcastMessage({
          type: 'terminal_sync',
          transaction: mockTransaction,
          message: `Sale of $${mockTransaction.amount} processed on ${mockTransaction.terminal}`
        })
      }
    }, 30000) // Every 30 seconds

    this.addCleanupTask(() => clearInterval(syncInterval))
  }

  private simulateNotifications() {
    const notificationInterval = setInterval(() => {
      const { addNotification } = useNotificationStore.getState()
      
      // Random notifications
      if (Math.random() < 0.15) { // 15% chance every 45 seconds
        const notifications = [
          {
            type: 'info' as const,
            title: 'System Update',
            message: 'Inventory levels have been synchronized across all terminals'
          },
          {
            type: 'success' as const,
            title: 'Backup Complete',
            message: 'Daily data backup completed successfully'
          },
          {
            type: 'warning' as const,
            title: 'Low Stock Alert',
            message: 'Some items are running low and may need restocking'
          },
          {
            type: 'info' as const,
            title: 'Peak Hours',
            message: 'Entering peak sales hours - ensure all stations are ready'
          }
        ]

        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
        addNotification(randomNotification)
      }
    }, 45000) // Every 45 seconds

    this.addCleanupTask(() => clearInterval(notificationInterval))
  }

  private broadcastMessage(message: any) {
    // Simulate broadcasting message to all connected clients
    console.log('WebSocket broadcast:', message)
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('websocket-message', {
      detail: message
    }))
  }

  private handleConnectionError() {
    this.isConnecting = false
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`WebSocket reconnection attempt ${this.reconnectAttempts}`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('WebSocket max reconnection attempts reached')
    }
  }

  private cleanupTasks: (() => void)[] = []

  private addCleanupTask(task: () => void) {
    this.cleanupTasks.push(task)
  }

  disconnect() {
    // Clean up all intervals and listeners
    this.cleanupTasks.forEach(task => task())
    this.cleanupTasks = []

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    console.log('WebSocket simulation disconnected')
  }

  // Simulate sending messages
  send(message: any) {
    console.log('WebSocket send:', message)
    
    // Simulate server response
    setTimeout(() => {
      this.broadcastMessage({
        type: 'response',
        originalMessage: message,
        status: 'success',
        timestamp: new Date().toISOString()
      })
    }, 500)
  }

  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting'
    return 'connected' // For simulation, always connected after initial connection
  }
}

// Singleton instance
export const webSocketService = new WebSocketService()

// Hook for components to use WebSocket
export function useWebSocket() {
  const connect = () => webSocketService.connect()
  const disconnect = () => webSocketService.disconnect()
  const send = (message: any) => webSocketService.send(message)
  const getStatus = () => webSocketService.getConnectionStatus()

  return {
    connect,
    disconnect,
    send,
    getStatus
  }
}

// Real-time hook for listening to WebSocket messages
export function useWebSocketListener(callback: (message: any) => void) {
  const handleMessage = (event: CustomEvent) => {
    callback(event.detail)
  }

  // Add event listener
  window.addEventListener('websocket-message', handleMessage as EventListener)

  // Return cleanup function
  return () => {
    window.removeEventListener('websocket-message', handleMessage as EventListener)
  }
}