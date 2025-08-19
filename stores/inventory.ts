import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, Category, InventoryAlert, ProductFilter, SortOption, PriceRange, FilterChip } from '@/types'

// Helper function to assign appropriate icons to categories
function getCategoryIcon(categoryName: string): string {
  const name = categoryName.toLowerCase()
  
  if (name.includes('coffee')) return '☕'
  if (name.includes('tea')) return '🍵'
  if (name.includes('snack')) return '🍿'
  if (name.includes('bakery') || name.includes('bread') || name.includes('pastry') || name.includes('croissant')) return '🥐'
  if (name.includes('beverage') || name.includes('drink') || name.includes('juice')) return '🥤'
  if (name.includes('food') || name.includes('meal') || name.includes('lunch') || name.includes('dinner')) return '🍽️'
  if (name.includes('special') || name.includes('premium') || name.includes('limited')) return '⭐'
  if (name.includes('sales')) return '🛒'
  if (name.includes('marble') || name.includes('stone')) return '🪨'
  if (name.includes('material') || name.includes('raw')) return '📦'
  if (name.includes('tool') || name.includes('equipment')) return '🔧'
  
  // Default icon
  return '📁'
}

interface SearchSuggestion {
  id: string
  type: 'product' | 'category' | 'brand' | 'sku' | 'recent' | 'trending'
  value: string
  label: string
  product?: {
    id: string
    name: string
    price: number
    stock: number
    image?: string
  }
  score?: number
}

interface SearchHistory {
  recentSearches: string[]
  trendingSearches: { term: string; count: number }[]
  searchCount: Record<string, number>
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  unit: string
  category: string
  active: boolean
  duration?: number // in minutes
}

interface InventoryState {
  products: Product[]
  services: Service[]
  categories: Category[]
  categoryMap: Record<string, string> // Maps category UUID to category name
  alerts: InventoryAlert[]
  selectedCategory: string
  searchTerm: string
  isLoading: boolean
  isRefreshing: boolean
  lastRefresh: Date | null
  autoRefreshEnabled: boolean
  autoRefreshInterval: number // in minutes
  
  // Enhanced Search and Filter State
  filters: ProductFilter
  sortBy: SortOption
  isFilterSidebarOpen: boolean
  activeFilterChips: FilterChip[]
  searchHistory: SearchHistory
  
  // Actions
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  setServices: (services: Service[]) => void
  addService: (service: Service) => void
  updateService: (id: string, updates: Partial<Service>) => void
  deleteService: (id: string) => void
  updateStock: (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') => void
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  setSelectedCategory: (categoryId: string) => void
  setSearchTerm: (term: string) => void
  getFilteredProducts: () => Product[]
  getLowStockProducts: () => Product[]
  getOutOfStockProducts: () => Product[]
  generateAlerts: () => void
  markAlertAsRead: (alertId: string) => void
  getProductByBarcode: (barcode: string) => Product | undefined
  setLoading: (loading: boolean) => void
  
  // Refresh functionality
  refreshInventory: () => Promise<{ success: boolean; message: string }>
  setRefreshing: (refreshing: boolean) => void
  setAutoRefreshEnabled: (enabled: boolean) => void
  setAutoRefreshInterval: (minutes: number) => void
  loadInitialData: () => Promise<void>
  loadCategories: () => Promise<void>
  
  // Enhanced Search and Filter Actions
  setFilters: (filters: Partial<ProductFilter>) => void
  setSortBy: (sortBy: SortOption) => void
  toggleFilterSidebar: () => void
  clearAllFilters: () => void
  removeFilter: (chipId: string) => void
  getAdvancedFilteredProducts: () => Product[]
  getFilterChips: () => FilterChip[]
  getAvailableBrands: () => string[]
  getAvailableSuppliers: () => string[]
  getPredefinedPriceRanges: () => PriceRange[]
  getResultsCount: () => number
  getActiveFilterCount: () => number
  
  // Search suggestions and history
  getSearchSuggestions: (query: string) => SearchSuggestion[]
  addRecentSearch: (term: string) => void
  clearRecentSearches: () => void
  getFuzzySearchResults: (query: string) => Product[]
  calculateSearchScore: (product: Product, query: string) => number
}

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Coffee Beans",
    price: 24.99,
    cost: 12.50,
    category: "Coffee",
    image: "/pile-of-coffee-beans.png",
    stock: 50,
    barcode: "1234567890123",
    sku: "COF-001",
    description: "Premium arabica coffee beans",
    minStock: 10,
    maxStock: 100,
    unit: "bag",
    supplier: "Coffee Co.",
    brand: "Premium Roasters",
    isFeatured: true,
    isNew: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    taxRate: 0.08,
    taxCategory: "food"
  },
  {
    id: "2",
    name: "Organic Green Tea",
    price: 18.5,
    cost: 8.75,
    category: "Tea",
    image: "/cup-of-green-tea.png",
    stock: 30,
    barcode: "1234567890124",
    sku: "TEA-001",
    description: "Organic green tea leaves",
    minStock: 15,
    maxStock: 80,
    unit: "box",
    supplier: "Tea Masters",
    brand: "Organic Leaf",
    isFeatured: false,
    isNew: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    taxExempt: true,
    taxCategory: "health"
  },
  {
    id: "3",
    name: "Artisan Chocolate",
    price: 12.99,
    cost: 6.50,
    category: "Snacks",
    image: "/chocolate-bar.png",
    stock: 25,
    barcode: "1234567890125",
    sku: "CHO-001",
    description: "Handcrafted artisan chocolate",
    minStock: 20,
    maxStock: 60,
    unit: "bar",
    supplier: "Chocolate Factory",
    brand: "Artisan Sweets",
    isFeatured: true,
    isNew: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    taxRate: 0.15,
    taxCategory: "luxury"
  },
  {
    id: "4",
    name: "Fresh Croissant",
    price: 3.5,
    cost: 1.25,
    category: "Bakery",
    image: "/golden-croissant.png",
    stock: 15,
    barcode: "1234567890126",
    sku: "BAK-001",
    description: "Fresh baked croissant",
    minStock: 20,
    maxStock: 40,
    unit: "piece",
    supplier: "Daily Bakery",
    brand: "Fresh Bites",
    isFeatured: false,
    isNew: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    taxRate: 0.05,
    taxCategory: "food"
  },
  {
    id: "5",
    name: "Blueberry Muffin",
    price: 3.75,
    cost: 1.50,
    category: "Bakery",
    image: "/blueberry-muffin.png",
    stock: 20,
    barcode: "1234567890127",
    sku: "BAK-002",
    description: "Blueberry muffin with real berries",
    minStock: 15,
    maxStock: 35,
    unit: "piece",
    supplier: "Daily Bakery",
    brand: "Fresh Bites",
    isFeatured: false,
    isNew: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    taxRate: 0.05,
    taxCategory: "food"
  },
  {
    id: "6",
    name: "Energy Drink",
    price: 2.99,
    cost: 1.20,
    category: "Beverages",
    image: "/vibrant-energy-drink.png",
    stock: 40,
    barcode: "1234567890128",
    sku: "BEV-001",
    description: "High energy drink with vitamins",
    minStock: 30,
    maxStock: 100,
    unit: "can",
    supplier: "Energy Corp",
    brand: "PowerBoost",
    isFeatured: true,
    isNew: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "7",
    name: "Protein Bar",
    price: 5.99,
    cost: 2.75,
    category: "Snacks",
    image: "/protein-bar.png",
    stock: 35,
    barcode: "1234567890129",
    sku: "SNA-001",
    description: "High protein energy bar",
    minStock: 25,
    maxStock: 75,
    unit: "bar",
    supplier: "Protein Plus",
    brand: "FitFuel",
    isFeatured: false,
    isNew: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "8",
    name: "Sandwich Wrap",
    price: 8.99,
    cost: 4.25,
    category: "Food",
    image: "/wrap-sandwich.png",
    stock: 12,
    barcode: "1234567890130",
    sku: "FOO-001",
    description: "Fresh sandwich wrap",
    minStock: 15,
    maxStock: 30,
    unit: "piece",
    supplier: "Fresh Foods",
    brand: "Daily Fresh",
    isFeatured: false,
    isNew: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "9",
    name: "Limited Edition Item",
    price: 15.99,
    cost: 8.00,
    category: "Special",
    image: "/placeholder.svg",
    stock: 2,
    barcode: "1234567890131",
    sku: "SPE-001",
    description: "Exclusive limited edition item with unique design and premium materials. Collector's item with certificate of authenticity.",
    minStock: 5,
    maxStock: 20,
    unit: "piece",
    supplier: "Special Items Co.",
    brand: "Limited",
    isFeatured: true,
    isNew: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["limited", "exclusive", "collector"],
    availability: "limited"
  },
  {
    id: "10",
    name: "Sold Out Special",
    price: 12.99,
    cost: 6.00,
    category: "Special",
    image: "/placeholder.svg",
    stock: 0,
    barcode: "1234567890132",
    sku: "SPE-002",
    description: "Popular item that's currently out of stock. High demand product with excellent customer reviews.",
    minStock: 10,
    maxStock: 50,
    unit: "piece",
    supplier: "Popular Items Inc.",
    brand: "BestSeller",
    isFeatured: false,
    isNew: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["popular", "bestseller"],
    availability: "unavailable"
  }
]

const mockCategories: Category[] = [
  { id: "1", name: "Coffee", description: "Coffee products", icon: "☕", parentId: undefined, isActive: true, order: 1 },
  { id: "2", name: "Tea", description: "Tea products", icon: "🍵", parentId: undefined, isActive: true, order: 2 },
  { id: "3", name: "Snacks", description: "Snack products", icon: "🍿", parentId: undefined, isActive: true, order: 3 },
  { id: "4", name: "Bakery", description: "Bakery products", icon: "🥐", parentId: undefined, isActive: true, order: 4 },
  { id: "5", name: "Beverages", description: "Beverage products", icon: "🥤", parentId: undefined, isActive: true, order: 5 },
  { id: "6", name: "Food", description: "Food products", icon: "🍽️", parentId: undefined, isActive: true, order: 6 },
  { id: "7", name: "Special", description: "Limited edition and special items", icon: "⭐", parentId: undefined, isActive: true, order: 7 }
]

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      products: mockProducts,
      services: [],
      categories: mockCategories,
      categoryMap: {},
      alerts: [],
      selectedCategory: "All",
      searchTerm: "",
      isLoading: false,
      isRefreshing: false,
      lastRefresh: null,
      autoRefreshEnabled: false,
      autoRefreshInterval: 5, // 5 minutes default
      
      // Enhanced Search and Filter State
      filters: {
        categories: [],
        priceRange: null,
        customPriceRange: null,
        stockStatus: [],
        brands: [],
        tags: [],
        suppliers: []
      },
      sortBy: {
        field: 'name',
        direction: 'asc',
        label: 'Name (A-Z)'
      },
      isFilterSidebarOpen: false,
      activeFilterChips: [],
      searchHistory: {
        recentSearches: [],
        trendingSearches: [],
        searchCount: {}
      },

      setProducts: (products: Product[]) => {
        set({ products })
        get().generateAlerts()
      },

      addProduct: (product: Product) => {
        const { products } = get()
        set({ products: [...products, { ...product, createdAt: new Date(), updatedAt: new Date() }] })
        get().generateAlerts()
      },

      updateProduct: (id: string, updates: Partial<Product>) => {
        const { products } = get()
        set({
          products: products.map(product =>
            product.id === id
              ? { ...product, ...updates, updatedAt: new Date() }
              : product
          )
        })
        get().generateAlerts()
      },

      deleteProduct: (id: string) => {
        const { products } = get()
        set({ products: products.filter(product => product.id !== id) })
      },

      setServices: (services: Service[]) => {
        set({ services })
      },

      addService: (service: Service) => {
        const { services } = get()
        set({ services: [...services, service] })
      },

      updateService: (id: string, updates: Partial<Service>) => {
        const { services } = get()
        set({
          services: services.map(service =>
            service.id === id ? { ...service, ...updates } : service
          )
        })
      },

      deleteService: (id: string) => {
        const { services } = get()
        set({ services: services.filter(service => service.id !== id) })
      },

      updateStock: (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') => {
        const { products } = get()
        set({
          products: products.map(product => {
            if (product.id !== id) return product
            
            let newStock = product.stock
            switch (operation) {
              case 'add':
                newStock = product.stock + quantity
                break
              case 'subtract':
                newStock = Math.max(0, product.stock - quantity)
                break
              case 'set':
                newStock = Math.max(0, quantity)
                break
            }
            
            return { ...product, stock: newStock, updatedAt: new Date() }
          })
        })
        get().generateAlerts()
      },

      setCategories: (categories: Category[]) => {
        set({ categories })
      },

      addCategory: (category: Category) => {
        const { categories } = get()
        set({ categories: [...categories, category] })
      },

      updateCategory: (id: string, updates: Partial<Category>) => {
        const { categories } = get()
        set({
          categories: categories.map(category =>
            category.id === id ? { ...category, ...updates } : category
          )
        })
      },

      deleteCategory: (id: string) => {
        const { categories, products } = get()
        // Check if any products use this category
        const hasProducts = products.some(product => product.category === categories.find(c => c.id === id)?.name)
        if (!hasProducts) {
          set({ categories: categories.filter(category => category.id !== id) })
        }
      },

      setSelectedCategory: (categoryId: string) => {
        set({ selectedCategory: categoryId })
      },

      setSearchTerm: (term: string) => {
        set({ searchTerm: term })
      },

      getFilteredProducts: () => {
        const { products, selectedCategory, searchTerm, categories } = get()
        let filtered = products

        if (selectedCategory !== "All") {
          // Direct filtering by category name since selectedCategory is now the category name
          filtered = filtered.filter(product => product.category === selectedCategory)
        }

        if (searchTerm) {
          filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode?.includes(searchTerm)
          )
        }

        return filtered
      },

      getLowStockProducts: () => {
        const { products } = get()
        return products.filter(product => 
          product.minStock && product.stock <= product.minStock && product.stock > 0
        )
      },

      getOutOfStockProducts: () => {
        const { products } = get()
        return products.filter(product => product.stock === 0)
      },

      generateAlerts: () => {
        const { products } = get()
        const alerts: InventoryAlert[] = []
        
        products.forEach(product => {
          if (product.stock === 0) {
            alerts.push({
              id: `out-${product.id}`,
              productId: product.id,
              type: 'out_of_stock',
              message: `${product.name} is out of stock`,
              severity: 'critical',
              createdAt: new Date(),
              isRead: false
            })
          } else if (product.minStock && product.stock <= product.minStock) {
            alerts.push({
              id: `low-${product.id}`,
              productId: product.id,
              type: 'low_stock',
              message: `${product.name} is running low (${product.stock} left)`,
              severity: product.stock <= (product.minStock / 2) ? 'high' : 'medium',
              createdAt: new Date(),
              isRead: false
            })
          }
        })
        
        set({ alerts })
      },

      markAlertAsRead: (alertId: string) => {
        const { alerts } = get()
        set({
          alerts: alerts.map(alert =>
            alert.id === alertId ? { ...alert, isRead: true } : alert
          )
        })
      },

      getProductByBarcode: (barcode: string) => {
        const { products } = get()
        return products.find(product => product.barcode === barcode)
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Refresh functionality
      refreshInventory: async () => {
        const { setRefreshing } = get()
        
        try {
          setRefreshing(true)
          console.log('🔄 Starting inventory refresh...')
          
          // Fetch data from real API
          console.log('📦 Fetching inventory data from /api/inventory...')
          const response = await fetch('/api/inventory')
          console.log('📦 Inventory response status:', response.status)
          if (!response.ok) {
            throw new Error('Failed to fetch inventory data')
          }
          
          const apiData = await response.json()
          
          // Transform API data to Product format
          const { categoryMap } = get()
          const products = apiData.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.selling_price || item.price || 0,
            cost: item.unit_price || 0,
            category: categoryMap[item.category] || 'Uncategorized',
            image: item.imageUrl || item.image_url,
            stock: item.quantity || 0,
            barcode: item.sku,
            sku: item.sku,
            description: item.description || '',
            minStock: 10, // Default values
            maxStock: 100,
            unit: item.areaUnit || 'piece',
            supplier: 'External',
            brand: 'Store',
            isFeatured: false,
            isNew: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            // Tax fields from inventory API
            taxRate: item.tax_rate || item.taxRate || item.vat_rate || 0, // Get tax rate from API, default to 0 (no tax)
            taxExempt: item.tax_exempt || item.taxExempt || false,
            taxCategory: item.tax_category || item.taxCategory || 'standard'
          }))
          
          console.log('📦 Found', apiData.data?.length || 0, 'products')
          
          // Refresh services data
          let services = get().services
          try {
            console.log('🔧 Fetching services data from /api/services...')
            const servicesResponse = await fetch('/api/services')
            console.log('🔧 Services response status:', servicesResponse.status)
            if (servicesResponse.ok) {
              const servicesData = await servicesResponse.json()
              console.log('🔧 Found', servicesData.data?.length || 0, 'services')
              services = servicesData.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description || '',
                price: item.price || 0,
                unit: item.unit || 'service',
                category: item.category || 'Services',
                active: item.active !== false,
                duration: item.duration || 60
              }))
            }
          } catch (error) {
            console.warn('Failed to refresh services data:', error)
          }
          
          // Update store with fresh data
          console.log('💾 Updating store with', products.length, 'products and', services.length, 'services')
          set({
            products,
            services,
            lastRefresh: new Date()
          })
          
          // Regenerate alerts with fresh data
          get().generateAlerts()
          
          setRefreshing(false)
          console.log('✅ Inventory refresh completed successfully')
          return { success: true, message: 'Inventory refreshed successfully' }
          
        } catch (error) {
          setRefreshing(false)
          console.error('Refresh failed:', error)
          return { success: false, message: 'Failed to refresh inventory. Please try again.' }
        }
      },
      
      setRefreshing: (refreshing: boolean) => {
        set({ isRefreshing: refreshing })
      },
      
      setAutoRefreshEnabled: (enabled: boolean) => {
        set({ autoRefreshEnabled: enabled })
      },
      
      setAutoRefreshInterval: (minutes: number) => {
        set({ autoRefreshInterval: Math.max(1, Math.min(60, minutes)) }) // 1-60 minutes
      },
      
      loadInitialData: async () => {
        try {
          // Load categories first
          await get().loadCategories()
          
          // Load products
          const response = await fetch('/api/inventory')
          if (!response.ok) {
            console.warn('Failed to fetch initial inventory data, using mock data')
            return
          }
          
          const apiData = await response.json()
          
          // Log the raw inventory data to debug cost prices
          console.log('=== INVENTORY DATA FROM API ===')
          console.log('Total items received:', apiData.data?.length || 0)
          if (apiData.data && apiData.data.length > 0) {
            console.log('Sample item data (first 3 items):')
            apiData.data.slice(0, 3).forEach((item: any, index: number) => {
              console.log(`Item ${index + 1}:`, {
                id: item.id,
                name: item.name,
                unit_price: item.unit_price,
                selling_price: item.selling_price,
                price: item.price,
                quantity: item.quantity,
                category: item.category
              })
            })
          }
          
          // Transform API data to Product format
          const { categoryMap } = get()
          const products = apiData.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.selling_price || item.price || 0,
            cost: item.unit_price || 0,
            category: categoryMap[item.category] || 'Uncategorized',
            image: item.imageUrl || item.image_url,
            stock: item.quantity || 0,
            barcode: item.sku,
            sku: item.sku,
            description: item.description || '',
            minStock: 10,
            maxStock: 100,
            unit: item.areaUnit || 'piece',
            supplier: 'External',
            brand: 'Store',
            isFeatured: false,
            isNew: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            // Tax fields from inventory API
            taxRate: item.tax_rate || item.taxRate || item.vat_rate || 0, // Get tax rate from API, default to 0 (no tax)
            taxExempt: item.tax_exempt || item.taxExempt || false,
            taxCategory: item.tax_category || item.taxCategory || 'standard'
          }))
          
          // Log transformed products to verify cost is included
          console.log('=== TRANSFORMED PRODUCTS ===')
          console.log('Total products after transformation:', products.length)
          if (products.length > 0) {
            console.log('Sample transformed products (first 3):')
            products.slice(0, 3).forEach((product: any, index: number) => {
              console.log(`Product ${index + 1}:`, {
                id: product.id,
                name: product.name,
                price: product.price,
                cost: product.cost,
                category: product.category,
                stock: product.stock
              })
            })
          }
          
          set({ products })
          
          // Load services
          try {
            const servicesResponse = await fetch('/api/services')
            if (servicesResponse.ok) {
              const servicesData = await servicesResponse.json()
              const services = servicesData.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description || '',
                price: item.price || 0,
                unit: item.unit || 'service',
                category: item.category || 'Services',
                active: item.active !== false,
                duration: item.duration || 60
              }))
              set({ services })
            }
          } catch (error) {
            console.warn('Failed to load services data:', error)
          }
          
          get().generateAlerts()
        } catch (error) {
          console.warn('Failed to load initial data:', error)
        }
      },

      loadCategories: async () => {
        try {
          const response = await fetch('/api/categories')
          if (!response.ok) {
            console.warn('Failed to fetch categories, using mock data')
            return
          }
          
          const apiData = await response.json()
          
          // Transform API data to Category format
          const categories = apiData.data.map((item: any, index: number) => ({
            id: item.id,
            name: item.name,
            description: item.description || `${item.name} products`,
            icon: getCategoryIcon(item.name),
            parentId: item.parent_id,
            isActive: true,
            order: index + 1
          }))
          
          // Build category UUID to name mapping
          const categoryMap: Record<string, string> = {}
          categories.forEach(category => {
            categoryMap[category.id] = category.name
          })
          
          set({ categories, categoryMap })
        } catch (error) {
          console.warn('Failed to load categories:', error)
        }
      },

      // Enhanced Search and Filter Actions
      setFilters: (newFilters: Partial<ProductFilter>) => {
        const { filters } = get()
        const updatedFilters = { ...filters, ...newFilters }
        set({ filters: updatedFilters })
        
        // Update filter chips
        const chips = get().getFilterChips()
        set({ activeFilterChips: chips })
      },

      setSortBy: (sortBy: SortOption) => {
        set({ sortBy })
      },

      toggleFilterSidebar: () => {
        const { isFilterSidebarOpen } = get()
        set({ isFilterSidebarOpen: !isFilterSidebarOpen })
      },

      clearAllFilters: () => {
        set({
          filters: {
            categories: [],
            priceRange: null,
            customPriceRange: null,
            stockStatus: [],
            brands: [],
            tags: [],
            suppliers: []
          },
          activeFilterChips: [],
          searchTerm: "",
          selectedCategory: "All"
        })
      },

      removeFilter: (chipId: string) => {
        const { filters, activeFilterChips } = get()
        const chip = activeFilterChips.find(c => c.id === chipId)
        
        if (!chip) return
        
        const updatedFilters = { ...filters }
        
        switch (chip.type) {
          case 'category':
            updatedFilters.categories = updatedFilters.categories.filter(c => c !== chip.value)
            break
          case 'price':
            updatedFilters.priceRange = null
            updatedFilters.customPriceRange = null
            break
          case 'stock':
            updatedFilters.stockStatus = updatedFilters.stockStatus.filter(s => s !== chip.value)
            break
          case 'brand':
            updatedFilters.brands = updatedFilters.brands.filter(b => b !== chip.value)
            break
          case 'tag':
            updatedFilters.tags = updatedFilters.tags.filter(t => t !== chip.value)
            break
          case 'supplier':
            updatedFilters.suppliers = updatedFilters.suppliers.filter(s => s !== chip.value)
            break
        }
        
        set({ 
          filters: updatedFilters,
          activeFilterChips: activeFilterChips.filter(c => c.id !== chipId)
        })
      },

      getAdvancedFilteredProducts: () => {
        const { products, filters, searchTerm, sortBy } = get()
        let filtered = [...products]
        
        // Enhanced text search with fuzzy matching and scoring
        if (searchTerm) {
          const searchResults = get().getFuzzySearchResults(searchTerm)
          filtered = filtered.filter(product => 
            searchResults.some(result => result.id === product.id)
          )
          
          // Sort by search relevance if we have a search term
          if (searchTerm.trim()) {
            filtered.sort((a, b) => {
              const scoreA = get().calculateSearchScore(a, searchTerm.toLowerCase())
              const scoreB = get().calculateSearchScore(b, searchTerm.toLowerCase())
              return scoreB - scoreA
            })
          }
        }
        
        // Category filter
        if (filters.categories.length > 0) {
          filtered = filtered.filter(product => 
            filters.categories.includes(product.category)
          )
        }
        
        // Price range filter
        if (filters.priceRange) {
          filtered = filtered.filter(product => 
            product.price >= filters.priceRange!.min && 
            product.price <= filters.priceRange!.max
          )
        }
        
        if (filters.customPriceRange) {
          filtered = filtered.filter(product => 
            product.price >= filters.customPriceRange!.min && 
            product.price <= filters.customPriceRange!.max
          )
        }
        
        // Stock status filter
        if (filters.stockStatus.length > 0) {
          filtered = filtered.filter(product => {
            const isInStock = product.stock > (product.minStock || 0)
            const isLowStock = product.stock > 0 && product.stock <= (product.minStock || 0)
            const isOutOfStock = product.stock === 0
            
            return filters.stockStatus.some(status => {
              switch (status) {
                case 'in_stock': return isInStock
                case 'low_stock': return isLowStock
                case 'out_of_stock': return isOutOfStock
                default: return false
              }
            })
          })
        }
        
        // Brand filter
        if (filters.brands.length > 0) {
          filtered = filtered.filter(product => 
            product.brand && filters.brands.includes(product.brand)
          )
        }
        
        // Tags filter (new, featured)
        if (filters.tags.length > 0) {
          filtered = filtered.filter(product => {
            return filters.tags.some(tag => {
              switch (tag) {
                case 'new': return product.isNew
                case 'featured': return product.isFeatured
                default: return false
              }
            })
          })
        }
        
        // Supplier filter
        if (filters.suppliers.length > 0) {
          filtered = filtered.filter(product => 
            product.supplier && filters.suppliers.includes(product.supplier)
          )
        }
        
        // Sort results
        filtered.sort((a, b) => {
          let aValue: any, bValue: any
          
          switch (sortBy.field) {
            case 'name':
              aValue = a.name.toLowerCase()
              bValue = b.name.toLowerCase()
              break
            case 'price':
              aValue = a.price
              bValue = b.price
              break
            case 'stock':
              aValue = a.stock
              bValue = b.stock
              break
            case 'category':
              aValue = a.category.toLowerCase()
              bValue = b.category.toLowerCase()
              break
            case 'created':
              aValue = a.createdAt?.getTime() || 0
              bValue = b.createdAt?.getTime() || 0
              break
            case 'updated':
              aValue = a.updatedAt?.getTime() || 0
              bValue = b.updatedAt?.getTime() || 0
              break
            default:
              return 0
          }
          
          if (aValue < bValue) return sortBy.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return sortBy.direction === 'asc' ? 1 : -1
          return 0
        })
        
        return filtered
      },

      getFilterChips: (): FilterChip[] => {
        const { filters } = get()
        const chips: FilterChip[] = []
        
        // Category chips
        filters.categories.forEach(category => {
          chips.push({
            id: `category-${category}`,
            label: category,
            type: 'category',
            value: category,
            removable: true
          })
        })
        
        // Price range chip
        if (filters.priceRange) {
          chips.push({
            id: 'price-range',
            label: filters.priceRange.label,
            type: 'price',
            value: filters.priceRange,
            removable: true
          })
        }
        
        if (filters.customPriceRange) {
          chips.push({
            id: 'custom-price-range',
            label: `$${filters.customPriceRange.min} - $${filters.customPriceRange.max}`,
            type: 'price',
            value: filters.customPriceRange,
            removable: true
          })
        }
        
        // Stock status chips
        filters.stockStatus.forEach(status => {
          const labels = {
            'in_stock': 'In Stock',
            'low_stock': 'Low Stock',
            'out_of_stock': 'Out of Stock'
          }
          chips.push({
            id: `stock-${status}`,
            label: labels[status],
            type: 'stock',
            value: status,
            removable: true
          })
        })
        
        // Brand chips
        filters.brands.forEach(brand => {
          chips.push({
            id: `brand-${brand}`,
            label: brand,
            type: 'brand',
            value: brand,
            removable: true
          })
        })
        
        // Tag chips
        filters.tags.forEach(tag => {
          const labels = {
            'new': 'New',
            'featured': 'Featured'
          }
          chips.push({
            id: `tag-${tag}`,
            label: labels[tag],
            type: 'tag',
            value: tag,
            removable: true
          })
        })
        
        // Supplier chips
        filters.suppliers.forEach(supplier => {
          chips.push({
            id: `supplier-${supplier}`,
            label: supplier,
            type: 'supplier',
            value: supplier,
            removable: true
          })
        })
        
        return chips
      },

      getAvailableBrands: () => {
        const { products } = get()
        const brands = new Set<string>()
        products.forEach(product => {
          if (product.brand) brands.add(product.brand)
        })
        return Array.from(brands).sort()
      },

      getAvailableSuppliers: () => {
        const { products } = get()
        const suppliers = new Set<string>()
        products.forEach(product => {
          if (product.supplier) suppliers.add(product.supplier)
        })
        return Array.from(suppliers).sort()
      },

      getPredefinedPriceRanges: (): PriceRange[] => [
        { min: 0, max: 5, label: 'Under $5' },
        { min: 5, max: 10, label: '$5 - $10' },
        { min: 10, max: 20, label: '$10 - $20' },
        { min: 20, max: 50, label: '$20 - $50' },
        { min: 50, max: Infinity, label: 'Over $50' }
      ],

      getResultsCount: () => {
        return get().getAdvancedFilteredProducts().length
      },

      getActiveFilterCount: () => {
        return get().activeFilterChips.length
      },

      // Search suggestions and history methods
      getSearchSuggestions: (query: string): SearchSuggestion[] => {
        const { products, categories, searchHistory } = get()
        const suggestions: SearchSuggestion[] = []
        const queryLower = query.toLowerCase().trim()
        
        if (queryLower === '') {
          // Show recent searches when no query
          searchHistory.recentSearches.slice(0, 5).forEach((term, index) => {
            suggestions.push({
              id: `recent-${index}`,
              type: 'recent',
              value: term,
              label: term
            })
          })
          
          // Show trending searches
          searchHistory.trendingSearches.slice(0, 3).forEach((item, index) => {
            suggestions.push({
              id: `trending-${index}`,
              type: 'trending',
              value: item.term,
              label: item.term
            })
          })
          
          return suggestions
        }
        
        // Product suggestions with fuzzy matching and scoring
        const productSuggestions = products
          .map(product => ({
            product,
            score: get().calculateSearchScore(product, queryLower)
          }))
          .filter(item => item.score > 0.1)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map((item, index) => ({
            id: `product-${item.product.id}`,
            type: 'product' as const,
            value: item.product.name,
            label: item.product.name,
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              stock: item.product.stock,
              image: item.product.image
            },
            score: item.score
          }))
        
        suggestions.push(...productSuggestions)
        
        // Category suggestions
        const categoryMatches = categories
          .filter(category => 
            category.name.toLowerCase().includes(queryLower)
          )
          .slice(0, 3)
          .map(category => ({
            id: `category-${category.id}`,
            type: 'category' as const,
            value: category.name,
            label: category.name
          }))
        
        suggestions.push(...categoryMatches)
        
        // Brand suggestions
        const brands = Array.from(new Set(
          products
            .filter(p => p.brand && p.brand.toLowerCase().includes(queryLower))
            .map(p => p.brand!)
        )).slice(0, 3)
        
        brands.forEach(brand => {
          suggestions.push({
            id: `brand-${brand}`,
            type: 'brand',
            value: brand,
            label: brand
          })
        })
        
        // SKU suggestions
        const skuMatches = products
          .filter(p => p.sku && p.sku.toLowerCase().includes(queryLower))
          .slice(0, 2)
          .map(product => ({
            id: `sku-${product.id}`,
            type: 'sku' as const,
            value: product.sku!,
            label: `${product.sku} - ${product.name}`
          }))
        
        suggestions.push(...skuMatches)
        
        return suggestions.slice(0, 10)
      },

      addRecentSearch: (term: string) => {
        const { searchHistory } = get()
        const trimmedTerm = term.trim()
        
        if (!trimmedTerm || trimmedTerm.length < 2) return
        
        const newRecentSearches = [
          trimmedTerm,
          ...searchHistory.recentSearches.filter(s => s !== trimmedTerm)
        ].slice(0, 10) // Keep only last 10
        
        // Update search count for trending
        const newSearchCount = {
          ...searchHistory.searchCount,
          [trimmedTerm]: (searchHistory.searchCount[trimmedTerm] || 0) + 1
        }
        
        // Update trending searches
        const trendingSearches = Object.entries(newSearchCount)
          .map(([term, count]) => ({ term, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        
        set({
          searchHistory: {
            recentSearches: newRecentSearches,
            trendingSearches,
            searchCount: newSearchCount
          }
        })
      },

      clearRecentSearches: () => {
        const { searchHistory } = get()
        set({
          searchHistory: {
            ...searchHistory,
            recentSearches: []
          }
        })
      },

      getFuzzySearchResults: (query: string): Product[] => {
        const { products } = get()
        const queryLower = query.toLowerCase().trim()
        
        if (!queryLower) return []
        
        return products
          .map(product => ({
            product,
            score: get().calculateSearchScore(product, queryLower)
          }))
          .filter(item => item.score > 0.1)
          .sort((a, b) => b.score - a.score)
          .map(item => item.product)
      },

      calculateSearchScore: (product: Product, query: string): number => {
        const queryLower = query.toLowerCase()
        let score = 0
        
        // Exact name match (highest priority)
        if (product.name.toLowerCase() === queryLower) {
          score += 1.0
        }
        // Name starts with query
        else if (product.name.toLowerCase().startsWith(queryLower)) {
          score += 0.8
        }
        // Name contains query
        else if (product.name.toLowerCase().includes(queryLower)) {
          score += 0.6
        }
        
        // SKU matches
        if (product.sku) {
          if (product.sku.toLowerCase() === queryLower) {
            score += 0.9
          } else if (product.sku.toLowerCase().includes(queryLower)) {
            score += 0.7
          }
        }
        
        // Barcode matches
        if (product.barcode && product.barcode.includes(query)) {
          score += 0.9
        }
        
        // Brand matches
        if (product.brand) {
          if (product.brand.toLowerCase() === queryLower) {
            score += 0.5
          } else if (product.brand.toLowerCase().includes(queryLower)) {
            score += 0.3
          }
        }
        
        // Category matches
        if (product.category.toLowerCase().includes(queryLower)) {
          score += 0.4
        }
        
        // Description matches
        if (product.description && product.description.toLowerCase().includes(queryLower)) {
          score += 0.2
        }
        
        // Boost for featured/new products
        if (product.isFeatured) score *= 1.1
        if (product.isNew) score *= 1.05
        
        // Reduce score for out of stock items
        if (product.stock === 0) score *= 0.8
        
        return Math.min(score, 1.0) // Cap at 1.0
      }
    }),
    {
      name: 'inventory-storage-v3', // Force fresh start after fixing main-sales-screen-simple.tsx
      partialize: (state) => ({
        products: state.products,
        services: state.services,
        categories: state.categories,
        categoryMap: state.categoryMap,
        selectedCategory: state.selectedCategory,
        searchTerm: state.searchTerm,
        autoRefreshEnabled: state.autoRefreshEnabled,
        autoRefreshInterval: state.autoRefreshInterval,
        filters: state.filters,
        sortBy: state.sortBy,
        isFilterSidebarOpen: state.isFilterSidebarOpen,
        searchHistory: state.searchHistory
      })
    }
  )
)