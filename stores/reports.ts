import { create } from 'zustand'
import { SalesReport, InventoryReport, Transaction, Product } from '@/types'
import { useInventoryStore } from './inventory'

interface ReportsState {
  salesReports: SalesReport[]
  inventoryReports: InventoryReport[]
  isLoading: boolean
  dateRange: {
    start: Date
    end: Date
  }
  
  // Actions
  generateSalesReport: (start: Date, end: Date) => Promise<SalesReport>
  generateInventoryReport: () => Promise<InventoryReport>
  setDateRange: (start: Date, end: Date) => void
  exportReport: (reportType: 'sales' | 'inventory', format: 'csv' | 'pdf') => void
  setLoading: (loading: boolean) => void
}

// Mock transaction data for reports
const mockTransactions: Transaction[] = [
  {
    id: "TXN-001",
    date: "2024-01-15",
    time: "14:30:25",
    total: 67.25,
    subtotal: 62.27,
    tax: 4.98,
    discount: 0,
    items: [
      { id: "1", name: "Premium Coffee Beans", price: 24.99, quantity: 2, image: "/pile-of-coffee-beans.png" },
      { id: "3", name: "Artisan Chocolate", price: 12.99, quantity: 1, image: "/chocolate-bar.png" }
    ],
    paymentMethod: "Card",
    cashier: "Current User",
    status: "completed",
    receiptNumber: "R-001"
  },
  {
    id: "TXN-002",
    date: "2024-01-15",
    time: "13:45:12",
    total: 23.5,
    subtotal: 21.76,
    tax: 1.74,
    discount: 0,
    items: [
      { id: "2", name: "Organic Green Tea", price: 18.5, quantity: 1, image: "/cup-of-green-tea.png" },
      { id: "4", name: "Fresh Croissant", price: 3.5, quantity: 1, image: "/golden-croissant.png" }
    ],
    paymentMethod: "Cash",
    cashier: "Current User",
    status: "completed",
    receiptNumber: "R-002"
  },
  {
    id: "TXN-003",
    date: "2024-01-15",
    time: "12:15:33",
    total: 89.99,
    subtotal: 83.32,
    tax: 6.67,
    discount: 0,
    items: [
      { id: "1", name: "Premium Coffee Beans", price: 24.99, quantity: 3, image: "/pile-of-coffee-beans.png" },
      { id: "6", name: "Energy Drink", price: 2.99, quantity: 2, image: "/vibrant-energy-drink.png" },
      { id: "7", name: "Protein Bar", price: 5.99, quantity: 1, image: "/protein-bar.png" }
    ],
    paymentMethod: "Digital Wallet",
    cashier: "Current User",
    status: "completed",
    receiptNumber: "R-003"
  },
  {
    id: "TXN-004",
    date: "2024-01-14",
    time: "16:22:15",
    total: 45.75,
    subtotal: 42.36,
    tax: 3.39,
    discount: 0,
    items: [
      { id: "8", name: "Sandwich Wrap", price: 8.99, quantity: 2, image: "/wrap-sandwich.png" },
      { id: "5", name: "Blueberry Muffin", price: 3.75, quantity: 4, image: "/blueberry-muffin.png" }
    ],
    paymentMethod: "Card",
    cashier: "Current User",
    status: "completed",
    receiptNumber: "R-004"
  },
  {
    id: "TXN-005",
    date: "2024-01-14",
    time: "11:30:45",
    total: 31.47,
    subtotal: 29.14,
    tax: 2.33,
    discount: 0,
    items: [
      { id: "2", name: "Organic Green Tea", price: 18.5, quantity: 1, image: "/cup-of-green-tea.png" },
      { id: "3", name: "Artisan Chocolate", price: 12.99, quantity: 1, image: "/chocolate-bar.png" }
    ],
    paymentMethod: "Cash",
    cashier: "Current User",
    status: "completed",
    receiptNumber: "R-005"
  }
]

export const useReportsStore = create<ReportsState>((set, get) => ({
  salesReports: [],
  inventoryReports: [],
  isLoading: false,
  dateRange: {
    start: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
    end: new Date()
  },

  generateSalesReport: async (start: Date, end: Date): Promise<SalesReport> => {
    set({ isLoading: true })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      // Filter transactions by date range
      const filteredTransactions = mockTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= start && transactionDate <= end
      })

      const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0)
      const totalTransactions = filteredTransactions.length
      const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0

      // Calculate top products
      const productSales: Record<string, { quantity: number, revenue: number, product?: any }> = {}
      filteredTransactions.forEach(transaction => {
        transaction.items.forEach(item => {
          if (!productSales[item.id]) {
            productSales[item.id] = { quantity: 0, revenue: 0, product: item }
          }
          productSales[item.id].quantity += item.quantity
          productSales[item.id].revenue += item.price * item.quantity
        })
      })

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(p => ({
          product: p.product,
          quantitySold: p.quantity,
          revenue: p.revenue
        }))

      // Calculate category breakdown
      const categoryMap: Record<string, number> = {
        'Coffee': 0, 'Tea': 0, 'Snacks': 0, 'Bakery': 0, 'Beverages': 0, 'Food': 0
      }
      
      filteredTransactions.forEach(transaction => {
        transaction.items.forEach(item => {
          // Map items to categories (simplified)
          let category = 'Other'
          if (item.name.includes('Coffee')) category = 'Coffee'
          else if (item.name.includes('Tea')) category = 'Tea'
          else if (item.name.includes('Chocolate') || item.name.includes('Protein')) category = 'Snacks'
          else if (item.name.includes('Croissant') || item.name.includes('Muffin')) category = 'Bakery'
          else if (item.name.includes('Drink')) category = 'Beverages'
          else if (item.name.includes('Sandwich') || item.name.includes('Wrap')) category = 'Food'
          
          categoryMap[category] = (categoryMap[category] || 0) + (item.price * item.quantity)
        })
      })

      const topCategories = Object.entries(categoryMap)
        .filter(([_, revenue]) => revenue > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([category, revenue]) => ({
          category,
          revenue,
          percentage: totalSales > 0 ? (revenue / totalSales) * 100 : 0
        }))

      // Generate hourly breakdown
      const hourlyData: Record<string, { sales: number, transactions: number }> = {}
      for (let hour = 0; hour < 24; hour++) {
        hourlyData[hour.toString().padStart(2, '0') + ':00'] = { sales: 0, transactions: 0 }
      }

      filteredTransactions.forEach(transaction => {
        const hour = transaction.time.split(':')[0] + ':00'
        if (hourlyData[hour]) {
          hourlyData[hour].sales += transaction.total
          hourlyData[hour].transactions += 1
        }
      })

      const hourlyBreakdown = Object.entries(hourlyData)
        .map(([hour, data]) => ({ hour, ...data }))

      // Payment methods breakdown
      const paymentMethods: Record<string, number> = {}
      filteredTransactions.forEach(transaction => {
        paymentMethods[transaction.paymentMethod] = 
          (paymentMethods[transaction.paymentMethod] || 0) + transaction.total
      })

      const paymentMethodsArray = Object.entries(paymentMethods)
        .map(([method, amount]) => ({
          method,
          amount,
          percentage: totalSales > 0 ? (amount / totalSales) * 100 : 0
        }))

      const report: SalesReport = {
        period: { start, end },
        totalSales,
        totalTransactions,
        averageTransaction,
        topProducts,
        topCategories,
        hourlyBreakdown,
        paymentMethods: paymentMethodsArray
      }

      const { salesReports } = get()
      set({ 
        salesReports: [report, ...salesReports],
        isLoading: false 
      })

      return report
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  generateInventoryReport: async (): Promise<InventoryReport> => {
    set({ isLoading: true })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    try {
      // Get products from inventory store
      const { products } = useInventoryStore.getState()
      
      const totalProducts = products.length
      const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)
      
      const lowStockItems = products.filter(product => 
        product.minStock && product.stock <= product.minStock && product.stock > 0
      )
      
      const outOfStockItems = products.filter(product => product.stock === 0)
      
      // Mock top selling and slow moving items based on mock sales data
      const productSales = products.map(product => ({
        ...product,
        totalSold: Math.floor(Math.random() * 100) // Mock sales data
      }))
      
      const topSellingItems = productSales
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10)
      
      const slowMovingItems = productSales
        .sort((a, b) => a.totalSold - b.totalSold)
        .slice(0, 10)
      
      // Category breakdown
      const categoryBreakdown: Record<string, { itemCount: number, value: number }> = {}
      products.forEach(product => {
        if (!categoryBreakdown[product.category]) {
          categoryBreakdown[product.category] = { itemCount: 0, value: 0 }
        }
        categoryBreakdown[product.category].itemCount += 1
        categoryBreakdown[product.category].value += product.price * product.stock
      })

      const categoryBreakdownArray = Object.entries(categoryBreakdown)
        .map(([category, data]) => ({ category, ...data }))

      const report: InventoryReport = {
        totalProducts,
        totalValue,
        lowStockItems,
        outOfStockItems,
        topSellingItems,
        slowMovingItems,
        categoryBreakdown: categoryBreakdownArray
      }

      const { inventoryReports } = get()
      set({ 
        inventoryReports: [report, ...inventoryReports],
        isLoading: false 
      })

      return report
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  setDateRange: (start: Date, end: Date) => {
    set({ dateRange: { start, end } })
  },

  exportReport: (reportType: 'sales' | 'inventory', format: 'csv' | 'pdf') => {
    // Mock export functionality
    console.log(`Exporting ${reportType} report as ${format.toUpperCase()}`)
    
    // In a real app, this would generate and download the file
    const fileName = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`
    
    if (format === 'csv') {
      // Mock CSV generation
      let csvContent = ''
      if (reportType === 'sales') {
        csvContent = 'Date,Transaction ID,Total,Payment Method,Items\n'
        mockTransactions.forEach(t => {
          csvContent += `${t.date},${t.id},${t.total},${t.paymentMethod},${t.items.length}\n`
        })
      } else {
        csvContent = 'Product,SKU,Category,Price,Stock,Value\n'
        // This would use actual inventory data
        csvContent += 'Sample Product,SKU-001,Sample Category,10.00,5,50.00\n'
      }
      
      // Create and download blob
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } else {
      // Mock PDF generation - in real app would use jsPDF or similar
      alert(`PDF export for ${reportType} report would be generated here`)
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  }
}))