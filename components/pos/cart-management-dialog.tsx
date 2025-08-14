"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SoundButton } from "@/components/ui/sound-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Clock,
  User,
  ShoppingCart,
  X,
  Trash2,
  Eye,
  Play,
  FileText,
  DollarSign,
  Archive,
  Bookmark,
  MoreHorizontal,
  Copy,
  Download,
  Upload,
  Edit,
  Package,
  Quote,
  Tag,
  Filter,
  RefreshCw
} from "lucide-react"
import { useHeldCartsStore } from "@/stores/held-carts"
import { useSavedCartsStore } from "@/stores/saved-carts"
import { useCartStore } from "@/stores/cart"
import { useUserStore } from "@/stores/user"
import { HeldCart, SavedCart } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { itemVariants } from "@/lib/animations"
import { SaveCartDialog } from "./save-cart-dialog"

interface CartManagementDialogProps {
  isOpen: boolean
  onClose: () => void
  onCartResumed?: (cart: HeldCart | SavedCart) => void
  isDarkMode?: boolean
  defaultTab?: 'held' | 'saved'
}

export function CartManagementDialog({
  isOpen,
  onClose,
  onCartResumed,
  isDarkMode = false,
  defaultTab = 'held'
}: CartManagementDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHeldCart, setSelectedHeldCart] = useState<HeldCart | null>(null)
  const [selectedSavedCart, setSelectedSavedCart] = useState<SavedCart | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showResumeConfirm, setShowResumeConfirm] = useState(false)
  const [cartToDelete, setCartToDelete] = useState<{id: string, type: 'held' | 'saved'} | null>(null)
  const [showCartDetails, setShowCartDetails] = useState(false)
  const [activeTab, setActiveTab] = useState<'held' | 'saved'>(defaultTab)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Held carts store
  const {
    heldCarts,
    removeHeldCart,
    searchHeldCarts,
    clearHeldCarts,
    getHeldCartsCount
  } = useHeldCartsStore()

  // Saved carts store
  const {
    savedCarts,
    removeSavedCart,
    searchSavedCarts,
    clearSavedCarts,
    getSavedCartsCount,
    getSavedCartsByCategory,
    duplicateSavedCart,
    exportSavedCart,
    importSavedCart
  } = useSavedCartsStore()

  const { resumeCart, loadSavedCart, createCartFromTemplate, items: currentCartItems } = useCartStore()
  const { currentUser } = useUserStore()

  const filteredHeldCarts = searchHeldCarts(searchTerm)
  const filteredSavedCarts = categoryFilter === 'all' 
    ? searchSavedCarts(searchTerm)
    : searchSavedCarts(searchTerm).filter(cart => cart.category === categoryFilter)

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setSelectedHeldCart(null)
      setSelectedSavedCart(null)
      setShowDeleteConfirm(false)
      setShowResumeConfirm(false)
      setCartToDelete(null)
      setShowCartDetails(false)
      setCategoryFilter('all')
    }
  }, [isOpen])

  const handleResumeHeldCart = (heldCart: HeldCart) => {
    setSelectedHeldCart(heldCart)
    
    if (currentCartItems.length > 0) {
      setShowResumeConfirm(true)
    } else {
      proceedWithHeldResume(heldCart)
    }
  }

  const handleLoadSavedCart = (savedCart: SavedCart, asTemplate = false) => {
    setSelectedSavedCart(savedCart)
    
    if (currentCartItems.length > 0) {
      setShowResumeConfirm(true)
    } else {
      proceedWithSavedLoad(savedCart, asTemplate)
    }
  }

  const proceedWithHeldResume = (heldCart: HeldCart) => {
    resumeCart(heldCart)
    removeHeldCart(heldCart.id)
    onCartResumed?.(heldCart)
    onClose()
  }

  const proceedWithSavedLoad = (savedCart: SavedCart, asTemplate = false) => {
    if (asTemplate) {
      createCartFromTemplate(savedCart)
    } else {
      loadSavedCart(savedCart)
    }
    onCartResumed?.(savedCart)
    onClose()
  }

  const handleDeleteCart = (cartId: string, type: 'held' | 'saved') => {
    setCartToDelete({ id: cartId, type })
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCart = async () => {
    if (cartToDelete) {
      if (cartToDelete.type === 'held') {
        removeHeldCart(cartToDelete.id)
      } else {
        await removeSavedCart(cartToDelete.id)
      }
      setCartToDelete(null)
    }
    setShowDeleteConfirm(false)
  }

  const handleDuplicateCart = async (savedCart: SavedCart) => {
    if (!currentUser) return
    
    const newLabel = `${savedCart.label} (Copy)`
    const duplicated = await duplicateSavedCart(savedCart.id, newLabel, currentUser.id, currentUser.username)
    if (duplicated) {
      // Optionally show success message
      console.log('Cart duplicated:', duplicated.id)
    }
  }

  const handleExportCart = (savedCart: SavedCart) => {
    const exportData = exportSavedCart(savedCart.id)
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cart-${savedCart.label.replace(/[^a-zA-Z0-9]/g, '-')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImportCart = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && currentUser) {
        const text = await file.text()
        const imported = await importSavedCart(text, currentUser.id, currentUser.username)
        if (imported) {
          // Optionally show success message
          console.log('Cart imported:', imported.id)
        }
      }
    }
    input.click()
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const viewCartDetails = (cart: HeldCart | SavedCart, type: 'held' | 'saved') => {
    if (type === 'held') {
      setSelectedHeldCart(cart as HeldCart)
    } else {
      setSelectedSavedCart(cart as SavedCart)
    }
    setShowCartDetails(true)
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'template': return Package
      case 'customer': return User
      case 'quote': return Quote
      default: return ShoppingCart
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'template': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'customer': return 'bg-green-100 text-green-700 border-green-200'
      case 'quote': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-purple-100 text-purple-700 border-purple-200'
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className={`max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-slate-900/95 border-slate-600 text-slate-100' 
              : 'bg-white/95 border-purple-200/50'
          }`}
        >
          <DialogHeader>
            <DialogTitle className={`text-2xl font-bold flex items-center gap-3 mb-2 ${
              isDarkMode 
                ? 'text-slate-100' 
                : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
            }`}>
              <ShoppingCart className="h-6 w-6" />
              Cart Management
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className={`grid w-auto grid-cols-2 rounded-xl p-1 ${
                isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <TabsTrigger 
                  value="held" 
                  className="flex items-center gap-2 rounded-lg px-4 py-2"
                >
                  <Archive className="h-4 w-4" />
                  Held Carts ({getHeldCartsCount()})
                </TabsTrigger>
                <TabsTrigger 
                  value="saved" 
                  className="flex items-center gap-2 rounded-lg px-4 py-2"
                >
                  <Bookmark className="h-4 w-4" />
                  Saved Carts ({getSavedCartsCount()})
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  className="h-9"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Save Current
                </Button>
                {activeTab === 'saved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImportCart}
                    className="h-9"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  placeholder={`Search ${activeTab} carts...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 h-12 rounded-xl transition-all duration-300 shadow-sm ${
                    isDarkMode
                      ? "bg-slate-800/80 border-slate-600/50 text-slate-100 placeholder:text-slate-400"
                      : "bg-white/80 border-purple-200/60 focus:border-purple-400 focus:bg-white"
                  }`}
                />
              </div>

              {activeTab === 'saved' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-12">
                      <Filter className="h-4 w-4 mr-2" />
                      Category
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                      All Categories
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCategoryFilter('saved')}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Saved Carts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('customer')}>
                      <User className="h-4 w-4 mr-2" />
                      Customer Carts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('template')}>
                      <Package className="h-4 w-4 mr-2" />
                      Templates
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('quote')}>
                      <Quote className="h-4 w-4 mr-2" />
                      Quotes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <TabsContent value="held" className="space-y-4">
              {/* Held Carts Content */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Temporary Held Carts</h3>
                {heldCarts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Clear all held carts? This cannot be undone.')) {
                        clearHeldCarts()
                      }
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {filteredHeldCarts.length === 0 ? (
                  <div className="text-center py-16">
                    <Archive className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-xl font-semibold mb-2 text-slate-600">
                      {searchTerm ? 'No held carts found' : 'No held carts'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {searchTerm ? 'Try adjusting your search' : 'Held carts appear here temporarily'}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredHeldCarts.map((cart) => (
                      <motion.div
                        key={cart.id}
                        variants={itemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                      >
                        <Card className="transition-all duration-300 hover:shadow-xl rounded-xl border-2">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="font-semibold text-lg">
                                    {cart.customerName || 'Walk-in Customer'}
                                  </h4>
                                  <Badge variant="secondary" className="px-3 py-1 rounded-full">
                                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTime(cart.timestamp)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{cart.cashier}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>${cart.total.toFixed(2)}</span>
                                  </div>
                                </div>
                                {cart.holdReason && (
                                  <p className="text-xs mt-1 italic text-slate-600">
                                    "{cart.holdReason}"
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewCartDetails(cart, 'held')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <SoundButton
                                  onClick={() => handleResumeHeldCart(cart)}
                                  soundType="success"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Resume
                                </SoundButton>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCart(cart.id, 'held')}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              {/* Saved Carts Content */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Saved Carts</h3>
                {savedCarts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Clear all saved carts? This cannot be undone.')) {
                        clearSavedCarts()
                      }
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {filteredSavedCarts.length === 0 ? (
                  <div className="text-center py-16">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-xl font-semibold mb-2 text-slate-600">
                      {searchTerm ? 'No saved carts found' : 'No saved carts'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {searchTerm ? 'Try adjusting your search' : 'Save carts for later use'}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredSavedCarts.map((cart) => {
                      const CategoryIcon = getCategoryIcon(cart.category)
                      return (
                        <motion.div
                          key={cart.id}
                          variants={itemVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layout
                        >
                          <Card className="transition-all duration-300 hover:shadow-xl rounded-xl border-2">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <h4 className="font-semibold text-lg">
                                      {cart.label}
                                    </h4>
                                    <Badge 
                                      variant="outline" 
                                      className={`px-3 py-1 rounded-full text-xs ${getCategoryColor(cart.category)}`}
                                    >
                                      <CategoryIcon className="h-3 w-3 mr-1" />
                                      {cart.category || 'saved'}
                                    </Badge>
                                    {cart.isTemplate && (
                                      <Badge variant="secondary" className="px-2 py-1 rounded-full text-xs">
                                        Template
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                    <span>{cart.items.length} items</span>
                                    <span>${cart.total.toFixed(2)}</span>
                                    <span>by {cart.savedBy}</span>
                                    <span>{formatTime(cart.updatedAt)}</span>
                                  </div>

                                  {cart.description && (
                                    <p className="text-sm text-slate-600 mb-2">{cart.description}</p>
                                  )}

                                  {cart.customerName && (
                                    <p className="text-sm text-slate-600">
                                      Customer: {cart.customerName}
                                    </p>
                                  )}

                                  {cart.tags && cart.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {cart.tags.slice(0, 3).map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                                          <Tag className="h-2 w-2 mr-1" />
                                          {tag}
                                        </Badge>
                                      ))}
                                      {cart.tags.length > 3 && (
                                        <Badge variant="outline" className="text-xs px-2 py-1">
                                          +{cart.tags.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => viewCartDetails(cart, 'saved')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem 
                                        onClick={() => handleLoadSavedCart(cart, false)}
                                      >
                                        <Play className="h-4 w-4 mr-2" />
                                        Load Cart
                                      </DropdownMenuItem>
                                      {cart.isTemplate && (
                                        <DropdownMenuItem 
                                          onClick={() => handleLoadSavedCart(cart, true)}
                                        >
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Use as Template
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => handleDuplicateCart(cart)}
                                      >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplicate
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleExportCart(cart)}
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteCart(cart.id, 'saved')}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Save Cart Dialog */}
      <SaveCartDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onCartSaved={() => {
          // Refresh or show success message
        }}
        isDarkMode={isDarkMode}
      />

      {/* Cart Details Dialog */}
      <Dialog open={showCartDetails} onOpenChange={setShowCartDetails}>
        <DialogContent className={`max-w-2xl ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700 text-slate-100' 
            : 'bg-white border-purple-200'
        }`}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Cart Details
            </DialogTitle>
          </DialogHeader>

          {(selectedHeldCart || selectedSavedCart) && (
            <div className="space-y-4">
              {/* Cart details implementation */}
              <p>Cart details would go here...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this cart? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCart}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Confirmation Dialog */}
      <AlertDialog open={showResumeConfirm} onOpenChange={setShowResumeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load Cart</AlertDialogTitle>
            <AlertDialogDescription>
              You have items in your current cart. Loading this cart will replace your current items. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedHeldCart) {
                  proceedWithHeldResume(selectedHeldCart)
                } else if (selectedSavedCart) {
                  proceedWithSavedLoad(selectedSavedCart)
                }
                setShowResumeConfirm(false)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Load Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}