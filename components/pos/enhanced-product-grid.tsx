"use client"

import React, { useState } from "react"
import Image from "next/image"
import { 
  Star, 
  Sparkles, 
  AlertTriangle, 
  Package, 
  Info, 
  ChevronDown, 
  ChevronUp,
  BarChart3,
  Clock,
  Truck,
  DollarSign,
  QrCode,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useInventoryStore } from "@/stores/inventory"
import { Product } from "@/types"

interface EnhancedProductGridProps {
  products: Product[]
  onProductClick: (product: Product) => void
  isDarkMode: boolean
  isLoading?: boolean
  showDetailedInfo?: boolean
  enableQuickActions?: boolean
}

interface ExpandedCardState {
  [key: string]: boolean
}

export function EnhancedProductGrid({ 
  products, 
  onProductClick, 
  isDarkMode, 
  isLoading = false,
  showDetailedInfo = true,
  enableQuickActions = true
}: EnhancedProductGridProps) {
  const [expandedCards, setExpandedCards] = useState<ExpandedCardState>({})
  const [showDescriptions, setShowDescriptions] = useState(true)

  const toggleCardExpansion = (productId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} className={`animate-pulse ${
            isDarkMode ? "bg-slate-800/50" : "bg-gray-100"
          }`}>
            <CardContent className="p-4">
              <div className="aspect-square mb-3 rounded-lg bg-gray-300 dark:bg-slate-600" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded" />
                <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-2/3" />
                <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className={`h-16 w-16 mb-4 ${
          isDarkMode ? "text-slate-600" : "text-gray-400"
        }`} />
        <h3 className={`text-lg font-semibold mb-2 ${
          isDarkMode ? "text-slate-300" : "text-gray-700"
        }`}>
          No products available
        </h3>
        <p className={`text-sm mb-4 ${
          isDarkMode ? "text-slate-500" : "text-gray-500"
        }`}>
          Get started by adding products to the inventory system
        </p>
        <div className={`text-xs px-4 py-2 rounded-lg ${
          isDarkMode ? "bg-slate-800 text-slate-400" : "bg-gray-100 text-gray-600"
        }`}>
          Visit{' '}
          <a 
            href="https://inventorymarble.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`font-medium underline hover:no-underline ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`}
          >
            Inventory Management System
          </a>
          {' '}to add items under the "Sales" category
        </div>
      </div>
    )
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return 'out_of_stock'
    if (product.minStock && product.stock <= product.minStock) return 'low_stock'
    return 'in_stock'
  }

  const getAvailabilityStatus = (product: Product) => {
    const stock = product.stock
    const minStock = product.minStock || 10
    const maxStock = product.maxStock || 100
    
    if (stock === 0) return { status: 'unavailable', label: 'Out of Stock', color: 'destructive' }
    if (stock <= minStock * 0.5) return { status: 'critical', label: 'Very Low', color: 'destructive' }
    if (stock <= minStock) return { status: 'limited', label: 'Limited Stock', color: 'warning' }
    if (stock >= maxStock * 0.8) return { status: 'abundant', label: 'Well Stocked', color: 'success' }
    return { status: 'available', label: 'Available', color: 'default' }
  }

  const getStockPercentage = (product: Product) => {
    const maxStock = product.maxStock || 100
    return Math.min(100, (product.stock / maxStock) * 100)
  }

  const getProfitMargin = (product: Product) => {
    if (!product.cost) return null
    const margin = ((product.price - product.cost) / product.price) * 100
    return margin.toFixed(1)
  }

  const getStockBadge = (product: Product) => {
    const status = getStockStatus(product)
    const availability = getAvailabilityStatus(product)
    
    switch (status) {
      case 'out_of_stock':
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="destructive" className="text-xs flex items-center gap-1 animate-pulse">
              <div className="w-2 h-2 bg-current rounded-full" />
              Out of Stock
            </Badge>
            <div className="text-[10px] text-red-600 dark:text-red-400 font-medium text-center">
              Unavailable
            </div>
          </div>
        )
      case 'low_stock':
        return (
          <div className="relative flex flex-col gap-1">
            <Badge 
              variant="outline" 
              className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-sm ${
                availability.status === 'critical' 
                  ? 'border-red-400/60 bg-red-50/90 text-red-700 dark:border-red-500/50 dark:bg-red-900/30 dark:text-red-300 animate-pulse'
                  : 'border-amber-400/60 bg-amber-50/90 text-amber-700 dark:border-amber-500/50 dark:bg-amber-900/30 dark:text-amber-300 animate-pulse'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              {availability.label}
            </Badge>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center">
              {product.stock} left
            </div>
          </div>
        )
      default:
        return showDetailedInfo ? (
          <Badge 
            variant="outline" 
            className="text-xs flex items-center gap-1 px-2 py-0.5 bg-green-50/90 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            In Stock
          </Badge>
        ) : null
    }
  }

  const getProductTags = (product: Product) => {
    const tags = []
    const profitMargin = getProfitMargin(product)
    
    if (product.isNew) {
      tags.push(
        <Badge key="new" variant="secondary" className="text-xs flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <Sparkles className="w-3 h-3" />
          New
        </Badge>
      )
    }
    
    if (product.isFeatured) {
      tags.push(
        <Badge key="featured" variant="secondary" className="text-xs flex items-center gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
          <Star className="w-3 h-3" />
          Featured
        </Badge>
      )
    }
    
    // High profit margin tag
    if (profitMargin && parseFloat(profitMargin) > 50) {
      tags.push(
        <Badge key="high-margin" variant="secondary" className="text-xs flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <TrendingUp className="w-3 h-3" />
          High Margin
        </Badge>
      )
    }
    
    // Low profit margin tag
    if (profitMargin && parseFloat(profitMargin) < 20) {
      tags.push(
        <Badge key="low-margin" variant="secondary" className="text-xs flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
          <TrendingDown className="w-3 h-3" />
          Low Margin
        </Badge>
      )
    }
    
    return tags
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {products.map((product, index) => {
        const stockStatus = getStockStatus(product)
        const isOutOfStock = stockStatus === 'out_of_stock'
        const tags = getProductTags(product)
        const stockBadge = getStockBadge(product)
        
        return (
          <Card
            key={product.id}
            className={`cursor-pointer group transition-all duration-300 hover:shadow-xl ${
              isOutOfStock ? "opacity-75" : "hover:scale-[1.01]"
            } ${
              isDarkMode
                ? "bg-slate-800/90 border-slate-700 hover:bg-slate-750/90"
                : "bg-white/90 backdrop-blur-sm border-purple-100 hover:bg-white"
            } animate-fade-in shadow-md hover:shadow-purple-200/20 dark:hover:shadow-purple-900/20 ${
              expandedCards[product.id] ? "ring-2 ring-purple-200 dark:ring-purple-800" : ""
            }`}
            onClick={() => !isOutOfStock && onProductClick(product)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-4">
              
              {/* Product Image */}
              <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 dark:from-slate-700 dark:to-slate-600 shadow-inner">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={200}
                  height={200}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    !isOutOfStock ? "group-hover:scale-110" : "grayscale"
                  }`}
                  onError={(e) => {
                    console.warn('Image failed to load:', product.image)
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                
                {/* Badges Overlay */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {tags}
                </div>
                
                {/* Stock Badge */}
                {stockBadge && (
                  <div className="absolute top-2 right-2 z-10">
                    {stockBadge}
                  </div>
                )}
                
                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Package className="h-8 w-8 mx-auto mb-1" />
                      <div className="text-xs font-medium">Out of Stock</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Progress Bar */}
              {showDetailedInfo && (
                <div className="mb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                      Stock Level
                    </span>
                    <span className={`font-medium ${
                      getStockStatus(product) === 'low_stock' 
                        ? "text-amber-600 dark:text-amber-400"
                        : getStockStatus(product) === 'out_of_stock'
                        ? "text-red-600 dark:text-red-400" 
                        : "text-green-600 dark:text-green-400"
                    }`}>
                      {product.stock}/{product.maxStock || 100}
                    </span>
                  </div>
                  <Progress 
                    value={getStockPercentage(product)} 
                    className={`h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-2">
                {/* Product Name & Quick Actions */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-semibold text-sm line-clamp-2 leading-tight flex-1 ${
                    isDarkMode ? "text-slate-200" : "text-slate-800"
                  }`}>
                    {product.name}
                  </h3>
                  {enableQuickActions && showDetailedInfo && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleCardExpansion(product.id)
                              }}
                            >
                              {expandedCards[product.id] ? 
                                <ChevronUp className="h-3 w-3" /> : 
                                <ChevronDown className="h-3 w-3" />
                              }
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{expandedCards[product.id] ? 'Show less' : 'Show more'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDescriptions(!showDescriptions)
                              }}
                            >
                              {showDescriptions ? 
                                <EyeOff className="h-3 w-3" /> : 
                                <Eye className="h-3 w-3" />
                              }
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{showDescriptions ? 'Hide descriptions' : 'Show descriptions'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>

                {/* Brand & Supplier Info */}
                <div className="flex items-center justify-between gap-2">
                  {product.brand && (
                    <p className={`text-xs font-medium ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}>
                      {product.brand}
                    </p>
                  )}
                  {showDetailedInfo && product.supplier && (
                    <div className="flex items-center gap-1 text-xs">
                      <Truck className="w-3 h-3" />
                      <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
                        {product.supplier}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Description */}
                {showDescriptions && product.description && (
                  <p className={`text-xs leading-relaxed ${
                    expandedCards[product.id] ? "" : "line-clamp-2"
                  } ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    {product.description}
                  </p>
                )}

                {/* Detailed Pricing Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-lg ${
                        isDarkMode ? "text-purple-400" : "text-purple-600"
                      }`}>
                        ${product.price.toFixed(2)}
                      </p>
                      {product.unit && (
                        <span className={`text-xs ${
                          isDarkMode ? "text-slate-500" : "text-slate-400"
                        }`}>
                          per {product.unit}
                        </span>
                      )}
                    </div>
                    
                    {/* Stock Count with Visual Indicator */}
                    <div className={`text-xs flex items-center gap-1.5 ${
                      stockStatus === 'low_stock' 
                        ? "text-amber-600 dark:text-amber-400 font-medium"
                        : stockStatus === 'out_of_stock'
                        ? "text-red-600 dark:text-red-400 font-medium"
                        : isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}>
                      <BarChart3 className="w-3 h-3" />
                      <span>{product.stock}</span>
                      {stockStatus === 'low_stock' && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Cost and Margin Information */}
                  {showDetailedInfo && expandedCards[product.id] && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                      {product.cost && (
                        <div className="flex items-center justify-between text-xs">
                          <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
                            Cost: ${product.cost.toFixed(2)}
                          </span>
                          {getProfitMargin(product) && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span className={`font-medium ${
                                parseFloat(getProfitMargin(product)!) > 50 
                                  ? "text-green-600 dark:text-green-400"
                                  : parseFloat(getProfitMargin(product)!) < 20
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-blue-600 dark:text-blue-400"
                              }`}>
                                {getProfitMargin(product)}% margin
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Availability Status */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
                          Status:
                        </span>
                        <Badge 
                          variant={getAvailabilityStatus(product).color as any}
                          className="text-[10px] px-2 py-0.5"
                        >
                          {getAvailabilityStatus(product).label}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* SKU and Barcode */}
                {(product.sku || product.barcode) && (
                  <div className={`space-y-1 text-xs font-mono ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {product.sku && (
                      <div className="flex items-center justify-between">
                        <span>SKU: {product.sku}</span>
                        {showDetailedInfo && expandedCards[product.id] && product.barcode && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <QrCode className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Barcode: {product.barcode}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    )}
                    {expandedCards[product.id] && product.barcode && (
                      <p>Barcode: {product.barcode}</p>
                    )}
                  </div>
                )}

                {/* Category and Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 ${
                        isDarkMode 
                          ? "border-slate-600 text-slate-400" 
                          : "border-gray-300 text-gray-600"
                      }`}
                    >
                      {product.category}
                    </Badge>
                    
                    {/* Timestamp indicators */}
                    {showDetailedInfo && expandedCards[product.id] && (
                      <div className="flex items-center gap-2 text-[10px]">
                        {product.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
                              Added {new Date(product.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Add to Cart Indicator */}
                  {!isOutOfStock && (
                    <div className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}>
                      Click to add
                    </div>
                  )}
                </div>
                
                {/* Expanded Details */}
                {showDetailedInfo && expandedCards[product.id] && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <div className={`font-medium ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}>
                          Inventory
                        </div>
                        <div className={`space-y-0.5 ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}>
                          <div>Min: {product.minStock || 'N/A'}</div>
                          <div>Max: {product.maxStock || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className={`font-medium ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}>
                          Last Updated
                        </div>
                        <div className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
                          {product.updatedAt ? 
                            new Date(product.updatedAt).toLocaleDateString() : 
                            'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}