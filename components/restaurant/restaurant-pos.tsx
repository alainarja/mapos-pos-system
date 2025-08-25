"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useTablesStore } from "@/stores/tables"
import { useCartStore } from "@/stores/cart"
import { useInventoryStore } from "@/stores/inventory"
import TableSelection from "./table-selection"
import TableConfigurationInterface from "./table-configuration"
import { EnhancedProductGrid } from "@/components/pos/enhanced-product-grid"
import { 
  ChefHat,
  Settings,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Receipt,
  Clock,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Home,
  Utensils,
  X,
  MoveHorizontal,
  Coffee,
  Wine,
  Pizza,
  Salad,
  IceCream,
  Soup
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface RestaurantPOSProps {
  user: string
  onLogout: () => void
  warehouseId?: string
}

const RestaurantPOS: React.FC<RestaurantPOSProps> = ({ user, onLogout, warehouseId }) => {
  const {
    floorPlan,
    tableCarts,
    activeTableId,
    setActiveTable,
    getTableCart,
    updateTableCart,
    clearTableCart,
    updateTableStatus
  } = useTablesStore()
  
  const cartStore = useCartStore()
  const { products, searchProducts } = useInventoryStore()
  
  const [activeTab, setActiveTab] = useState<"tables" | "menu" | "cart" | "config">("tables")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // Get active table cart
  const activeTableCart = activeTableId ? getTableCart(activeTableId) : null
  const activeTable = activeTableId ? floorPlan.tables.find(t => t.id === activeTableId) : null
  
  // Sync table cart with main cart store
  useEffect(() => {
    if (activeTableCart) {
      // Load table cart items into main cart
      cartStore.clearCart()
      activeTableCart.items.forEach(item => {
        const product = products.find(p => p.id === item.id)
        if (product) {
          cartStore.addItem(product, item.quantity)
        }
      })
      
      if (activeTableCart.selectedCustomer) {
        cartStore.selectCustomer(activeTableCart.selectedCustomer)
      }
      
      if (activeTableCart.discount > 0) {
        cartStore.applyDiscount(activeTableCart.discount)
      }
    }
  }, [activeTableId])
  
  // Update table cart when main cart changes
  useEffect(() => {
    if (activeTableId && activeTableCart) {
      updateTableCart(activeTableId, {
        items: cartStore.items,
        selectedCustomer: cartStore.selectedCustomer,
        discount: cartStore.discount,
        discountInfo: cartStore.discountInfo,
        appliedCoupons: cartStore.appliedCoupons,
        subtotal: cartStore.subtotal,
        tax: cartStore.tax,
        total: cartStore.total,
        totalSavings: cartStore.totalSavings
      })
    }
  }, [cartStore.items, cartStore.total])
  
  const handleTableSelect = (tableId: string) => {
    setActiveTable(tableId)
    setActiveTab("menu")
  }
  
  const handleCheckout = async () => {
    if (!activeTableCart || !activeTableId) return
    
    // Process the sale
    const result = await cartStore.processSale('cash', user, warehouseId)
    
    if (result.success) {
      // Clear the table
      clearTableCart(activeTableId)
      updateTableStatus(activeTableId, 'cleaning')
      
      // Reset to available after cleaning
      setTimeout(() => {
        updateTableStatus(activeTableId, 'available')
      }, 2000)
      
      setActiveTable(null)
      setActiveTab("tables")
    }
  }
  
  const categories = [
    { id: "all", name: "All Items", icon: Utensils },
    { id: "appetizers", name: "Appetizers", icon: Salad },
    { id: "mains", name: "Main Courses", icon: Pizza },
    { id: "desserts", name: "Desserts", icon: IceCream },
    { id: "beverages", name: "Beverages", icon: Coffee },
    { id: "wine", name: "Wine & Spirits", icon: Wine },
    { id: "soups", name: "Soups", icon: Soup }
  ]
  
  const renderCartItem = (item: any) => {
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg"
      >
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-12 h-12 rounded-md object-cover"
          />
        )}
        <div className="flex-1">
          <p className="font-medium text-sm">{item.name}</p>
          <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => cartStore.updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => cartStore.updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="text-right">
          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive"
          onClick={() => cartStore.removeItem(item.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </motion.div>
    )
  }
  
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Restaurant POS</h1>
            </div>
            {activeTable && (
              <Badge variant="default" className="text-sm py-1 px-3">
                <Utensils className="w-3 h-3 mr-1" />
                Table {activeTable.number}
              </Badge>
            )}
            {activeTableCart && (
              <>
                <Badge variant="outline" className="text-sm py-1 px-3">
                  <Users className="w-3 h-3 mr-1" />
                  {activeTableCart.guestCount || 0} Guests
                </Badge>
                <Badge variant="outline" className="text-sm py-1 px-3">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(activeTableCart.startTime), { addSuffix: false })}
                </Badge>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Logged in as {user}</span>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full">
          <div className="border-b border-slate-800 bg-slate-900/30">
            <TabsList className="h-12 bg-transparent px-6">
              <TabsTrigger value="tables" className="data-[state=active]:bg-slate-800">
                <Home className="w-4 h-4 mr-2" />
                Tables
              </TabsTrigger>
              <TabsTrigger 
                value="menu" 
                className="data-[state=active]:bg-slate-800"
                disabled={!activeTableId}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Menu
              </TabsTrigger>
              <TabsTrigger 
                value="cart" 
                className="data-[state=active]:bg-slate-800"
                disabled={!activeTableId || cartStore.items.length === 0}
              >
                <Receipt className="w-4 h-4 mr-2" />
                Cart {cartStore.items.length > 0 && `(${cartStore.items.length})`}
              </TabsTrigger>
              <TabsTrigger value="config" className="data-[state=active]:bg-slate-800">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="tables" className="h-[calc(100%-3rem)] p-6">
            <TableSelection onTableSelect={handleTableSelect} currentUser={user} />
          </TabsContent>
          
          <TabsContent value="menu" className="h-[calc(100%-3rem)] p-6">
            <div className="flex gap-6 h-full">
              {/* Categories Sidebar */}
              <Card className="w-64 bg-slate-800/50 backdrop-blur-xl border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map(category => {
                      const Icon = category.icon
                      return (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {category.name}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              
              {/* Products Grid */}
              <div className="flex-1">
                <EnhancedProductGrid
                  products={selectedCategory === "all" ? products : products.filter(p => p.category === selectedCategory)}
                  onProductClick={(product) => cartStore.addItem(product)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="cart" className="h-[calc(100%-3rem)] p-6">
            <div className="flex gap-6 h-full">
              {/* Cart Items */}
              <Card className="flex-1 bg-slate-800/50 backdrop-blur-xl border-slate-700">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <AnimatePresence>
                      {cartStore.items.length > 0 ? (
                        <div className="space-y-2">
                          {cartStore.items.map(renderCartItem)}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No items in cart</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Order Summary */}
              <Card className="w-96 bg-slate-800/50 backdrop-blur-xl border-slate-700">
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${cartStore.subtotal.toFixed(2)}</span>
                    </div>
                    {cartStore.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-500">
                        <span>Discount</span>
                        <span>-${(cartStore.subtotal * (cartStore.discount / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${cartStore.tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">${cartStore.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button className="w-full" size="lg" onClick={handleCheckout}>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Process Payment
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Receipt className="w-5 h-5 mr-2" />
                      Print Bill
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => {
                        if (!activeTableId || !confirm('Clear all items from this table?')) return
                        cartStore.clearCart()
                      }}
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="config" className="h-[calc(100%-3rem)]">
            <TableConfigurationInterface />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default RestaurantPOS