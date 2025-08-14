"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SoundButton } from "@/components/ui/sound-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Search,
  Clock,
  User,
  ShoppingCart,
  X,
  Trash2,
  Eye,
  Play,
  FileText,
  DollarSign
} from "lucide-react"
import { useHeldCartsStore } from "@/stores/held-carts"
import { useCartStore } from "@/stores/cart"
import { HeldCart } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { itemVariants } from "@/lib/animations"

interface HeldCartsDialogProps {
  isOpen: boolean
  onClose: () => void
  onCartResumed?: (heldCart: HeldCart) => void
  isDarkMode?: boolean
}

export function HeldCartsDialog({
  isOpen,
  onClose,
  onCartResumed,
  isDarkMode = false
}: HeldCartsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCart, setSelectedCart] = useState<HeldCart | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showResumeConfirm, setShowResumeConfirm] = useState(false)
  const [cartToDelete, setCartToDelete] = useState<string | null>(null)
  const [showCartDetails, setShowCartDetails] = useState(false)

  const {
    heldCarts,
    removeHeldCart,
    searchHeldCarts,
    clearHeldCarts,
    getHeldCartsCount
  } = useHeldCartsStore()

  const { resumeCart, canHoldCart, items: currentCartItems } = useCartStore()

  const filteredCarts = searchHeldCarts(searchTerm)

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setSelectedCart(null)
      setShowDeleteConfirm(false)
      setShowResumeConfirm(false)
      setCartToDelete(null)
      setShowCartDetails(false)
    }
  }, [isOpen])

  const handleResumeCart = (heldCart: HeldCart) => {
    setSelectedCart(heldCart)
    
    // If current cart has items, confirm before resuming
    if (currentCartItems.length > 0) {
      setShowResumeConfirm(true)
    } else {
      proceedWithResume(heldCart)
    }
  }

  const proceedWithResume = (heldCart: HeldCart) => {
    resumeCart(heldCart)
    removeHeldCart(heldCart.id)
    onCartResumed?.(heldCart)
    onClose()
  }

  const handleDeleteCart = (cartId: string, cartCustomerName?: string) => {
    setCartToDelete(cartId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCart = () => {
    if (cartToDelete) {
      removeHeldCart(cartToDelete)
      setCartToDelete(null)
    }
    setShowDeleteConfirm(false)
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

  const viewCartDetails = (cart: HeldCart) => {
    setSelectedCart(cart)
    setShowCartDetails(true)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className={`max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl ${
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
              Held Carts ({getHeldCartsCount()})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search by customer name, cashier, or items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 h-12 rounded-xl transition-all duration-300 shadow-sm ${
                    isDarkMode
                      ? "bg-slate-800/80 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:bg-slate-800 focus:border-purple-400/60"
                      : "bg-white/80 border-purple-200/60 focus:border-purple-400 focus:bg-white"
                  }`}
                />
              </div>
              {heldCarts.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all held carts? This cannot be undone.')) {
                      clearHeldCarts()
                    }
                  }}
                  className={`h-12 px-6 rounded-xl border-2 transition-all duration-300 ${
                    isDarkMode 
                      ? 'border-red-700/50 text-red-400 hover:bg-red-950/50 hover:border-red-600' 
                      : 'border-red-200/60 text-red-600 hover:bg-red-50/80 hover:border-red-300'
                  }`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Held Carts List */}
            <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
              {filteredCarts.length === 0 ? (
                <div className="text-center py-16">
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-slate-800/50' : 'bg-purple-50/80'
                  }`}>
                    <ShoppingCart className={`h-12 w-12 ${
                      isDarkMode ? 'text-slate-600' : 'text-purple-300'
                    }`} />
                  </div>
                  <p className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {searchTerm ? 'No held carts found' : 'No held carts'}
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {searchTerm ? 'Try adjusting your search criteria' : 'Held carts will appear here when created'}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredCarts.map((cart) => (
                    <motion.div
                      key={cart.id}
                      variants={itemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                    >
                      <Card className={`transition-all duration-300 hover:shadow-xl rounded-xl border-2 ${
                        isDarkMode
                          ? 'bg-slate-800/60 border-slate-600/50 hover:bg-slate-800/80 hover:border-slate-500/60'
                          : 'bg-gradient-to-br from-purple-50/80 to-violet-50/80 border-purple-200/40 hover:border-purple-300/60 hover:shadow-purple-200/30'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className={`font-semibold text-lg ${
                                  isDarkMode ? 'text-slate-100' : 'text-slate-800'
                                }`}>
                                  {cart.customerName || 'Walk-in Customer'}
                                </h3>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                                    isDarkMode 
                                      ? 'bg-purple-900/40 text-purple-300 border-purple-700/50' 
                                      : 'bg-purple-100/80 text-purple-700 border-purple-200/50'
                                  }`}
                                >
                                  {cart.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                </Badge>
                              </div>
                              <div className={`flex items-center gap-4 text-sm ${
                                isDarkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}>
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
                                <p className={`text-xs mt-1 italic ${
                                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                }`}>
                                  "{cart.holdReason}"
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <SoundButton
                                onClick={() => viewCartDetails(cart)}
                                variant="outline"
                                size="sm"
                                soundType="click"
                                className={`h-9 w-9 p-0 rounded-lg transition-all duration-200 ${
                                  isDarkMode 
                                    ? 'border-slate-600/50 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500' 
                                    : 'border-purple-200/60 text-purple-600 hover:bg-purple-50/80 hover:border-purple-300'
                                }`}
                                title="View cart details"
                              >
                                <Eye className="h-4 w-4" />
                              </SoundButton>
                              <SoundButton
                                onClick={() => handleResumeCart(cart)}
                                soundType="success"
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-9 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Resume
                              </SoundButton>
                              <SoundButton
                                onClick={() => handleDeleteCart(cart.id, cart.customerName)}
                                variant="outline"
                                size="sm"
                                soundType="click"
                                className={`h-9 w-9 p-0 rounded-lg transition-all duration-200 ${
                                  isDarkMode 
                                    ? 'border-red-700/50 text-red-400 hover:bg-red-950/50 hover:border-red-600' 
                                    : 'border-red-200/60 text-red-600 hover:bg-red-50/80 hover:border-red-300'
                                }`}
                                title="Delete held cart"
                              >
                                <Trash2 className="h-4 w-4" />
                              </SoundButton>
                            </div>
                          </div>

                          {/* Cart Items Preview */}
                          <div className={`border-t pt-3 mt-4 ${
                            isDarkMode ? 'border-slate-600/30' : 'border-purple-200/40'
                          }`}>
                            <div className={`text-xs font-medium mb-2 ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>Items:</div>
                            <div className="flex flex-wrap gap-2">
                              {cart.items.slice(0, 3).map((item, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={`text-xs px-3 py-1 rounded-full ${
                                    isDarkMode 
                                      ? 'border-slate-600/50 text-slate-300 bg-slate-800/30' 
                                      : 'border-purple-200/60 text-purple-700 bg-purple-50/40'
                                  }`}
                                >
                                  {item.name} (x{item.quantity})
                                </Badge>
                              ))}
                              {cart.items.length > 3 && (
                                <Badge variant="outline" className={`text-xs px-3 py-1 rounded-full ${
                                  isDarkMode 
                                    ? 'border-slate-600/50 text-slate-300 bg-slate-800/30' 
                                    : 'border-purple-200/60 text-purple-700 bg-purple-50/40'
                                }`}>
                                  +{cart.items.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Details Dialog */}
      <Dialog open={showCartDetails} onOpenChange={setShowCartDetails}>
        <DialogContent className={`max-w-2xl ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700 text-slate-100' 
            : 'bg-white border-purple-200'
        }`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${
              isDarkMode 
                ? 'text-slate-100' 
                : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
            }`}>
              Cart Details
            </DialogTitle>
          </DialogHeader>

          {selectedCart && (
            <div className="space-y-4">
              {/* Cart Info */}
              <div className={`p-4 rounded-lg ${
                isDarkMode 
                  ? 'bg-slate-700' 
                  : 'bg-gradient-to-r from-purple-50 to-violet-50'
              }`}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Customer:</div>
                    <div>{selectedCart.customerName || 'Walk-in Customer'}</div>
                  </div>
                  <div>
                    <div className="font-medium">Held by:</div>
                    <div>{selectedCart.cashier}</div>
                  </div>
                  <div>
                    <div className="font-medium">Time held:</div>
                    <div>{formatTime(selectedCart.timestamp)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Total:</div>
                    <div className="text-lg font-bold text-purple-600">
                      ${selectedCart.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                {selectedCart.holdReason && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="font-medium">Hold reason:</div>
                    <div className="italic">"{selectedCart.holdReason}"</div>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div>
                <h4 className="font-medium mb-2">Items ({selectedCart.items.length}):</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedCart.items.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-slate-500">
                          ${item.price.toFixed(2)} each
                        </div>
                      </div>
                      <div className="text-right">
                        <div>Qty: {item.quantity}</div>
                        <div className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
              }`}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedCart.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedCart.totalSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Savings:</span>
                      <span>-${selectedCart.totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedCart.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${selectedCart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <SoundButton
                  onClick={() => {
                    handleResumeCart(selectedCart)
                    setShowCartDetails(false)
                  }}
                  soundType="success"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume Cart
                </SoundButton>
                <Button
                  variant="outline"
                  onClick={() => setShowCartDetails(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Held Cart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this held cart? This action cannot be undone.
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
            <AlertDialogTitle>Resume Held Cart</AlertDialogTitle>
            <AlertDialogDescription>
              You have items in your current cart. Resuming this held cart will replace your current cart items. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedCart) {
                  proceedWithResume(selectedCart)
                }
                setShowResumeConfirm(false)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Resume Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}