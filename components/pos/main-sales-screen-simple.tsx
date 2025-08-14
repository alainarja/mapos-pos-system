"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SoundButton } from "@/components/ui/sound-button"
import { useSound } from "@/hooks/use-sound"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Camera,
  LogOut,
  Minus,
  X,
  CreditCard,
  User,
  ArrowLeft,
  DollarSign,
  Printer,
  BarChart3,
  History,
  Tag,
  Archive,
  Percent,
  Pause,
  RotateCcw,
  AlertTriangle,
  Monitor,
  Settings,
  DoorOpen,
  Volume2,
  VolumeX,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCartStore } from "@/stores/cart"
import { useInventoryStore } from "@/stores/inventory"
import { useNotificationStore } from "@/stores/notifications"
import { CouponInput } from "@/components/pos/coupon-input"
import { ReturnsExchange } from "@/components/pos/returns-exchange"
import { ReturnsIntegrationProvider } from "@/components/pos/returns-integration"

interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  stock: number
  barcode?: string
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface MainSalesScreenProps {
  user: string
  onLogout: () => void
}

export function MainSalesScreen({ user, onLogout }: MainSalesScreenProps) {
  const { playSuccess, playError, playSpecial, playBeep, isEnabled, volume, setEnabled, setVolume } = useSound()
  
  // Use Zustand stores
  const {
    items: cart,
    subtotal,
    tax,
    total,
    totalSavings,
    appliedCoupons,
    couponValidationError,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCartStore()
  
  const { unreadCount, addNotification } = useNotificationStore()
  
  const {
    products: mockProducts,
    categories,
    selectedCategory,
    searchTerm,
    setSelectedCategory,
    setSearchTerm,
    getFilteredProducts,
    getProductByBarcode,
  } = useInventoryStore()
  
  const [showCategorySelection, setShowCategorySelection] = useState(true)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showDiscountDialog, setShowDiscountDialog] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showCashManagement, setShowCashManagement] = useState(false)
  const [showPrintMenu, setShowPrintMenu] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showCouponManagement, setShowCouponManagement] = useState(false)
  const [showReturnsExchange, setShowReturnsExchange] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [showProductFilter, setShowProductFilter] = useState(false)
  const [filterCategory, setFilterCategory] = useState("All")
  const [filterMinPrice, setFilterMinPrice] = useState("")
  const [filterMaxPrice, setFilterMaxPrice] = useState("")
  const [filterInStock, setFilterInStock] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [appliedReferral, setAppliedReferral] = useState<string | null>(null)
  const [lastTransaction, setLastTransaction] = useState<any>(null)
  const [transactionHistory, setTransactionHistory] = useState<any[]>([])
  const [heldCarts, setHeldCarts] = useState<any[]>([])
  const [showHeldCarts, setShowHeldCarts] = useState(false)
  const [showQuickKeys, setShowQuickKeys] = useState(true)
  const [quickKeyProducts, setQuickKeyProducts] = useState<Product[]>([])
  const [amountTendered, setAmountTendered] = useState('')
  const [showCashCalculator, setShowCashCalculator] = useState(false)
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const [voidItemId, setVoidItemId] = useState<string | null>(null)
  const [showManagerApproval, setShowManagerApproval] = useState(false)
  const [managerPassword, setManagerPassword] = useState('')
  const [voidReason, setVoidReason] = useState('')
  const [isTrainingMode, setIsTrainingMode] = useState(false)
  const [showTrainingDialog, setShowTrainingDialog] = useState(false)
  const [showPriceOverride, setShowPriceOverride] = useState(false)
  const [priceOverrideItemId, setPriceOverrideItemId] = useState<string | null>(null)
  const [overridePrice, setOverridePrice] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [showManagerApprovalForPrice, setShowManagerApprovalForPrice] = useState(false)
  const [managerPasswordForPrice, setManagerPasswordForPrice] = useState('')
  const [showCustomerDisplay, setShowCustomerDisplay] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [searchMode, setSearchMode] = useState<'name' | 'barcode' | 'sku' | 'all'>('all')
  const [fuzzySearchEnabled, setFuzzySearchEnabled] = useState(true)
  const [showOpenDrawer, setShowOpenDrawer] = useState(false)
  const [drawerReason, setDrawerReason] = useState('')
  const [showDrawerApproval, setShowDrawerApproval] = useState(false)
  const [drawerManagerPassword, setDrawerManagerPassword] = useState('')

  const addToCart = (product: Product) => {
    addItem(product)
    
    // Play special sound for adding to cart
    playSpecial()
    
  }

  const removeFromCart = (id: string) => {
    removeItem(id)
  }

  // Fuzzy search algorithm
  const fuzzySearch = (query: string, text: string): number => {
    if (query === text) return 1
    if (query.length === 0) return 1
    if (text.length === 0) return 0
    
    const queryLower = query.toLowerCase()
    const textLower = text.toLowerCase()
    
    // Exact match gets highest score
    if (textLower.includes(queryLower)) {
      return 0.8 + (queryLower.length / textLower.length) * 0.2
    }
    
    // Character matching score
    let matches = 0
    let queryIndex = 0
    
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        matches++
        queryIndex++
      }
    }
    
    return matches / Math.max(queryLower.length, textLower.length)
  }

  // Advanced search function
  const getAdvancedFilteredProducts = () => {
    let products = mockProducts
    const query = searchTerm.toLowerCase().trim()
    
    if (query) {
      products = products.filter(product => {
        const searchTargets = []
        
        // Determine what to search based on mode
        switch (searchMode) {
          case 'name':
            searchTargets.push(product.name.toLowerCase())
            break
          case 'barcode':
            if (product.barcode) searchTargets.push(product.barcode.toLowerCase())
            break
          case 'sku':
            searchTargets.push(product.id.toLowerCase()) // Use ID as SKU
            break
          case 'all':
          default:
            searchTargets.push(
              product.name.toLowerCase(),
              product.category.toLowerCase(),
              product.id.toLowerCase()
            )
            if (product.barcode) searchTargets.push(product.barcode.toLowerCase())
            break
        }
        
        // Apply search
        if (fuzzySearchEnabled) {
          return searchTargets.some(target => fuzzySearch(query, target) > 0.3)
        } else {
          return searchTargets.some(target => target.includes(query))
        }
      })
      
      // Sort by relevance if using fuzzy search
      if (fuzzySearchEnabled) {
        products.sort((a, b) => {
          const aScore = Math.max(
            fuzzySearch(query, a.name.toLowerCase()),
            fuzzySearch(query, a.category.toLowerCase()),
            fuzzySearch(query, a.id.toLowerCase()),
            a.barcode ? fuzzySearch(query, a.barcode.toLowerCase()) : 0
          )
          const bScore = Math.max(
            fuzzySearch(query, b.name.toLowerCase()),
            fuzzySearch(query, b.category.toLowerCase()),
            fuzzySearch(query, b.id.toLowerCase()),
            b.barcode ? fuzzySearch(query, b.barcode.toLowerCase()) : 0
          )
          return bScore - aScore
        })
      }
    }
    
    // Apply category filter
    if (selectedCategory !== "All" && selectedCategory) {
      products = products.filter(p => p.category === selectedCategory)
    }
    
    // Apply additional filters
    if (filterCategory !== "All") {
      products = products.filter(p => p.category === filterCategory)
    }
    
    // Apply price range filter
    if (filterMinPrice) {
      products = products.filter(p => p.price >= parseFloat(filterMinPrice))
    }
    if (filterMaxPrice) {
      products = products.filter(p => p.price <= parseFloat(filterMaxPrice))
    }
    
    // Apply stock filter
    if (filterInStock) {
      products = products.filter(p => p.stock > 0)
    }
    
    return products
  }

  // Enhanced filtering with additional criteria
  const getEnhancedFilteredProducts = () => {
    return getAdvancedFilteredProducts()
  }

  const filteredProducts = getEnhancedFilteredProducts()

  // Initialize Quick Keys with popular products
  useEffect(() => {
    const popularProducts = mockProducts.slice(0, 8) // Get first 8 products as quick keys
    setQuickKeyProducts(popularProducts)
  }, [mockProducts])

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Product filter
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setShowProductFilter(true)
      }
      // Advanced search
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey) && e.key === 'F') {
        e.preventDefault()
        setShowAdvancedSearch(true)
      }
      // Quick Keys toggle
      if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault()
        setShowQuickKeys(!showQuickKeys)
      }
      // Cash Calculator
      if (e.key === 'F8' && cart.length > 0) {
        e.preventDefault()
        setShowCashCalculator(true)
        setShowPaymentDialog(true)
      }
      // Customer Display View
      if (e.key === 'F9') {
        e.preventDefault()
        setShowCustomerDisplay(true)
      }
      // Close Customer Display View
      if (e.key === 'Escape' && showCustomerDisplay) {
        e.preventDefault()
        setShowCustomerDisplay(false)
      }
      // Clear Cart
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        clearCart()
      }
      // Hold Cart
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && cart.length > 0) {
        e.preventDefault()
        // Hold cart functionality
        const holdCart = {
          id: Date.now().toString(),
          timestamp: new Date(),
          items: cart,
          subtotal,
          discount: totalSavings,
          tax,
          total,
          referral: appliedReferral,
          coupons: appliedCoupons,
          name: `Cart ${heldCarts.length + 1}`
        }
        setHeldCarts(prev => [...prev, holdCart])
        clearCart()
        playSuccess()
      }
      // Open Cash Drawer
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        setShowOpenDrawer(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showQuickKeys, cart.length, cart, subtotal, tax, total, totalSavings, appliedReferral, appliedCoupons, heldCarts.length, showCustomerDisplay])

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcodeInput.trim()) {
      const product = getProductByBarcode(barcodeInput.trim())
      if (product) {
        addToCart(product) // addToCart already plays special sound
        setBarcodeInput("")
        playBeep() // Additional beep for successful barcode scan
      } else {
        // Play error sound for invalid barcode
        playError()
        
      }
    }
  }

  const startScanning = () => {
    setIsScanning(true)
    setTimeout(() => {
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)]
      addToCart(randomProduct)
      setIsScanning(false)
    }, 2000)
  }

  const handleApplyCoupon = async (couponCode: string) => {
    const success = await applyCoupon(couponCode)
    if (success) {
      playSuccess()
    } else {
      playError()
    }
  }

  const handleRemoveCoupon = (couponId: string) => {
    removeCoupon(couponId)
    playSuccess()
  }

  const printReceipt = (transaction: any) => {
    const receiptWindow = window.open('', '_blank', 'width=400,height=600')
    if (receiptWindow) {
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { font-family: 'Courier New', monospace; padding: 20px; }
              h2 { text-align: center; }
              .divider { border-top: 1px dashed #333; margin: 10px 0; }
              .item { display: flex; justify-between; margin: 5px 0; }
              .total { font-weight: bold; font-size: 1.2em; }
            </style>
          </head>
          <body>
            <h2>MAPOS</h2>
            <p style="text-align: center;">Transaction #${transaction.id}</p>
            <p style="text-align: center;">${new Date(transaction.timestamp).toLocaleString()}</p>
            <div class="divider"></div>
            ${transaction.items.map((item: any) => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="item">
              <span>Subtotal:</span>
              <span>$${transaction.subtotal.toFixed(2)}</span>
            </div>
            ${transaction.discount > 0 ? `
              <div class="item">
                <span>Discount:</span>
                <span>-$${transaction.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="item">
              <span>Tax:</span>
              <span>$${transaction.tax.toFixed(2)}</span>
            </div>
            <div class="divider"></div>
            <div class="item total">
              <span>Total:</span>
              <span>$${transaction.total.toFixed(2)}</span>
            </div>
            <div class="divider"></div>
            <p style="text-align: center;">Payment: ${transaction.paymentMethod}</p>
            ${transaction.referral ? `<p style="text-align: center;">Referral: ${transaction.referral}</p>` : ''}
            <p style="text-align: center; margin-top: 20px;">Thank you for your purchase!</p>
          </body>
        </html>
      `)
      receiptWindow.document.close()
      receiptWindow.print()
    }
  }

  const completeSale = async (paymentMethod: string) => {
    // Play success sound
    playSuccess()
    
    // In training mode, show different behavior
    if (isTrainingMode) {
      // Show training mode success notification
      setTimeout(() => {
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: '🎓 Training Mode - Sale Simulated',
          message: `Practice sale of $${total.toFixed(2)} with ${paymentMethod}`,
          timestamp: new Date(),
          isRead: false
        })
        
        // Reset everything
        clearCart()
        setShowPaymentDialog(false)
        setReferralCode('')
        setAppliedReferral(null)
        setShowCashCalculator(false)
        setAmountTendered('')
      }, 500)
      return
    }
    
    // Create transaction record
    const transaction = {
      id: Date.now().toString(),
      timestamp: new Date(),
      items: cart,
      subtotal,
      discount: totalSavings,
      tax,
      total,
      paymentMethod,
      referral: appliedReferral,
      coupons: appliedCoupons
    }
    
    // Save transaction
    setLastTransaction(transaction)
    setTransactionHistory(prev => [transaction, ...prev])
    
    // Print receipt
    printReceipt(transaction)
    
    // Show success feedback
    setTimeout(() => {
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Payment Successful',
        message: `Payment of $${total.toFixed(2)} completed with ${paymentMethod}`,
        timestamp: new Date(),
        isRead: false
      })
      
      // Reset everything
      clearCart()
      setShowPaymentDialog(false)
      setReferralCode('')
      setAppliedReferral(null)
    }, 500)
  }

  // Void/Cancel functionality
  const initiateVoid = (itemId: string) => {
    setVoidItemId(itemId)
    setShowVoidDialog(true)
  }

  const requestManagerApproval = () => {
    setShowVoidDialog(false)
    setShowManagerApproval(true)
  }

  const validateManagerApproval = () => {
    // Simple manager password validation (in real app, this would be more secure)
    if (managerPassword === 'manager123') {
      performVoid()
      setShowManagerApproval(false)
      setManagerPassword('')
      setVoidReason('')
      setVoidItemId(null)
    } else {
      playError()
      // Show error feedback
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Access Denied',
        message: 'Invalid manager password',
        timestamp: new Date(),
        isRead: false
      })
    }
  }

  const performVoid = () => {
    if (voidItemId) {
      // Remove item from cart
      const itemToVoid = cart.find(item => item.id === voidItemId)
      if (itemToVoid) {
        removeItem(voidItemId)
        playSuccess()
        
        if (!isTrainingMode) {
          // Log void transaction (only in live mode)
          const voidTransaction = {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: 'VOID',
            item: itemToVoid,
            reason: voidReason,
            approvedBy: 'Manager',
          }
          
          setTransactionHistory(prev => [voidTransaction, ...prev])
        }
        
        // Show success notification
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: isTrainingMode ? '🎓 Training Mode - Item Voided' : 'Item Voided',
          message: `${itemToVoid.name} has been voided ${isTrainingMode ? '(Practice)' : ''}`,
          timestamp: new Date(),
          isRead: false
        })
      }
    }
  }

  // Training Mode functions
  const toggleTrainingMode = () => {
    setShowTrainingDialog(true)
  }

  const enableTrainingMode = () => {
    setIsTrainingMode(true)
    setShowTrainingDialog(false)
    clearCart() // Clear any existing cart items
    
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: '🎓 Training Mode Enabled',
      message: 'Safe practice mode - no real transactions will be processed',
      timestamp: new Date(),
      isRead: false
    })
  }

  const disableTrainingMode = () => {
    setIsTrainingMode(false)
    setShowTrainingDialog(false)
    clearCart() // Clear any training cart items
    
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: '💼 Live Mode Enabled',
      message: 'Live transactions are now active',
      timestamp: new Date(),
      isRead: false
    })
  }

  // Price Override functionality
  const initiatePriceOverride = (itemId: string) => {
    const item = cart.find(item => item.id === itemId)
    if (item) {
      setPriceOverrideItemId(itemId)
      setOverridePrice(item.price.toString())
      setShowPriceOverride(true)
    }
  }

  const requestManagerApprovalForPrice = () => {
    setShowPriceOverride(false)
    setShowManagerApprovalForPrice(true)
  }

  const validateManagerApprovalForPrice = () => {
    if (managerPasswordForPrice === 'manager123') {
      performPriceOverride()
      setShowManagerApprovalForPrice(false)
      setManagerPasswordForPrice('')
      setOverrideReason('')
      setOverridePrice('')
      setPriceOverrideItemId(null)
    } else {
      playError()
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Access Denied',
        message: 'Invalid manager password',
        timestamp: new Date(),
        isRead: false
      })
    }
  }

  // Open Cash Drawer Functions
  const requestDrawerOpen = () => {
    if (!drawerReason.trim()) {
      playError()
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Reason Required',
        message: 'Please provide a reason for opening the cash drawer',
        timestamp: new Date(),
        isRead: false
      })
      return
    }
    setShowDrawerApproval(true)
  }

  const validateDrawerApproval = () => {
    if (drawerManagerPassword === 'manager123') {
      performDrawerOpen()
      setShowDrawerApproval(false)
      setDrawerManagerPassword('')
      setDrawerReason('')
      setShowOpenDrawer(false)
    } else {
      playError()
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Access Denied',
        message: 'Invalid manager password',
        timestamp: new Date(),
        isRead: false
      })
    }
  }

  const performDrawerOpen = () => {
    // Simulate cash drawer opening
    playSpecial()
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Cash Drawer Opened',
      message: `Drawer opened for: ${drawerReason}`,
      timestamp: new Date(),
      isRead: false
    })
    
    // Log the action for audit trail
    console.log('Cash drawer opened:', {
      reason: drawerReason,
      user: user,
      timestamp: new Date(),
      type: 'non-sale'
    })
  }

  const cancelDrawerOpen = () => {
    setShowOpenDrawer(false)
    setShowDrawerApproval(false)
    setDrawerReason('')
    setDrawerManagerPassword('')
  }

  const performPriceOverride = () => {
    if (priceOverrideItemId && overridePrice) {
      const newPrice = parseFloat(overridePrice)
      if (isNaN(newPrice) || newPrice < 0) {
        playError()
        return
      }

      // Update item price by removing and re-adding with new price
      const itemToUpdate = cart.find(item => item.id === priceOverrideItemId)
      if (itemToUpdate) {
        removeItem(priceOverrideItemId)
        const updatedItem = { ...itemToUpdate, price: newPrice }
        addItem(updatedItem)
      }
      playSuccess()
      
      if (!isTrainingMode) {
        // Log price override transaction
        const priceOverrideTransaction = {
          id: Date.now().toString(),
          timestamp: new Date(),
          type: 'PRICE_OVERRIDE',
          itemId: priceOverrideItemId,
          originalPrice: cart.find(item => item.id === priceOverrideItemId)?.price || 0,
          newPrice: newPrice,
          reason: overrideReason,
          approvedBy: 'Manager',
        }
        
        setTransactionHistory(prev => [priceOverrideTransaction, ...prev])
      }
      
      // Show success notification
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: isTrainingMode ? '🎓 Training Mode - Price Override' : 'Price Override Applied',
        message: `Price updated to $${newPrice.toFixed(2)} ${isTrainingMode ? '(Practice)' : ''}`,
        timestamp: new Date(),
        isRead: false
      })
    }
  }

  const cancelPriceOverride = () => {
    setShowPriceOverride(false)
    setShowManagerApprovalForPrice(false)
    setPriceOverrideItemId(null)
    setOverridePrice('')
    setOverrideReason('')
    setManagerPasswordForPrice('')
  }

  const cancelVoid = () => {
    setShowVoidDialog(false)
    setShowManagerApproval(false)
    setVoidItemId(null)
    setVoidReason('')
    setManagerPassword('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 text-slate-900">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
      `}</style>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-purple-100 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Image
                src="/images/mapos-logo.png"
                alt="MAPOS"
                width={48}
                height={48}
                className="drop-shadow-lg transform group-hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>

          {/* Center - Store Name */}
          <div className="flex items-center gap-4">
            <div className="px-8 py-3 rounded-xl font-bruno-ace text-xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 text-white">
              MAPOS
            </div>
          </div>

          {/* Right - Actions and User */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCashManagement(true)}
              className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-110 transition-all duration-300"
              title="Cash Management"
            >
              <DollarSign className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOpenDrawer(true)}
              className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:scale-110 transition-all duration-300"
              title="Open Cash Drawer (Ctrl+D)"
            >
              <DoorOpen className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrintMenu(true)}
              className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-300"
              title="Print Menu"
            >
              <Printer className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-110 transition-all duration-300"
              title="Sales History"
            >
              <History className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReturnsExchange(true)}
              className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:scale-110 transition-all duration-300"
              title="Returns & Exchanges"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCouponManagement(true)}
              className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 hover:scale-110 transition-all duration-300"
              title="Coupon Management"
            >
              <Tag className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomerDisplay(true)}
              className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-110 transition-all duration-300"
              title="Customer Display View (F9)"
            >
              <Monitor className="h-5 w-5" />
            </Button>
            
            {/* Sound Controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEnabled(!isEnabled)}
              className={`w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110 ${
                isEnabled 
                  ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
              title={`Sound ${isEnabled ? 'On' : 'Off'} - Click to toggle`}
            >
              {isEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
              <Volume2 className="h-4 w-4 text-gray-600" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
              <span className="text-xs text-gray-600 font-medium min-w-[2rem]">
                {Math.round(volume * 100)}%
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50/80 border border-purple-200/60">
              <User className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">{user}</span>
            </div>
            
            <SoundButton
              variant="outline"
              size="sm"
              soundType="click"
              onClick={toggleTrainingMode}
              className={`h-10 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
                isTrainingMode 
                  ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200' 
                  : 'bg-blue-50/80 border-blue-200/60 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
              }`}
            >
              {isTrainingMode ? '🎓' : '📚'}
              <span className="hidden sm:inline">
                {isTrainingMode ? 'Training ON' : 'Training'}
              </span>
            </SoundButton>
            
            <SoundButton
              variant="outline"
              size="sm"
              soundType="click"
              onClick={() => {
                if (confirm(`Complete shift for ${user}? This will log you out and end your current session.`)) {
                  onLogout()
                }
              }}
              className="h-10 px-4 rounded-lg bg-red-50/80 border-red-200/60 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Complete Shift</span>
              <span className="sm:hidden">Logout</span>
            </SoundButton>
          </div>
        </div>
      </header>

      {/* Training Mode Banner */}
      {isTrainingMode && (
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-pulse">🎓</div>
            <span className="font-bold text-lg">TRAINING MODE ACTIVE</span>
            <div className="animate-pulse">📚</div>
          </div>
          <p className="text-sm opacity-90 mt-1">
            Safe practice environment - No real transactions will be processed
          </p>
        </div>
      )}

      <div className={`flex ${isTrainingMode ? 'h-[calc(100vh-148px)]' : 'h-[calc(100vh-88px)]'}`}>
        {/* Main Content */}
        <div className="flex-1 p-6">
          {showCategorySelection ? (
            <div className="max-w-4xl mx-auto">

              {/* Search Bar */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Welcome to MAPOS - Select Category
                </h1>
                <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <Input
                      placeholder="Scan or enter barcode..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleBarcodeSubmit(e)}
                      className="pl-10 h-11 rounded-lg border bg-white/80 backdrop-blur-sm border-purple-200 text-slate-900 placeholder:text-purple-400 focus:border-purple-400 font-medium transition-all duration-300"
                    />
                  </div>
                  <SoundButton
                    onClick={handleBarcodeSubmit}
                    soundType="beep"
                    className="h-11 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </SoundButton>
                  <SoundButton
                    onClick={startScanning}
                    disabled={isScanning}
                    soundType="beep"
                    className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isScanning ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                    ) : (
                      <Camera className="h-4 w-4 mr-1" />
                    )}
                    Scan
                  </SoundButton>
                </div>
              </div>

              {/* Quick Keys Panel */}
              {showQuickKeys && (
                <div className="mb-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-[0_8px_30px_rgba(139,92,246,0.1)] border border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800">Quick Keys</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowQuickKeys(false)}
                        className="h-8 w-8 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {quickKeyProducts.map((product, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-20 flex flex-col justify-center items-center p-2 text-xs border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
                          onClick={() => {
                            if (product) {
                              addToCart(product)
                              playSuccess()
                            }
                          }}
                        >
                          {product ? (
                            <>
                              <div className="font-bold truncate w-full text-center text-slate-800">
                                {product.name}
                              </div>
                              <div className="text-green-600 font-semibold">
                                ${product.price.toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-400">Empty Slot</div>
                          )}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Auto-populate with top selling items
                          const topProducts = mockProducts.slice(0, 8)
                          setQuickKeyProducts(topProducts)
                        }}
                        className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                      >
                        Auto-Fill Top Items
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Clear all quick keys
                          setQuickKeyProducts(new Array(8).fill(null))
                        }}
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Categories Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {categories.map((category, index) => (
                  <div
                    key={category.name}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setShowCategorySelection(false)
                    }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-[0_8px_30px_rgba(139,92,246,0.1)] hover:shadow-[0_15px_40px_rgba(139,92,246,0.2)] transition-shadow duration-300">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">
                          {category.icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-1 text-slate-800">{category.name}</h3>
                        <p className="text-purple-600 text-sm font-medium">
                          {mockProducts.filter(p => p.category === category.name).length} items
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* View All Products Button */}
              <div className="text-center">
                <Button
                  onClick={() => {
                    setSelectedCategory("All")
                    setShowCategorySelection(false)
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg text-base font-semibold"
                >
                  View All Products
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {/* Products Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setShowCategorySelection(true)}
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-300 border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Categories
                  </Button>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    {selectedCategory === "All" ? "All Products" : selectedCategory}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowProductFilter(true)}
                    variant="outline"
                    className="px-4 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-300 border-purple-200 text-purple-700 hover:bg-purple-50"
                    title="Press Ctrl+F to open filter"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Filter (Ctrl+F)
                  </Button>
                  <Button
                    onClick={() => setShowAdvancedSearch(true)}
                    variant="outline"
                    className="px-4 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-300 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    title="Press Ctrl+Shift+F for advanced search"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced (Ctrl+Shift+F)
                  </Button>
                </div>
                <div className="w-72">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 rounded-lg border bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 font-medium transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="cursor-pointer group"
                    onClick={() => addToCart(product)}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-[0_6px_20px_rgba(139,92,246,0.1)] hover:shadow-[0_12px_30px_rgba(139,92,246,0.2)] transition-all duration-300 hover:scale-105">
                      <CardContent className="p-3">
                        <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 relative">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                          {/* Status Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.isNew && (
                              <Badge className="text-xs px-2 py-1 bg-blue-500 text-white">
                                New
                              </Badge>
                            )}
                            {product.isFeatured && (
                              <Badge className="text-xs px-2 py-1 bg-purple-500 text-white">
                                Featured
                              </Badge>
                            )}
                            {product.discountPercentage && (
                              <Badge className="text-xs px-2 py-1 bg-red-500 text-white">
                                -{product.discountPercentage}%
                              </Badge>
                            )}
                          </div>
                          {/* Stock Badge */}
                          {product.stock <= 5 && product.stock > 0 && (
                            <div className="absolute bottom-2 right-2">
                              <Badge className="text-xs px-2 py-1 bg-amber-500 text-white animate-pulse">
                                Low Stock
                              </Badge>
                            </div>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute bottom-2 right-2">
                              <Badge className="text-xs px-2 py-1 bg-red-500 text-white">
                                Out of Stock
                              </Badge>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-slate-800">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                        )}
                        {product.sku && (
                          <p className="text-xs text-gray-400 font-mono mb-1">SKU: {product.sku}</p>
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            {product.discountPrice ? (
                              <div className="flex items-center gap-2">
                                <p className="text-purple-600 font-bold text-base">
                                  ${product.discountPrice.toFixed(2)}
                                </p>
                                <p className="text-gray-400 line-through text-sm">
                                  ${product.price.toFixed(2)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-purple-600 font-bold text-base">
                                ${product.price.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stock: {product.stock}
                          </div>
                        </div>
                        {product.unit && (
                          <p className="text-xs text-gray-500">Unit: {product.unit}</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 border-l bg-white/80 backdrop-blur-xl border-purple-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Cart
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (cart.length > 0) {
                    const holdCart = {
                      id: Date.now().toString(),
                      timestamp: new Date(),
                      items: cart,
                      subtotal,
                      discount: totalSavings,
                      tax,
                      total,
                      referral: appliedReferral,
                      coupons: appliedCoupons,
                      name: `Cart ${heldCarts.length + 1}`
                    }
                    setHeldCarts(prev => [...prev, holdCart])
                    clearCart()
                    setReferralCode('')
                    setAppliedReferral(null)
                    playSuccess()
                    addNotification({
                      id: Date.now().toString(),
                      type: 'success',
                      title: 'Cart Held',
                      message: `Cart saved as "${holdCart.name}"`,
                      timestamp: new Date(),
                      isRead: false
                    })
                  }
                }}
                disabled={cart.length === 0}
                className="text-xs px-2 py-1"
                title="Hold current cart"
              >
                <Pause className="h-3 w-3 mr-1" />
                Hold
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHeldCarts(true)}
                disabled={heldCarts.length === 0}
                className="text-xs px-2 py-1"
                title="Load held cart"
              >
                <Archive className="h-3 w-3 mr-1" />
                Load ({heldCarts.length})
              </Button>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 px-3 py-1 rounded-lg font-semibold animate-pulse"
              >
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </Badge>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
<p className="text-slate-500">Cart is empty</p>
              <p className="text-xs text-purple-500 mt-1">Add items to get started!</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 space-y-3 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-slate-800">
                          {item.name}
                        </h4>
                      </div>
                      <div className="flex gap-1">
                        <SoundButton
                          onClick={() => initiatePriceOverride(item.id)}
                          variant="ghost"
                          size="sm"
                          soundType="click"
                          className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg hover:scale-110 transition-all duration-300"
                          title="Price Override (Manager Approval Required)"
                        >
                          <DollarSign className="h-3 w-3" />
                        </SoundButton>
                        <SoundButton
                          onClick={() => initiateVoid(item.id)}
                          variant="ghost"
                          size="sm"
                          soundType="click"
                          className="h-6 w-6 p-0 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg hover:scale-110 transition-all duration-300"
                          title="Void Item (Manager Approval Required)"
                        >
                          <AlertTriangle className="h-3 w-3" />
                        </SoundButton>
                        <SoundButton
                          onClick={() => removeFromCart(item.id)}
                          variant="ghost"
                          size="sm"
                          soundType="click"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg hover:scale-110 transition-all duration-300"
                          title="Remove Item"
                        >
                          <X className="h-3 w-3" />
                        </SoundButton>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SoundButton
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          variant="outline"
                          size="sm"
                          soundType="click"
                          className="h-7 w-7 p-0 rounded-lg border-purple-200 hover:bg-purple-50 hover:scale-110 transition-all duration-300"
                        >
                          <Minus className="h-3 w-3" />
                        </SoundButton>
                        <span className="text-sm font-bold w-6 text-center text-slate-800">
                          {item.quantity}
                        </span>
                        <SoundButton
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          variant="outline"
                          size="sm"
                          soundType="click"
                          className="h-7 w-7 p-0 rounded-lg border-purple-200 hover:bg-purple-50 hover:scale-110 transition-all duration-300"
                        >
                          <Plus className="h-3 w-3" />
                        </SoundButton>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-purple-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4 -mx-6 px-6 pb-6 rounded-t-xl border-purple-200 bg-gradient-to-r from-purple-50/50 to-violet-50/50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="text-slate-800">${subtotal.toFixed(2)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-green-600">Discounts:</span>
                      <span className="text-green-600">-${totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedCoupons.length > 0 && (
                    <div className="space-y-1">
                      {appliedCoupons.map((coupon) => (
                        <div key={coupon.id} className="flex justify-between text-xs">
                          <span className="text-gray-500">{coupon.code}:</span>
                          <span className="text-green-600">-${coupon.discount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">Tax (8%):</span>
                    <span className="text-slate-800">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-purple-200">
                    <span className="text-slate-800">Total:</span>
                    <span className="text-purple-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon Input */}
                <div className="pt-4 border-t border-purple-200/30">
                  <CouponInput
                    onApplyCoupon={handleApplyCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                    appliedCoupons={appliedCoupons}
                    validationError={couponValidationError}
                    isDarkMode={false}
                    disabled={cart.length === 0}
                  />
                </div>

                {/* Referral Code Input */}
                <div className="pt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Referral Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter referral code..."
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      disabled={!!appliedReferral || cart.length === 0}
                      className="flex-1"
                    />
                    {!appliedReferral ? (
                      <Button
                        onClick={() => {
                          if (referralCode.trim()) {
                            setAppliedReferral(referralCode.trim())
                            playSuccess()
                            addNotification({
                              id: Date.now().toString(),
                              type: 'success',
                              title: 'Referral Applied',
                              message: `Referral code ${referralCode} applied successfully`,
                              timestamp: new Date(),
                              isRead: false
                            })
                          }
                        }}
                        disabled={!referralCode.trim() || cart.length === 0}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Apply
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setAppliedReferral(null)
                          setReferralCode("")
                          playSuccess()
                        }}
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {appliedReferral && (
                    <p className="text-sm text-green-600 mt-1">✓ Referral: {appliedReferral}</p>
                  )}
                </div>

                {/* Pay Button */}
                <SoundButton
                  onClick={() => setShowPaymentDialog(true)}
                  soundType="notify"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold rounded-lg hover:scale-105 transition-all duration-300"
                  disabled={cart.length === 0}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${total.toFixed(2)}
                </SoundButton>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-[420px] bg-white/95 backdrop-blur-xl border-purple-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Payment - ${total.toFixed(2)}
              </h3>
              
              {/* Cash Calculator */}
              {showCashCalculator && (
                <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                  <h4 className="text-lg font-semibold mb-3 text-emerald-800 text-center">💵 Cash Calculator</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-emerald-700 mb-2">Amount Tendered</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      className="w-full p-3 border border-emerald-300 rounded-lg text-center text-xl font-bold bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['5.00', '10.00', '20.00', '50.00', '100.00', total.toFixed(2)].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setAmountTendered(amount)}
                        className="h-10 text-sm font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 mb-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span className="text-slate-700">Total Due:</span>
                      <span className="text-emerald-600">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-semibold mt-2">
                      <span className="text-slate-700">Amount Tendered:</span>
                      <span className="text-blue-600">${amountTendered || '0.00'}</span>
                    </div>
                    <div className="border-t border-emerald-200 mt-2 pt-2 flex justify-between items-center text-xl font-bold">
                      <span className="text-slate-800">Change Due:</span>
                      <span className={`${(parseFloat(amountTendered) - total) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${((parseFloat(amountTendered) || 0) - total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowCashCalculator(false)}
                      variant="outline"
                      className="flex-1 h-10 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (parseFloat(amountTendered) >= total) {
                          completeSale("Cash")
                          setShowCashCalculator(false)
                          setAmountTendered("")
                        } else {
                          playError()
                        }
                      }}
                      disabled={!amountTendered || parseFloat(amountTendered) < total}
                      className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Complete Sale
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <SoundButton
                  onClick={() => setShowCashCalculator(true)}
                  variant="default"
                  className="h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-300"
                >
                  💵 Cash
                </SoundButton>
                <SoundButton
                  onClick={() => completeSale("Card")}
                  variant="default"
                  className="h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-300"
                >
                  💳 Card
                </SoundButton>
                <SoundButton
                  onClick={() => completeSale("Digital Wallet")}
                  variant="default"
                  className="h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-300"
                >
                  📱 Digital
                </SoundButton>
                <SoundButton
                  onClick={() => completeSale("Gift Card")}
                  variant="default"
                  className="h-14 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-300"
                >
                  🎁 Gift Card
                </SoundButton>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="w-full h-10 rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 font-semibold"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cash Management Dialog */}
      {showCashManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Cash Management</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCashManagement(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Current Drawer</p>
                <p className="text-2xl font-bold text-emerald-600">$1,234.56</p>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Count Drawer</Button>
              <Button className="w-full" variant="outline">Add Cash</Button>
              <Button className="w-full" variant="outline">Remove Cash</Button>
              <Button className="w-full" variant="outline">Print Cash Report</Button>
            </div>
          </div>
        </div>
      )}

      {/* Print Menu Dialog */}
      {showPrintMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Print Options</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrintMenu(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  if (lastTransaction) {
                    printReceipt(lastTransaction)
                  } else {
                    alert('No recent transaction to print')
                  }
                }}
                disabled={!lastTransaction}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Last Receipt
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  const endOfDayReport = {
                    id: 'EOD-' + Date.now(),
                    timestamp: new Date(),
                    items: [],
                    subtotal: transactionHistory.reduce((sum, t) => sum + t.subtotal, 0),
                    discount: transactionHistory.reduce((sum, t) => sum + t.discount, 0),
                    tax: transactionHistory.reduce((sum, t) => sum + t.tax, 0),
                    total: transactionHistory.reduce((sum, t) => sum + t.total, 0),
                    paymentMethod: 'End of Day Report',
                    referral: null,
                    transactionCount: transactionHistory.length
                  }
                  
                  const reportWindow = window.open('', '_blank', 'width=500,height=700')
                  if (reportWindow) {
                    reportWindow.document.write(`
                      <html>
                        <head>
                          <title>End of Day Report</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h1 { text-align: center; }
                            .stat { margin: 10px 0; display: flex; justify-between; }
                            .divider { border-top: 2px solid #333; margin: 20px 0; }
                          </style>
                        </head>
                        <body>
                          <h1>End of Day Report</h1>
                          <p style="text-align: center;">${new Date().toLocaleDateString()}</p>
                          <div class="divider"></div>
                          <div class="stat">
                            <span>Total Transactions:</span>
                            <strong>${transactionHistory.length}</strong>
                          </div>
                          <div class="stat">
                            <span>Total Sales:</span>
                            <strong>$${transactionHistory.reduce((sum, t) => sum + t.total, 0).toFixed(2)}</strong>
                          </div>
                          <div class="stat">
                            <span>Total Discounts:</span>
                            <strong>$${transactionHistory.reduce((sum, t) => sum + t.discount, 0).toFixed(2)}</strong>
                          </div>
                          <div class="stat">
                            <span>Total Tax:</span>
                            <strong>$${transactionHistory.reduce((sum, t) => sum + t.tax, 0).toFixed(2)}</strong>
                          </div>
                          <div class="divider"></div>
                          <h3>Transaction Details:</h3>
                          ${transactionHistory.map(t => `
                            <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd;">
                              <div>#${t.id} - ${new Date(t.timestamp).toLocaleTimeString()}</div>
                              <div>Amount: $${t.total.toFixed(2)} (${t.paymentMethod})</div>
                            </div>
                          `).join('')}
                        </body>
                      </html>
                    `)
                    reportWindow.document.close()
                    reportWindow.print()
                  }
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Print End of Day Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Print Cash Drawer Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Print Inventory Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sales History Dialog */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Sales History</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-3">
              {transactionHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No transactions yet today</p>
              ) : (
                transactionHistory.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Transaction #{transaction.id}</p>
                        <p className="text-sm text-gray-600">{new Date(transaction.timestamp).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">
                          Items: {transaction.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} • 
                          Payment: {transaction.paymentMethod}
                          {transaction.referral && ` • Referral: ${transaction.referral}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${transaction.total.toFixed(2)}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => printReceipt(transaction)}
                        >
                          <Printer className="h-3 w-3 mr-1" />
                          Reprint
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coupon Management Dialog */}
      {showCouponManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Coupon Management</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCouponManagement(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Create new coupon code..." />
                <Button>Create</Button>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Active Coupons</h3>
                <div className="space-y-2">
                  {['SAVE10', 'WELCOME20', 'SUMMER15'].map((code) => (
                    <div key={code} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-mono font-semibold">{code}</p>
                        <p className="text-sm text-gray-600">10% off • Valid until 12/31/2024</p>
                      </div>
                      <Button size="sm" variant="outline">Deactivate</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Filter Dialog */}
      {showProductFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Filter Products</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductFilter(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={typeof cat === 'string' ? cat : cat.name} value={typeof cat === 'string' ? cat : cat.name}>
                      {typeof cat === 'string' ? cat : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filterMinPrice}
                    onChange={(e) => setFilterMinPrice(e.target.value)}
                    className="flex-1"
                  />
                  <span className="self-center">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filterInStock}
                  onChange={(e) => setFilterInStock(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                  Only show items in stock
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setFilterCategory("All")
                    setFilterMinPrice("")
                    setFilterMaxPrice("")
                    setFilterInStock(false)
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowProductFilter(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Held Carts Dialog */}
      {showHeldCarts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Held Carts</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHeldCarts(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-3">
              {heldCarts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No held carts</p>
              ) : (
                heldCarts.map((heldCart) => (
                  <div key={heldCart.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{heldCart.name}</p>
                        <p className="text-sm text-gray-600">{new Date(heldCart.timestamp).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">
                          Items: {heldCart.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} • 
                          Total: ${heldCart.total.toFixed(2)}
                          {heldCart.referral && ` • Referral: ${heldCart.referral}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => {
                            // Load the held cart
                            heldCart.items.forEach((item: any) => addItem(item))
                            if (heldCart.referral) {
                              setReferralCode(heldCart.referral)
                              setAppliedReferral(heldCart.referral)
                            }
                            if (heldCart.coupons && heldCart.coupons.length > 0) {
                              heldCart.coupons.forEach((coupon: any) => applyCoupon(coupon.code))
                            }
                            
                            // Remove from held carts
                            setHeldCarts(prev => prev.filter(c => c.id !== heldCart.id))
                            setShowHeldCarts(false)
                            playSuccess()
                            
                            addNotification({
                              id: Date.now().toString(),
                              type: 'success',
                              title: 'Cart Loaded',
                              message: `Loaded "${heldCart.name}"`,
                              timestamp: new Date(),
                              isRead: false
                            })
                          }}
                        >
                          <Archive className="h-3 w-3 mr-1" />
                          Load
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => {
                            setHeldCarts(prev => prev.filter(c => c.id !== heldCart.id))
                            playSuccess()
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Returns & Exchanges Dialog */}
      {showReturnsExchange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full h-full bg-white rounded-lg overflow-hidden">
            <ReturnsIntegrationProvider>
              <ReturnsExchange
                mode="standalone"
                onComplete={(result) => {
                  console.log('Return completed:', result)
                  setShowReturnsExchange(false)
                  // Show success notification
                  addNotification({
                    id: Date.now().toString(),
                    type: 'success',
                    title: 'Return Processed',
                    message: `Return ${result.id || 'transaction'} processed successfully`,
                    timestamp: new Date(),
                    isRead: false
                  })
                }}
                onCancel={() => setShowReturnsExchange(false)}
              />
            </ReturnsIntegrationProvider>
          </div>
        </div>
      )}

      {/* Void Dialog */}
      {showVoidDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-[420px] bg-white/95 backdrop-blur-xl border-orange-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ⚠️ Void Item
              </h3>
              <p className="text-slate-600 mb-4 text-center">
                This action requires manager approval and cannot be undone.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for void (required)
                </label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full p-3 border border-orange-300 rounded-lg resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  rows={3}
                  placeholder="Enter reason for voiding this item..."
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={cancelVoid}
                  variant="outline"
                  className="flex-1 h-10 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={requestManagerApproval}
                  disabled={!voidReason.trim()}
                  className="flex-1 h-10 bg-orange-600 hover:bg-orange-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manager Approval Dialog */}
      {showManagerApproval && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-[420px] bg-white/95 backdrop-blur-xl border-red-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                🔐 Manager Approval Required
              </h3>
              <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-200">
                <p className="text-sm text-red-800 font-medium mb-2">Void Reason:</p>
                <p className="text-red-700">{voidReason}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Manager Password
                </label>
                <input
                  type="password"
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && managerPassword && validateManagerApproval()}
                  className="w-full p-3 border border-red-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Enter manager password..."
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">
                  Default password: manager123
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={cancelVoid}
                  variant="outline"
                  className="flex-1 h-10 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={validateManagerApproval}
                  disabled={!managerPassword}
                  className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve Void
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Training Mode Dialog */}
      {showTrainingDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-[500px] bg-white/95 backdrop-blur-xl border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                🎓 Training Mode
              </h3>
              
              {!isTrainingMode ? (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Enable Training Mode?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>✅ Safe practice environment</li>
                      <li>✅ All POS functions work normally</li>
                      <li>✅ No real transactions processed</li>
                      <li>✅ No receipts printed</li>
                      <li>✅ No inventory affected</li>
                      <li>✅ Perfect for training new staff</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowTrainingDialog(false)}
                      variant="outline"
                      className="flex-1 h-10 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={enableTrainingMode}
                      className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      🎓 Enable Training Mode
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200 text-center">
                    <div className="text-2xl mb-2">🎓</div>
                    <h4 className="font-semibold text-green-800 mb-2">Training Mode is Active</h4>
                    <p className="text-sm text-green-700">
                      You are currently in safe practice mode. All transactions are simulated.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowTrainingDialog(false)}
                      variant="outline"
                      className="flex-1 h-10 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      Continue Training
                    </Button>
                    <Button
                      onClick={disableTrainingMode}
                      className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-semibold"
                    >
                      💼 Exit Training Mode
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price Override Dialog */}
      {showPriceOverride && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-[450px] bg-white/95 backdrop-blur-xl border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                💰 Price Override
              </h3>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-800">Item:</span>
                  <span className="text-blue-700">
                    {cart.find(item => item.id === priceOverrideItemId)?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Original Price:</span>
                  <span className="text-blue-700">
                    ${cart.find(item => item.id === priceOverrideItemId)?.price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={overridePrice}
                  onChange={(e) => setOverridePrice(e.target.value)}
                  className="w-full p-3 border border-blue-300 rounded-lg text-center text-xl font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for price override (required)
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-3 border border-blue-300 rounded-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  rows={3}
                  placeholder="Manager discount, price match, special promotion, etc."
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={cancelPriceOverride}
                  variant="outline"
                  className="flex-1 h-10 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={requestManagerApprovalForPrice}
                  disabled={!overridePrice || !overrideReason.trim() || parseFloat(overridePrice) < 0}
                  className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manager Approval Dialog for Price Override */}
      {showManagerApprovalForPrice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-[450px] bg-white/95 backdrop-blur-xl border-indigo-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🔐 Manager Approval - Price Override
              </h3>
              
              <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-200">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-indigo-800 mb-1">Item:</p>
                    <p className="text-indigo-700">{cart.find(item => item.id === priceOverrideItemId)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-800 mb-1">Original → New:</p>
                    <p className="text-indigo-700">
                      ${cart.find(item => item.id === priceOverrideItemId)?.price.toFixed(2)} → ${parseFloat(overridePrice || '0').toFixed(2)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-800 mb-1">Reason:</p>
                  <p className="text-indigo-700">{overrideReason}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Manager Password
                </label>
                <input
                  type="password"
                  value={managerPasswordForPrice}
                  onChange={(e) => setManagerPasswordForPrice(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && managerPasswordForPrice && validateManagerApprovalForPrice()}
                  className="w-full p-3 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter manager password..."
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">
                  Default password: manager123
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={cancelPriceOverride}
                  variant="outline"
                  className="flex-1 h-10 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={validateManagerApprovalForPrice}
                  disabled={!managerPasswordForPrice}
                  className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve Override
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Search Dialog */}
      {showAdvancedSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">Advanced Search Settings</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSearch(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Search Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Search Mode
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Fields', desc: 'Search name, category, barcode, and SKU' },
                    { value: 'name', label: 'Name Only', desc: 'Search product names only' },
                    { value: 'barcode', label: 'Barcode', desc: 'Search barcodes only' },
                    { value: 'sku', label: 'SKU/ID', desc: 'Search product IDs only' }
                  ].map((mode) => (
                    <label key={mode.value} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all duration-200">
                      <input
                        type="radio"
                        name="searchMode"
                        value={mode.value}
                        checked={searchMode === mode.value}
                        onChange={(e) => setSearchMode(e.target.value as any)}
                        className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{mode.label}</div>
                        <div className="text-sm text-gray-600">{mode.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Fuzzy Search Toggle */}
              <div>
                <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all duration-200">
                  <div>
                    <div className="font-semibold text-gray-800">Fuzzy Search</div>
                    <div className="text-sm text-gray-600">Find similar matches even with typos</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={fuzzySearchEnabled}
                    onChange={(e) => setFuzzySearchEnabled(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                </label>
              </div>
              
              {/* Current Settings Display */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Current Settings</h3>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Mode:</span> {searchMode === 'all' ? 'All Fields' : searchMode === 'name' ? 'Name Only' : searchMode === 'barcode' ? 'Barcode' : 'SKU/ID'}</div>
                  <div><span className="font-medium">Fuzzy Search:</span> {fuzzySearchEnabled ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowAdvancedSearch(false)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
              >
                Apply Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Open Cash Drawer Dialog */}
      {showOpenDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-cyan-200 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <DoorOpen className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Open Cash Drawer</h3>
                  <p className="text-sm text-slate-600">Manager approval required</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason for opening drawer (required)
                  </label>
                  <input
                    type="text"
                    value={drawerReason}
                    onChange={(e) => setDrawerReason(e.target.value)}
                    className="w-full p-3 border border-cyan-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="e.g., Make change, Add cash, Get petty cash..."
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={cancelDrawerOpen}
                  variant="outline"
                  className="flex-1 h-10 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={requestDrawerOpen}
                  disabled={!drawerReason.trim()}
                  className="flex-1 h-10 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cash Drawer Manager Approval */}
      {showDrawerApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-cyan-200 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <DoorOpen className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">🔐 Manager Approval - Open Drawer</h3>
                  <p className="text-sm text-slate-600">Authorization required</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Reason:</span> {drawerReason}</div>
                  <div><span className="font-medium">User:</span> {user}</div>
                  <div><span className="font-medium">Time:</span> {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Manager Password
                  </label>
                  <input
                    type="password"
                    value={drawerManagerPassword}
                    onChange={(e) => setDrawerManagerPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && drawerManagerPassword && validateDrawerApproval()}
                    className="w-full p-3 border border-cyan-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Enter manager password..."
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Default password: manager123
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={cancelDrawerOpen}
                  variant="outline"
                  className="flex-1 h-10 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={validateDrawerApproval}
                  disabled={!drawerManagerPassword}
                  className="flex-1 h-10 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Open Drawer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customer Display View Dialog */}
      {showCustomerDisplay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <Monitor className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">Customer Display</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomerDisplay(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Main Display Content */}
              <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="h-full flex flex-col">
                  {/* Welcome Message */}
                  <div className="text-center mb-8">
                    <h1 className="text-6xl font-bold text-gray-800 mb-4">Welcome to MAPOS</h1>
                    <p className="text-2xl text-gray-600">Modern Point of Sale System</p>
                  </div>
                  
                  {/* Current Cart Display */}
                  <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
                      Your Order
                    </h3>
                    
                    {cart.length > 0 ? (
                      <div className="space-y-4">
                        {/* Cart Items */}
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {cart.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">{item.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <h4 className="text-xl font-semibold text-gray-800">{item.name}</h4>
                                  <p className="text-lg text-gray-600">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-purple-600">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Totals Display */}
                        <div className="border-t pt-4 space-y-3 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
                          <div className="flex justify-between text-xl">
                            <span className="font-medium text-gray-700">Subtotal:</span>
                            <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xl">
                            <span className="font-medium text-gray-700">Tax ({((tax/subtotal)*100).toFixed(0)}%):</span>
                            <span className="font-semibold text-gray-800">${tax.toFixed(2)}</span>
                          </div>
                          {totalSavings > 0 && (
                            <div className="flex justify-between text-xl text-green-600">
                              <span className="font-medium">Savings:</span>
                              <span className="font-semibold">-${totalSavings.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t pt-3">
                            <div className="flex justify-between text-3xl font-bold text-purple-600">
                              <span>Total:</span>
                              <span>${total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <span className="text-4xl">🛒</span>
                        </div>
                        <h4 className="text-3xl font-semibold text-gray-600 mb-4">No items in cart</h4>
                        <p className="text-xl text-gray-500">Items will appear here as they are added</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer Message */}
                  <div className="text-center mt-6">
                    <p className="text-lg text-gray-600">Thank you for shopping with us!</p>
                    <p className="text-sm text-gray-500 mt-2">Press F9 or ESC to close this display</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}