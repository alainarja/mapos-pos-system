"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SoundButton } from "@/components/ui/sound-button"
import { useSound } from "@/hooks/use-sound"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Search,
  Plus,
  Camera,
  DollarSign,
  Printer,
  LogOut,
  Minus,
  X,
  CreditCard,
  Percent,
  User,
  RotateCcw,
  ArrowLeft,
  Clock,
  BarChart3,
  History,
  Receipt,
  FileText,
  TrendingUp,
  Calendar,
  Download,
  Archive,
  Pause,
  Tag,
  Save,
} from "lucide-react"
import Image from "next/image"
import { MaposRobot, useMaposRobotController } from "@/components/ui/mapos-robot"
import Link from "next/link"
import { useCartStore } from "@/stores/cart"
import { useInventoryStore } from "@/stores/inventory"
import { useNotificationStore } from "@/stores/notifications"
import { usePrintStore } from "@/stores/print"
import { useWebSocket } from "@/services/websocket"
import { SalesHistoryDialog } from "@/components/pos/sales-history-dialog"
import { DiscountDialog } from "@/components/pos/discount-dialog"
import { HeldCartsDialog } from "@/components/pos/held-carts-dialog"
import { CartManagementDialog } from "@/components/pos/cart-management-dialog"
import { SaveCartDialog } from "@/components/pos/save-cart-dialog"
import { CouponInput } from "@/components/pos/coupon-input"
import { CouponManagementDialog } from "@/components/pos/coupon-management-dialog"
import { ReturnsExchange } from "@/components/pos/returns-exchange"
import { EnhancedProductGrid } from "@/components/pos/enhanced-product-grid"
import { useTransactionStore } from "@/stores/transactions"
import { useHeldCartsStore } from "@/stores/held-carts"
import { useSavedCartsStore } from "@/stores/saved-carts"
import { motion, AnimatePresence } from "framer-motion"
import { 
  modalVariants, 
  backdropVariants, 
  gridContainerVariants, 
  gridItemVariants, 
  cartItemVariants, 
  itemVariants 
} from "@/lib/animations"

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

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  loyaltyPoints: number
  storeCredit: number
  tier: string
}

interface MainSalesScreenProps {
  user: string
  onLogout: () => void
}

export function MainSalesScreen({ user, onLogout }: MainSalesScreenProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { playSuccess, playError, playSpecial, playBeep } = useSound()
  
  // Use Zustand stores
  const {
    items: cart,
    selectedCustomer,
    subtotal,
    tax,
    total,
    totalSavings,
    discount,
    discountInfo,
    appliedCoupons,
    couponValidationError,
    addItem,
    removeItem,
    updateQuantity,
    selectCustomer,
    clearCart,
    applyAdvancedDiscount,
    applyItemDiscount,
    removeDiscount,
    removeItemDiscount,
    applyCoupon,
    removeCoupon,
    holdCart,
    canHoldCart,
    saveCart,
    canSaveCart,
    loadSavedCart,
    createCartFromTemplate
  } = useCartStore()

  const {
    addHeldCart,
    getHeldCartsCount
  } = useHeldCartsStore()

  const {
    addSavedCart,
    getSavedCartsCount
  } = useSavedCartsStore()
  
  const {
    products: mockProducts,
    categories,
    selectedCategory,
    searchTerm,
    isRefreshing,
    lastRefresh,
    autoRefreshEnabled,
    autoRefreshInterval,
    setSelectedCategory,
    setSearchTerm,
    getFilteredProducts,
    getProductByBarcode,
    refreshInventory,
    setAutoRefreshEnabled,
    setAutoRefreshInterval
  } = useInventoryStore()
  
  const { unreadCount, addNotification } = useNotificationStore()
  const { 
    printReceipt, 
    printLastReceipt, 
    printDailyReport, 
    printXReport, 
    printZReport,
    printTransaction,
    generateReceipt,
    printerStatus
  } = usePrintStore()
  const { connect } = useWebSocket()
  const [showCategorySelection, setShowCategorySelection] = useState(true)
  const [robotAnimation, setRobotAnimation] = useState<'idle' | 'blinking' | 'hovering' | 'cart-interaction' | 'payment-success' | 'error'>('hovering')
  const [robotEyeColor, setRobotEyeColor] = useState<'default' | 'red' | 'yellow' | 'gray'>('default')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showDiscountDialog, setShowDiscountDialog] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [showCashManagement, setShowCashManagement] = useState(false)
  const [showPrintMenu, setShowPrintMenu] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<{id: string, name: string, price: number} | null>(null)
  const [showHeldCarts, setShowHeldCarts] = useState(false)
  const [showHoldDialog, setShowHoldDialog] = useState(false)
  const [holdReason, setHoldReason] = useState("")
  const [showCartManagement, setShowCartManagement] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [cartManagementTab, setCartManagementTab] = useState<'held' | 'saved'>('held')
  const [showCouponManagement, setShowCouponManagement] = useState(false)
  const [showRefreshSettings, setShowRefreshSettings] = useState(false)
  const [showReturnsExchange, setShowReturnsExchange] = useState(false)
  const { addTransaction } = useTransactionStore()

  const mockCustomers: Customer[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "555-0123",
      loyaltyPoints: 150,
      storeCredit: 25.5,
      tier: "Gold",
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "NY",
        zipCode: "12345",
        country: "USA"
      },
      isActive: true,
      createdAt: new Date()
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "555-0456",
      loyaltyPoints: 89,
      storeCredit: 0,
      tier: "Silver",
      address: {
        street: "456 Oak Ave",
        city: "Anytown",
        state: "NY",
        zipCode: "12345",
        country: "USA"
      },
      isActive: true,
      createdAt: new Date()
    },
  ]

  const addToCart = (product: Product) => {
    addItem(product)
    
    // Play special sound for adding to cart
    playSpecial()
    
    // Trigger robot cart interaction animation
    setRobotAnimation('cart-interaction')
    setRobotEyeColor('default')
    
    // Return to hovering after animation
    setTimeout(() => {
      setRobotAnimation('hovering')
    }, 2000)
  }

  const removeFromCart = (id: string) => {
    removeItem(id)
  }

  const filteredProducts = getFilteredProducts()

  // Connect to WebSocket on mount
  useEffect(() => {
    connect()
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefreshEnabled || isRefreshing) return

    const interval = setInterval(() => {
      // Only auto-refresh if not actively working (cart is empty)
      if (cart.length === 0) {
        handleRefresh()
      }
    }, autoRefreshInterval * 60 * 1000) // Convert minutes to milliseconds

    return () => clearInterval(interval)
  }, [autoRefreshEnabled, autoRefreshInterval, isRefreshing, cart.length])

  // Keyboard shortcuts for discounts, cart operations, and refresh
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Refresh shortcuts (F5 or Ctrl+R)
      if (event.key === 'F5' || ((event.ctrlKey || event.metaKey) && event.key === 'r')) {
        event.preventDefault()
        if (!isRefreshing) {
          handleRefresh()
        }
        return
      }
      
      // Only trigger if Ctrl/Cmd + D is pressed and cart has items
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && cart.length > 0) {
        event.preventDefault()
        setShowDiscountDialog(true)
        return
      }
      
      // Hold cart with Ctrl/Cmd + H
      if ((event.ctrlKey || event.metaKey) && event.key === 'h' && cart.length > 0) {
        event.preventDefault()
        handleHoldCart()
        return
      }
      
      // Show held carts with Ctrl/Cmd + Shift + H
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'H') {
        event.preventDefault()
        setCartManagementTab('held')
        setShowCartManagement(true)
        return
      }

      // Show saved carts with Ctrl/Cmd + Shift + S
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault()
        setCartManagementTab('saved')
        setShowCartManagement(true)
        return
      }

      // Save current cart with Ctrl/Cmd + S (without shift)
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 's') {
        event.preventDefault()
        if (canSaveCart()) {
          setShowSaveDialog(true)
        }
        return
      }
      
      // Quick percentage discounts with Ctrl/Cmd + number
      if ((event.ctrlKey || event.metaKey) && /^[1-9]$/.test(event.key) && cart.length > 0) {
        event.preventDefault()
        const discountPercentage = parseInt(event.key) * 5 // 5%, 10%, 15%, etc.
        if (discountPercentage <= 45) { // Max 45% via keyboard shortcut
          const discountInfo = {
            type: 'percentage' as const,
            value: discountPercentage,
            reason: `Quick ${discountPercentage}% discount (Ctrl+${event.key})`,
            timestamp: new Date()
          }
          applyAdvancedDiscount(discountInfo)
          playSuccess()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [cart.length, applyAdvancedDiscount, playSuccess, handleHoldCart, isRefreshing])

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
        
        // Trigger error animation for invalid barcode
        setRobotAnimation('error')
        setRobotEyeColor('red')
        
        // Return to normal after error display
        setTimeout(() => {
          setRobotAnimation('hovering')
          setRobotEyeColor('default')
        }, 3000)
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

  // Discount handlers
  const handleApplyDiscount = (discountValue: number, discountType: 'percentage' | 'fixed', reason?: string, requiresOverride?: boolean) => {
    const discountInfo = {
      type: discountType,
      value: discountValue,
      reason,
      managerId: requiresOverride ? 'MANAGER_001' : undefined, // In real app, get from auth
      timestamp: new Date()
    }
    
    applyAdvancedDiscount(discountInfo)
    playSuccess() // Play sound for successful discount application
  }

  const handleApplyItemDiscount = (itemId: string, discountValue: number, discountType: 'percentage' | 'fixed') => {
    applyItemDiscount(itemId, discountValue, discountType)
    playSuccess()
  }

  const handleApplyCoupon = async (couponCode: string) => {
    const success = await applyCoupon(couponCode)
    if (success) {
      playSuccess()
      setRobotAnimation('payment-success')
      setTimeout(() => setRobotAnimation('hovering'), 2000)
    } else {
      playError()
      setRobotAnimation('error')
      setRobotEyeColor('red')
      setTimeout(() => {
        setRobotAnimation('hovering')
        setRobotEyeColor('default')
      }, 3000)
    }
  }

  const handleRemoveCoupon = (couponId: string) => {
    removeCoupon(couponId)
    playSuccess()
  }

  const completeSale = async (paymentMethod: string) => {
    // Play success sound
    playSuccess()
    
    // Trigger success animation
    setRobotAnimation('payment-success')
    setRobotEyeColor('default')
    
    // Generate receipt
    const printItems = cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      discount: item.discount || 0,
      discountType: (item as any).discountType || undefined
    }))
    
    const receipt = generateReceipt(
      printItems,
      { 
        method: paymentMethod, 
        subtotal, 
        tax, 
        total, 
        totalSavings,
        discountInfo,
        appliedCoupons: appliedCoupons.map(applied => ({
          coupon: {
            code: applied.coupon.code,
            name: applied.coupon.name,
            type: applied.coupon.type,
            value: applied.coupon.value
          },
          discountAmount: applied.discountAmount,
          appliedAt: applied.appliedAt
        }))
      },
      user,
      selectedCustomer ? {
        name: selectedCustomer.name,
        email: selectedCustomer.email,
        loyaltyPoints: selectedCustomer.loyaltyPoints
      } : undefined
    )
    
    // Create transaction record
    const now = new Date()
    const transactionData = {
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      total,
      subtotal,
      tax,
      discount: totalSavings,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
        discount: item.discount || 0,
        discountType: (item as any).discountType || undefined
      })),
      discountInfo,
      appliedCoupons,
      paymentMethod,
      cashier: user,
      customerId: selectedCustomer?.id,
      status: 'completed' as const
    }
    
    // Add transaction to store
    addTransaction(transactionData)
    
    // Show success feedback and print receipt
    setTimeout(async () => {
      const shouldPrint = window.confirm(`Payment completed with ${paymentMethod}!\n\nWould you like to print the receipt?`)
      
      if (shouldPrint) {
        await printReceipt(receipt)
      }
      
      // Reset everything
      clearCart()
      selectCustomer(null)
      setShowPaymentDialog(false)
      
      // Return robot to idle state
      setRobotAnimation('hovering')
    }, 2000)
  }

  const handleHoldCart = () => {
    if (!canHoldCart()) {
      playError()
      return
    }
    setShowHoldDialog(true)
  }

  const confirmHoldCart = () => {
    const heldCart = holdCart(user, holdReason.trim() || undefined)
    if (heldCart) {
      addHeldCart(heldCart)
      playSuccess()
      setShowHoldDialog(false)
      setHoldReason("")
    } else {
      playError()
    }
  }

  const handleCartSaved = (cartId: string) => {
    playSuccess()
    // Optionally show success message or keep cart active
    console.log('Cart saved successfully:', cartId)
  }

  const handleCartResumed = () => {
    playSuccess()
    setRobotAnimation('cart-interaction')
    setTimeout(() => {
      setRobotAnimation('hovering')
    }, 2000)
  }

  const handleRefresh = async () => {
    try {
      // Play special sound for refresh start
      playSpecial()
      
      // Trigger robot animation
      setRobotAnimation('cart-interaction')
      setRobotEyeColor('yellow')
      
      // Perform refresh
      const result = await refreshInventory()
      
      if (result.success) {
        // Success feedback
        playSuccess()
        setRobotAnimation('payment-success')
        setRobotEyeColor('default')
        
        // Show success notification
        addNotification({
          type: 'success',
          title: 'Inventory Refreshed',
          message: result.message
        })
        
        // Return to hovering after success animation
        setTimeout(() => {
          setRobotAnimation('hovering')
        }, 2000)
      } else {
        // Error feedback
        playError()
        setRobotAnimation('error')
        setRobotEyeColor('red')
        
        // Show error notification
        addNotification({
          type: 'error',
          title: 'Refresh Failed',
          message: result.message
        })
        
        // Return to hovering after error animation
        setTimeout(() => {
          setRobotAnimation('hovering')
          setRobotEyeColor('default')
        }, 3000)
      }
    } catch (error) {
      playError()
      setRobotAnimation('error')
      setRobotEyeColor('red')
      
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'An unexpected error occurred during refresh'
      })
      
      setTimeout(() => {
        setRobotAnimation('hovering')
        setRobotEyeColor('default')
      }, 3000)
    }
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100" 
          : "bg-gradient-to-br from-purple-50 via-white to-violet-50 text-slate-900"
      }`}
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, oklch(0.08 0.024 264) 0%, oklch(0.06 0.028 280) 50%, oklch(0.08 0.024 264) 100%)'
          : undefined
      }}
    >
      {/* Header */}
      <header
        className={`transition-all duration-300 ${
          isDarkMode 
            ? "border-slate-600/50" 
            : "bg-white/80 backdrop-blur-xl border-purple-100"
        } border-b px-6 py-4 relative`}
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, oklch(0.10 0.028 264) 0%, oklch(0.12 0.032 280) 100%)'
            : undefined,
          backdropFilter: isDarkMode ? 'blur(20px)' : undefined,
          boxShadow: isDarkMode
            ? "0 8px 32px rgba(0,0,0,0.4), 0 4px 16px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 8px 30px rgba(139,92,246,0.15), 0 4px 15px rgba(139,92,246,0.1)",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left - Logo and Theme */}
          <div className="flex items-center gap-4">
            {/* Enhanced Logo Container */}
            <div className="relative group">
              {/* Animated Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 rounded-xl blur opacity-40 group-hover:opacity-60 animate-pulse transition-opacity duration-300"></div>
              
              {/* Logo Background */}
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-violet-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-sm">
                <div className="relative">
                  {/* Inner Glow */}
                  <div className="absolute inset-0 rounded-lg bg-white/10 blur-sm"></div>
                  
                  {/* Logo */}
                  <Image
                    src="/images/mapos-logo.png"
                    alt="MAPOS"
                    width={28}
                    height={28}
                    className="relative z-10 drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
                  />
                  
                  {/* Sparkle Effects */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full opacity-60 animate-ping"></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
              
              {/* Floating Particles */}
              <div className="absolute -top-2 -right-2 w-1 h-1 bg-violet-400 rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute -bottom-2 -left-2 w-1 h-1 bg-blue-400 rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.8s' }}></div>
            </div>
          </div>

          {/* Center - Store Name with Robot Companion */}
          <div className="relative flex items-center gap-4">
            {/* Enhanced Store Name */}
            <div className="relative group">
              {/* Enhanced Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 rounded-xl blur-lg opacity-25 group-hover:opacity-35 animate-pulse transition-opacity duration-300"></div>
              
              {/* Store Name Container */}
              <div
                className={`relative px-8 py-3 rounded-xl font-bruno-ace text-xl font-bold shadow-lg ${
                  isDarkMode 
                    ? "bg-slate-700/90 text-slate-200 border border-slate-600/50" 
                    : "bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 text-white border border-purple-300/30"
                } transform group-hover:scale-105 transition-all duration-300 backdrop-blur-sm shadow-purple-500/20`}
              >
                <span className="relative z-10 tracking-wide">MAPOS</span>
                
                {/* Subtle Inner Highlight */}
                <div className="absolute inset-1 bg-gradient-to-r from-white/10 to-transparent rounded-lg pointer-events-none"></div>
              </div>
            </div>
            {/* Floating Robot Companion */}
            <div className="hidden md:block">
              <MaposRobot
                width={60}
                height={60}
                animation={cart.length > 0 ? 'cart-interaction' : robotAnimation}
                eyeColor={cart.length > 0 ? 'default' : robotEyeColor}
                className="transform hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>

          {/* Right - Actions and User */}
          <div className="flex items-center gap-3">
            <Link href="/reports">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-110 transition-all duration-300"
                title="Reports & Analytics"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
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
              onClick={() => setShowCouponManagement(true)}
              className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 hover:scale-110 transition-all duration-300"
              title="Coupon Management"
            >
              <Tag className="h-5 w-5" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCartManagementTab('held')
                  setShowCartManagement(true)
                }}
                className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-110 transition-all duration-300"
                title="Cart Management (Ctrl+Shift+H)"
              >
                <Archive className="h-5 w-5" />
              </Button>
              {(getHeldCartsCount() + getSavedCartsCount()) > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                  {getHeldCartsCount() + getSavedCartsCount()}
                </div>
              )}
            </div>

            {/* Save Cart Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={!canSaveCart()}
              className="w-10 h-10 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              title="Save Cart (Ctrl+S)"
            >
              <Save className="h-5 w-5" />
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
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50/80 border border-purple-200/60">
                <User className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">{user}</span>
              </div>
              
              {/* Complete Shift Button */}
              <div className="relative">
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
                  title="Complete Shift & Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Complete Shift</span>
                  <span className="sm:hidden">Logout</span>
                </SoundButton>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {unreadCount}
                  </div>
                )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {showCategorySelection ? (
            <div className="max-w-4xl mx-auto">
              {/* Robot Centerpiece */}
              <div className="flex justify-center mb-6">
                <MaposRobot
                  width={150}
                  height={150}
                  animation={robotAnimation}
                  eyeColor={robotEyeColor}
                  className="drop-shadow-2xl"
                />
              </div>

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
                      className={`pl-10 h-11 rounded-lg border font-medium transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          : "bg-white/80 backdrop-blur-sm border-purple-200 text-slate-900 placeholder:text-purple-400 focus:border-purple-400"
                      }`}
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

              {/* Categories Grid - Made Smaller */}
              <div 
                className="grid grid-cols-3 gap-4 mb-8"
                variants={gridContainerVariants}
                initial="initial"
                animate="animate"
              >
                {categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setShowCategorySelection(false)
                    }}
                    variants={gridItemVariants}
                    whileHover={{
                      scale: 1.02,
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98, y: -4 }}
                  >
                    <Card
                      className={`${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white/80 backdrop-blur-sm border-purple-100"
                      } shadow-[0_8px_30px_rgba(139,92,246,0.1)] hover:shadow-[0_15px_40px_rgba(139,92,246,0.2)] transition-shadow duration-300`}
                    >
                      <CardContent className="p-4 text-center">
                        <motion.div 
                          className="text-3xl mb-2"
                          whileHover={{
                            scale: 1.2,
                            rotate: 12,
                            transition: { duration: 0.3 }
                          }}
                        >
                          {category.icon}
                        </motion.div>
                        <h3 className="text-lg font-semibold mb-1 text-slate-800 dark:text-slate-200">{category.name}</h3>
                        <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                          {mockProducts.filter(p => p.category === category.name).length} items
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* View All Products Button */}
              <motion.div 
                className="text-center"
                variants={itemVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.8 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      setSelectedCategory("All")
                      setShowCategorySelection(false)
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg text-base font-semibold"
                  >
                    View All Products
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <div>
              {/* Products Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setShowCategorySelection(true)}
                    variant="outline"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-300 ${
                      isDarkMode
                        ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                        : "border-purple-200 text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Categories
                  </Button>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    {selectedCategory === "All" ? "All Products" : selectedCategory}
                  </h2>
                </div>
                <div className="w-72">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 h-10 rounded-lg border font-medium transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-600 text-white"
                          : "bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <EnhancedProductGrid 
                products={filteredProducts}
                onProductClick={addToCart}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div
          className={`w-96 border-l p-6 transition-all duration-300 ${
            isDarkMode ? "border-slate-600/50" : "bg-white/80 backdrop-blur-xl border-purple-100"
          }`}
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, oklch(0.10 0.028 264) 0%, oklch(0.12 0.032 280) 100%)'
              : undefined,
            backdropFilter: isDarkMode ? 'blur(20px)' : undefined
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Cart
            </h2>
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 px-3 py-1 rounded-lg font-semibold animate-pulse"
            >
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </Badge>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="mb-4">
                <MaposRobot
                  width={120}
                  height={120}
                  animation={robotAnimation}
                  eyeColor={robotEyeColor}
                  className="mx-auto"
                />
              </div>
              <p className="text-slate-500 dark:text-slate-400">Cart is empty</p>
              <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">Add items to see Mapos in action!</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 space-y-3 mb-6 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        isDarkMode ? "border-purple-500/20" : "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100/50"
                      }`}
                      style={{
                        background: isDarkMode 
                          ? 'linear-gradient(135deg, oklch(0.14 0.025 264) 0%, oklch(0.16 0.025 280) 100%)'
                          : undefined
                      }}
                      variants={cartItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-slate-100' : 'text-slate-800'
                        }`}>
                          {item.name}
                        </h4>
                        {item.discount && item.discount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                              {(item as any).discountType === 'fixed' 
                                ? `-$${item.discount.toFixed(2)}` 
                                : `-${item.discount}%`
                              }
                            </Badge>
                            <SoundButton
                              onClick={() => removeItemDiscount(item.id)}
                              variant="ghost"
                              size="sm"
                              soundType="click"
                              className="h-4 w-4 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                              title="Remove item discount"
                            >
                              <X className="h-2 w-2" />
                            </SoundButton>
                          </div>
                        )}
                      </div>
                      <SoundButton
                        onClick={() => removeFromCart(item.id)}
                        variant="ghost"
                        size="sm"
                        soundType="click"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg hover:scale-110 transition-all duration-300"
                      >
                        <X className="h-3 w-3" />
                      </SoundButton>
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
                        <span className={`text-sm font-bold w-6 text-center transition-colors duration-300 ${
                          isDarkMode ? 'text-slate-100' : 'text-slate-800'
                        }`}>
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
                        <SoundButton
                          onClick={() => {
                            setSelectedItemForDiscount({
                              id: item.id,
                              name: item.name,
                              price: item.price * item.quantity
                            })
                            setShowDiscountDialog(true)
                          }}
                          variant="outline"
                          size="sm"
                          soundType="click"
                          className="h-7 w-7 p-0 rounded-lg border-purple-200 hover:bg-purple-50 hover:scale-110 transition-all duration-300"
                          title="Apply discount to this item"
                        >
                          <Percent className="h-3 w-3" />
                        </SoundButton>
                      </div>
                      <div className="text-right">
                        {item.discount && item.discount > 0 ? (
                          <div>
                            <span className="text-xs line-through text-slate-400">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <span className={`block font-bold transition-colors duration-300 ${
                              isDarkMode ? 'text-green-300' : 'text-green-600'
                            }`}>
                              ${(
                                (item as any).discountType === 'fixed' 
                                  ? Math.max(0, (item.price * item.quantity) - item.discount)
                                  : (item.price * item.quantity) * (1 - item.discount / 100)
                              ).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className={`font-bold transition-colors duration-300 ${
                            isDarkMode ? 'text-purple-300' : 'text-purple-600'
                          }`}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    </div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Cart Summary */}
              <div
                className={`border-t pt-4 -mx-6 px-6 pb-6 rounded-t-xl transition-all duration-300 ${
                  isDarkMode ? "border-slate-600/50" : "border-purple-200 bg-gradient-to-r from-purple-50/50 to-violet-50/50"
                }`}
                style={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, oklch(0.08 0.024 264) 0%, oklch(0.10 0.028 280) 100%)'
                    : undefined
                }}
              >
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Subtotal:
                    </span>
                    <span className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between items-center text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">
                          Total Savings:
                        </span>
                        {discountInfo && (
                          <SoundButton
                            onClick={() => removeDiscount()}
                            variant="ghost"
                            size="sm"
                            soundType="click"
                            className="h-4 w-4 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                            title="Remove cart discount"
                          >
                            <X className="h-2 w-2" />
                          </SoundButton>
                        )}
                      </div>
                      <span className="text-green-600 font-bold">
                        -${totalSavings.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium">
                    <span className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Tax (8%):
                    </span>
                    <span className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className={`flex justify-between font-bold text-lg pt-2 border-t transition-colors duration-300 ${
                    isDarkMode ? 'border-slate-600/50' : 'border-purple-200'
                  }`}>
                    <span className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      Total:
                    </span>
                    <span className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-purple-300' : 'text-purple-600'
                    }`}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Coupon Input */}
                <div className="pt-4 border-t border-purple-200/30">
                  <CouponInput
                    onApplyCoupon={handleApplyCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                    appliedCoupons={appliedCoupons}
                    validationError={couponValidationError}
                    isDarkMode={isDarkMode}
                    disabled={cart.length === 0}
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <SoundButton
                    onClick={() => setShowPaymentDialog(true)}
                    soundType="notify"
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold rounded-lg hover:scale-105 transition-all duration-300"
                    disabled={cart.length === 0}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ${total.toFixed(2)}
                  </SoundButton>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <SoundButton
                      onClick={handleHoldCart}
                      variant="outline"
                      size="sm"
                      soundType="click"
                      className="h-10 rounded-lg border-amber-200 text-amber-600 hover:bg-amber-50 hover:scale-105 transition-all duration-300"
                      disabled={!canHoldCart()}
                      title="Hold Cart (Ctrl+H)"
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Hold
                    </SoundButton>
                    <Button
                      onClick={() => {
                        setCartManagementTab('held')
                        setShowCartManagement(true)
                      }}
                      variant="outline"
                      size="sm"
                      className="h-10 rounded-lg border-amber-200 text-amber-600 hover:bg-amber-50 hover:scale-105 transition-all duration-300 relative"
                      title="View Cart Management (Ctrl+Shift+H)"
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Carts
                      {(getHeldCartsCount() + getSavedCartsCount()) > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="ml-1 bg-red-500 text-white text-xs h-4 px-1 rounded-full"
                        >
                          {getHeldCartsCount() + getSavedCartsCount()}
                        </Badge>
                      )}
                    </Button>
                    
                    <SoundButton
                      onClick={() => setShowSaveDialog(true)}
                      disabled={!canSaveCart()}
                      variant="outline"
                      size="sm"
                      soundType="click"
                      className="h-10 rounded-lg border-green-200 text-green-600 hover:bg-green-50 hover:scale-105 transition-all duration-300 disabled:opacity-50"
                      title="Save Cart (Ctrl+S)"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </SoundButton>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => setShowDiscountDialog(true)}
                      variant="outline"
                      size="sm"
                      className="h-10 rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all duration-300"
                      title="Apply Discount (Ctrl+D)\nQuick: Ctrl+1-9 for 5%-45% discounts"
                    >
                      <Percent className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setShowCustomerDialog(true)}
                      variant="outline"
                      size="sm"
                      className="h-10 rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all duration-300"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SoundButton
                            onClick={handleRefresh}
                            onContextMenu={(e) => {
                              e.preventDefault()
                              setShowRefreshSettings(true)
                            }}
                            variant="outline"
                            size="sm"
                            soundType="special"
                            disabled={isRefreshing}
                            className={`h-10 rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all duration-300 ${
                              isRefreshing ? 'animate-spin opacity-75' : ''
                            } ${autoRefreshEnabled ? 'ring-2 ring-green-200' : ''}`}
                          >
                            <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                          </SoundButton>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="text-center space-y-2">
                            <div className="font-semibold">Refresh Inventory</div>
                            <div className="text-xs text-muted-foreground">
                              Update products, prices & stock from server
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Keyboard: F5 or Ctrl+R • Right-click: Settings
                            </div>
                            {lastRefresh && (
                              <div className="text-xs text-muted-foreground">
                                Last refreshed: {lastRefresh.toLocaleTimeString()}
                              </div>
                            )}
                            {autoRefreshEnabled && (
                              <div className="text-xs text-green-600 font-medium">
                                Auto-refresh: Every {autoRefreshInterval} min
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <AnimatePresence>
        {showPaymentDialog && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setShowPaymentDialog(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div
                className="pointer-events-auto"
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Card
                  className={`w-[420px] backdrop-blur-xl transition-all duration-300 ${
                    isDarkMode ? 'border-purple-500/30' : 'bg-white/95 border-purple-200'
                  }`}
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, oklch(0.12 0.032 264) 0%, oklch(0.14 0.025 280) 100%)'
                      : undefined,
                    boxShadow: isDarkMode
                      ? "0 25px 80px rgba(0,0,0,0.6), 0 10px 40px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
                      : "0 25px 80px rgba(139,92,246,0.3), 0 10px 40px rgba(139,92,246,0.2)",
                  }}
                >
            <CardContent className="p-6">
              <h3 className={`text-xl font-bold mb-4 text-center transition-colors duration-300 ${
                isDarkMode 
                  ? 'text-slate-100' 
                  : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
              }`}>
                Payment - ${total.toFixed(2)}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <SoundButton
                  onClick={() => completeSale("Cash")}
                  variant="success"
                  className="h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-300"
                >
                  💵 Cash
                </SoundButton>
                <SoundButton
                  onClick={() => completeSale("Card")}
                  variant="info"
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
                  variant="warning"
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
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Customer Dialog */}
      <AnimatePresence>
        {showCustomerDialog && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setShowCustomerDialog(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div
                className="pointer-events-auto"
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Card
                  className={`w-[420px] backdrop-blur-xl transition-all duration-300 ${
                    isDarkMode ? 'border-purple-500/30' : 'bg-white/95 border-purple-200'
                  }`}
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, oklch(0.12 0.032 264) 0%, oklch(0.14 0.025 280) 100%)'
                      : undefined,
                    boxShadow: isDarkMode
                      ? "0 25px 80px rgba(0,0,0,0.6), 0 10px 40px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
                      : "0 25px 80px rgba(139,92,246,0.3), 0 10px 40px rgba(139,92,246,0.2)",
                  }}
                >
            <CardContent className="p-6">
              <h3 className={`text-xl font-bold mb-4 text-center transition-colors duration-300 ${
                isDarkMode 
                  ? 'text-slate-100' 
                  : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
              }`}>
                Select Customer
              </h3>
              <Input
                placeholder="Search customers..."
                className="mb-4 h-10 rounded-lg border-purple-200 focus:border-purple-400"
              />
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {mockCustomers.map((customer) => (
                  <Card
                    key={customer.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-purple-100 hover:bg-purple-50 transform hover:scale-105"
                    onClick={() => {
                      selectCustomer(customer)
                      setShowCustomerDialog(false)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800">{customer.name}</p>
                          <p className="text-sm text-slate-600">{customer.email}</p>
                          <p className="text-sm text-purple-600">
                            {customer.loyaltyPoints} points • ${customer.storeCredit} credit
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700"
                        >
                          {customer.tier}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCustomerDialog(false)}
                className="w-full h-10 rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 font-semibold"
              >
                Cancel
              </Button>
            </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Cash Management Dialog */}
      {showCashManagement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className={`w-[500px] backdrop-blur-xl animate-scale-in max-h-[80vh] overflow-y-auto ${
            isDarkMode 
              ? 'bg-slate-800/95 border-slate-600' 
              : 'bg-white/95 border-purple-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Cash Management
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCashManagement(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm text-emerald-700 mb-1">Cash in Drawer</p>
                      <p className="text-2xl font-bold text-emerald-800">$247.50</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-blue-700 mb-1">Today's Sales</p>
                      <p className="text-2xl font-bold text-blue-800">$1,247.25</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      const amount = prompt("Enter amount to drop to safe:")
                      if (amount && !isNaN(parseFloat(amount))) {
                        playSuccess()
                        addNotification({
                          type: 'success',
                          title: 'Cash Drop Completed',
                          message: `$${parseFloat(amount).toFixed(2)} dropped to safe`
                        })
                        setShowCashManagement(false)
                      } else if (amount) {
                        playError()
                        alert("Please enter a valid amount")
                      }
                    }}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg font-semibold"
                  >
                    Cash Drop to Safe
                  </Button>
                  <Button 
                    onClick={() => {
                      const confirmed = confirm("This will open the cash drawer for counting. Continue?")
                      if (confirmed) {
                        playSpecial()
                        addNotification({
                          type: 'info',
                          title: 'Cash Drawer Opened',
                          message: 'Please count cash and enter amount in cash management system'
                        })
                        setShowCashManagement(false)
                      }
                    }}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold"
                  >
                    Count Cash Drawer
                  </Button>
                  <Button 
                    onClick={async () => {
                      const confirmed = confirm("Generate end of shift report? This will print a summary of today's activities.")
                      if (confirmed) {
                        const success = await printDailyReport()
                        if (success) {
                          playSuccess()
                          addNotification({
                            type: 'success',
                            title: 'End of Shift Report',
                            message: 'Report printed successfully'
                          })
                        } else {
                          playError()
                          addNotification({
                            type: 'error',
                            title: 'Print Failed',
                            message: 'Could not print end of shift report'
                          })
                        }
                        setShowCashManagement(false)
                      }
                    }}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg font-semibold"
                  >
                    End of Shift Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Print Menu Dialog */}
      {showPrintMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className={`w-[420px] backdrop-blur-xl animate-scale-in ${
            isDarkMode 
              ? 'bg-slate-800/95 border-slate-600' 
              : 'bg-white/95 border-purple-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Print Options
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrintMenu(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={async () => {
                    const success = await printLastReceipt()
                    if (success) {
                      setShowPrintMenu(false)
                    } else {
                      alert('No recent receipt found or printing failed')
                    }
                  }}
                  disabled={printerStatus === 'busy'}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Receipt className="h-5 w-5" />
                  {printerStatus === 'busy' ? 'Printing...' : 'Print Last Receipt'}
                </Button>
                <Button 
                  onClick={async () => {
                    const success = await printDailyReport()
                    if (success) {
                      setShowPrintMenu(false)
                    } else {
                      alert('Printing failed')
                    }
                  }}
                  disabled={printerStatus === 'busy'}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="h-5 w-5" />
                  {printerStatus === 'busy' ? 'Printing...' : 'Print Daily Report'}
                </Button>
                <Button 
                  onClick={async () => {
                    const success = await printXReport()
                    if (success) {
                      setShowPrintMenu(false)
                    } else {
                      alert('Printing failed')
                    }
                  }}
                  disabled={printerStatus === 'busy'}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calendar className="h-5 w-5" />
                  {printerStatus === 'busy' ? 'Printing...' : 'Print X-Report'}
                </Button>
                <Button 
                  onClick={async () => {
                    const confirmed = window.confirm('Z-Report will close the current business day. Continue?')
                    if (confirmed) {
                      const success = await printZReport()
                      if (success) {
                        setShowPrintMenu(false)
                        alert('Z-Report printed. Business day closed.')
                      } else {
                        alert('Printing failed')
                      }
                    }
                  }}
                  disabled={printerStatus === 'busy'}
                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-5 w-5" />
                  {printerStatus === 'busy' ? 'Printing...' : 'Print Z-Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Sales History Dialog */}
      <SalesHistoryDialog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        isDarkMode={isDarkMode}
      />

      {/* Discount Dialog */}
      <DiscountDialog
        isOpen={showDiscountDialog}
        onClose={() => {
          setShowDiscountDialog(false)
          setSelectedItemForDiscount(null)
        }}
        onApplyDiscount={handleApplyDiscount}
        onApplyItemDiscount={handleApplyItemDiscount}
        currentDiscount={discount}
        cartTotal={subtotal}
        selectedItemId={selectedItemForDiscount?.id}
        selectedItemName={selectedItemForDiscount?.name}
        selectedItemPrice={selectedItemForDiscount?.price}
        isDarkMode={isDarkMode}
      />

      {/* Held Carts Dialog */}
      <HeldCartsDialog
        isOpen={showHeldCarts}
        onClose={() => setShowHeldCarts(false)}
        onCartResumed={handleCartResumed}
        isDarkMode={isDarkMode}
      />

      {/* Cart Management Dialog */}
      <CartManagementDialog
        isOpen={showCartManagement}
        onClose={() => setShowCartManagement(false)}
        onCartResumed={handleCartResumed}
        isDarkMode={isDarkMode}
        defaultTab={cartManagementTab}
      />

      {/* Save Cart Dialog */}
      <SaveCartDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onCartSaved={handleCartSaved}
        isDarkMode={isDarkMode}
      />

      {/* Hold Cart Confirmation Dialog */}
      <AnimatePresence>
        {showHoldDialog && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowHoldDialog(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="pointer-events-auto">
                <Card className={`w-[420px] backdrop-blur-xl transition-all duration-300 ${
                  isDarkMode ? 'border-purple-500/30' : 'bg-white/95 border-purple-200'
                }`}>
                  <CardContent className="p-6">
                    <h3 className={`text-xl font-bold mb-4 text-center transition-colors duration-300 ${
                      isDarkMode 
                        ? 'text-slate-100' 
                        : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
                    }`}>
                      Hold Cart
                    </h3>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Add an optional reason for holding this cart:
                    </p>
                    <Input
                      placeholder="Reason for holding (optional)"
                      value={holdReason}
                      onChange={(e) => setHoldReason(e.target.value)}
                      className="mb-4"
                      maxLength={100}
                    />
                    <div className="flex gap-3">
                      <SoundButton
                        onClick={confirmHoldCart}
                        soundType="success"
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Hold Cart
                      </SoundButton>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowHoldDialog(false)
                          setHoldReason("")
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Coupon Management Dialog */}
      <CouponManagementDialog
        isOpen={showCouponManagement}
        onClose={() => setShowCouponManagement(false)}
        isDarkMode={isDarkMode}
      />

      {/* Refresh Settings Dialog */}
      <AnimatePresence>
        {showRefreshSettings && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowRefreshSettings(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="pointer-events-auto">
                <Card className={`w-[420px] backdrop-blur-xl transition-all duration-300 ${
                  isDarkMode ? 'border-purple-500/30' : 'bg-white/95 border-purple-200'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-xl font-bold transition-colors duration-300 ${
                        isDarkMode 
                          ? 'text-slate-100' 
                          : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
                      }`}>
                        Refresh Settings
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRefreshSettings(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Auto-refresh toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className={`font-semibold transition-colors duration-300 ${
                            isDarkMode ? 'text-slate-200' : 'text-slate-800'
                          }`}>
                            Auto-refresh
                          </label>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            Automatically refresh when cart is empty
                          </p>
                        </div>
                        <Button
                          onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                          variant={autoRefreshEnabled ? "default" : "outline"}
                          size="sm"
                          className={`${
                            autoRefreshEnabled 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'border-slate-300 hover:bg-slate-50'
                          } transition-all duration-200`}
                        >
                          {autoRefreshEnabled ? 'ON' : 'OFF'}
                        </Button>
                      </div>

                      {/* Interval setting */}
                      {autoRefreshEnabled && (
                        <div>
                          <label className={`font-semibold transition-colors duration-300 ${
                            isDarkMode ? 'text-slate-200' : 'text-slate-800'
                          }`}>
                            Refresh Interval: {autoRefreshInterval} minutes
                          </label>
                          <div className="mt-2 space-y-2">
                            <input
                              type="range"
                              min="1"
                              max="30"
                              value={autoRefreshInterval}
                              onChange={(e) => setAutoRefreshInterval(parseInt(e.target.value))}
                              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>1 min</span>
                              <span>15 min</span>
                              <span>30 min</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status information */}
                      <div className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-slate-800' : 'bg-slate-50'
                      }`}>
                        <div className="space-y-2 text-sm">
                          {lastRefresh ? (
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                                Last refresh:
                              </span>
                              <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>
                                {lastRefresh.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                              No refresh performed yet
                            </div>
                          )}
                          {autoRefreshEnabled && (
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                                Next auto-refresh:
                              </span>
                              <span className="text-green-600">
                                ~{autoRefreshInterval} min
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Manual refresh button */}
                      <SoundButton
                        onClick={() => {
                          handleRefresh()
                          setShowRefreshSettings(false)
                        }}
                        disabled={isRefreshing}
                        soundType="special"
                        className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold"
                      >
                        {isRefreshing ? (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                            Refreshing...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Refresh Now
                          </>
                        )}
                      </SoundButton>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Returns & Exchange Dialog */}
      {showReturnsExchange && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full h-full max-w-6xl max-h-[90vh] m-4">
            <Card className={`h-full ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-200'} shadow-2xl`}>
              <CardContent className="p-0 h-full">
                <div className="flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-purple-200'}">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    Returns & Exchanges
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReturnsExchange(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="h-[calc(100%-80px)]">
                  <ReturnsExchange
                    onComplete={() => setShowReturnsExchange(false)}
                    onCancel={() => setShowReturnsExchange(false)}
                    mode="embedded"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .mapos-robot-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .mapos-robot-container::before {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 8px;
          background: radial-gradient(ellipse, rgba(139,92,246,0.3) 0%, transparent 70%);
          border-radius: 50%;
          z-index: -1;
        }
        
        .mapos-robot-canvas {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .mapos-robot-container:hover .mapos-robot-canvas {
          filter: drop-shadow(0 10px 25px rgba(139,92,246,0.4));
        }
      `}</style>
    </div>
  )
}
