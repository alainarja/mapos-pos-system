"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Product, ProductVariant } from "@/types"
import { Package, ShoppingCart, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface VariantSelectionModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onVariantSelect: (product: Product, variant: ProductVariant) => void
  isDarkMode: boolean
}

export function VariantSelectionModal({
  product,
  isOpen,
  onClose,
  onVariantSelect,
  isDarkMode
}: VariantSelectionModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [hoveredVariant, setHoveredVariant] = useState<string | null>(null)
  
  if (!product || !product.variants) {
    return null
  }
  
  const handleAddToCart = () => {
    if (selectedVariant) {
      // Create a product object from the variant
      const variantProduct: Product = {
        ...product,
        id: selectedVariant.id,
        name: selectedVariant.name,
        price: selectedVariant.price,
        stock: selectedVariant.stock,
        image: selectedVariant.image,
        sku: selectedVariant.sku,
        barcode: selectedVariant.barcode
      }
      onVariantSelect(variantProduct, selectedVariant)
      onClose()
      setSelectedVariant(null)
    }
  }
  
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'destructive' }
    if (stock <= 5) return { label: `${stock} left`, color: 'warning' }
    return { label: 'In Stock', color: 'success' }
  }
  
  // Group variants by attribute type
  const variantsByAttribute = product.variants.reduce((acc, variant) => {
    const attribute = variant.variantAttribute
    if (!acc[attribute]) {
      acc[attribute] = []
    }
    acc[attribute].push(variant)
    return acc
  }, {} as Record<string, ProductVariant[]>)
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-3xl max-h-[80vh]",
        isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white"
      )}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? "text-slate-100" : "text-gray-900"}>
            Select {product.name} Variant
          </DialogTitle>
          <DialogDescription className={isDarkMode ? "text-slate-400" : "text-gray-600"}>
            Choose from {product.variants.length} available options
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {Object.entries(variantsByAttribute).map(([attribute, variants]) => (
              <div key={attribute}>
                <h3 className={cn(
                  "text-sm font-semibold mb-3",
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                )}>
                  {attribute}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {variants.map((variant) => {
                    const stockStatus = getStockStatus(variant.stock)
                    const isSelected = selectedVariant?.id === variant.id
                    const isDisabled = variant.stock === 0
                    
                    return (
                      <Card
                        key={variant.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200",
                          isSelected && "ring-2 ring-primary",
                          isDisabled && "opacity-50 cursor-not-allowed",
                          !isDisabled && "hover:shadow-md",
                          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white",
                          hoveredVariant === variant.id && !isDisabled && "transform scale-105"
                        )}
                        onClick={() => !isDisabled && setSelectedVariant(variant)}
                        onMouseEnter={() => setHoveredVariant(variant.id)}
                        onMouseLeave={() => setHoveredVariant(null)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
                              {variant.image ? (
                                <Image
                                  src={variant.image}
                                  alt={variant.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-medium text-sm truncate",
                                isDarkMode ? "text-slate-200" : "text-gray-900"
                              )}>
                                {variant.variantValue}
                              </p>
                              
                              <p className={cn(
                                "text-lg font-bold mt-1",
                                isDarkMode ? "text-slate-100" : "text-gray-900"
                              )}>
                                ${variant.price.toFixed(2)}
                              </p>
                              
                              <Badge
                                variant={stockStatus.color as any}
                                className="mt-2 text-xs"
                              >
                                {stockStatus.label}
                              </Badge>
                            </div>
                            
                            {isSelected && (
                              <div className="text-primary">
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {variant.sku && (
                            <p className={cn(
                              "text-xs mt-2",
                              isDarkMode ? "text-slate-500" : "text-gray-500"
                            )}>
                              SKU: {variant.sku}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            {selectedVariant && (
              <div className={cn(
                "text-sm",
                isDarkMode ? "text-slate-400" : "text-gray-600"
              )}>
                Selected: <span className="font-semibold">{selectedVariant.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className={isDarkMode ? "border-slate-600" : ""}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}