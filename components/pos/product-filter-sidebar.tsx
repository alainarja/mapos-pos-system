"use client"

import React, { useState, useMemo } from "react"
import { X, Filter, Search, DollarSign, Package, Tag, Building2, Sparkles, Star, RotateCcw, Check, ChevronDown, ChevronUp, AlertCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInventoryStore } from "@/stores/inventory"
import { ProductFilter, PriceRange } from "@/types"

interface ProductFilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
  showAdvanced?: boolean
}

export function ProductFilterSidebar({ isOpen, onClose, isDarkMode, showAdvanced = true }: ProductFilterSidebarProps) {
  const {
    categories,
    filters,
    setFilters,
    clearAllFilters,
    getAvailableBrands,
    getAvailableSuppliers,
    getPredefinedPriceRanges,
    getActiveFilterCount,
    products,
    getResultsCount
  } = useInventoryStore()

  const [customPriceRange, setCustomPriceRange] = useState<[number, number]>([0, 100])
  const [showCustomPriceRange, setShowCustomPriceRange] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')
  const [supplierSearch, setSupplierSearch] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    stock: true,
    brands: false,
    tags: true,
    suppliers: false,
    advanced: false
  })

  const availableBrands = getAvailableBrands()
  const availableSuppliers = getAvailableSuppliers()
  const priceRanges = getPredefinedPriceRanges()
  const activeFilterCount = getActiveFilterCount()
  const resultsCount = getResultsCount()
  
  // Calculate price range from available products
  const priceExtents = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100 }
    const prices = products.map(p => p.price)
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }, [products])
  
  // Filter categories, brands, and suppliers based on search
  const filteredCategories = useMemo(() => {
    return categorySearch 
      ? categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
      : categories
  }, [categories, categorySearch])
  
  const filteredBrands = useMemo(() => {
    return brandSearch 
      ? availableBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
      : availableBrands
  }, [availableBrands, brandSearch])
  
  const filteredSuppliers = useMemo(() => {
    return supplierSearch 
      ? availableSuppliers.filter(s => s.toLowerCase().includes(supplierSearch.toLowerCase()))
      : availableSuppliers
  }, [availableSuppliers, supplierSearch])
  
  // Get category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; inStock: number }> = {}
    products.forEach(product => {
      if (!stats[product.category]) {
        stats[product.category] = { count: 0, inStock: 0 }
      }
      stats[product.category].count++
      if (product.stock > 0) stats[product.category].inStock++
    })
    return stats
  }, [products])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  // Initialize custom price range with actual product prices
  React.useEffect(() => {
    setCustomPriceRange([priceExtents.min, priceExtents.max])
  }, [priceExtents.min, priceExtents.max])

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryName]
      : filters.categories.filter(c => c !== categoryName)
    
    setFilters({ categories: newCategories })
  }

  const handlePriceRangeChange = (range: PriceRange | null) => {
    setFilters({ 
      priceRange: range,
      customPriceRange: null
    })
    setShowCustomPriceRange(false)
  }

  const handleCustomPriceRangeChange = () => {
    setFilters({
      customPriceRange: { min: customPriceRange[0], max: customPriceRange[1] },
      priceRange: null
    })
  }
  
  const resetToDefaults = () => {
    clearAllFilters()
    setCustomPriceRange([priceExtents.min, priceExtents.max])
    setShowCustomPriceRange(false)
    setCategorySearch('')
    setBrandSearch('')
    setSupplierSearch('')
  }
  
  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600'
      case 'low_stock': return 'text-yellow-600'
      case 'out_of_stock': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleStockStatusChange = (status: 'in_stock' | 'low_stock' | 'out_of_stock', checked: boolean) => {
    const newStatuses = checked
      ? [...filters.stockStatus, status]
      : filters.stockStatus.filter(s => s !== status)
    
    setFilters({ stockStatus: newStatuses })
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand)
    
    setFilters({ brands: newBrands })
  }

  const handleTagChange = (tag: 'new' | 'featured', checked: boolean) => {
    const newTags = checked
      ? [...filters.tags, tag]
      : filters.tags.filter(t => t !== tag)
    
    setFilters({ tags: newTags })
  }

  const handleSupplierChange = (supplier: string, checked: boolean) => {
    const newSuppliers = checked
      ? [...filters.suppliers, supplier]
      : filters.suppliers.filter(s => s !== supplier)
    
    setFilters({ suppliers: newSuppliers })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`relative w-80 h-full ${
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
      } border-r shadow-xl`}>
        
        {/* Header */}
        <div className={`p-4 border-b ${
          isDarkMode ? "border-slate-700" : "border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Filters</h2>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Results count */}
          <div className={`text-sm mb-3 flex items-center gap-2 ${
            isDarkMode ? "text-slate-400" : "text-gray-600"
          }`}>
            <Package className="h-4 w-4" />
            <span>{resultsCount} product{resultsCount !== 1 ? 's' : ''} found</span>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex-1"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="flex-1"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
          
          {showAdvanced && (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Advanced Filters</Label>
                <Switch
                  checked={showAdvancedFilters}
                  onCheckedChange={setShowAdvancedFilters}
                />
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            
            {/* Categories Section */}
            <Collapsible
              open={expandedSections.categories}
              onOpenChange={() => toggleSection('categories')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Categories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {filters.categories.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.categories.length}
                      </Badge>
                    )}
                    {expandedSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-3">
                {/* Category search */}
                {categories.length > 5 && (
                  <div className="relative mb-3">
                    <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="pl-7 h-8 text-xs"
                    />
                  </div>
                )}
                
                {filteredCategories.map((category) => {
                  const stats = categoryStats[category.name] || { count: 0, inStock: 0 }
                  return (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={filters.categories.includes(category.name)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category.name, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-normal cursor-pointer flex items-center gap-2"
                        >
                          <span>{category.icon}</span>
                          {category.name}
                        </Label>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stats.count > 0 && (
                          <span className="flex items-center gap-1">
                            {stats.inStock < stats.count && (
                              <AlertCircle className="h-3 w-3 text-yellow-500" />
                            )}
                            {stats.count}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
                
                {filteredCategories.length === 0 && categorySearch && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    No categories found
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Price Range Section */}
            <Collapsible
              open={expandedSections.price}
              onOpenChange={() => toggleSection('price')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Price Range</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(filters.priceRange || filters.customPriceRange) && "(1)"}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {/* Predefined Ranges */}
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`price-${index}`}
                        checked={filters.priceRange?.label === range.label}
                        onCheckedChange={(checked) => 
                          handlePriceRangeChange(checked ? range : null)
                        }
                      />
                      <Label
                        htmlFor={`price-${index}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {range.label}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Custom Range Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomPriceRange(!showCustomPriceRange)}
                  className="w-full"
                >
                  Custom Range
                </Button>

                {/* Custom Range Slider */}
                {showCustomPriceRange && (
                  <div className="space-y-3">
                    <div className="px-2">
                      <Slider
                        value={customPriceRange}
                        onValueChange={setCustomPriceRange}
                        max={priceExtents.max}
                        min={priceExtents.min}
                        step={0.01}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${customPriceRange[0].toFixed(2)}</span>
                      <span>${customPriceRange[1].toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Range: ${priceExtents.min} - ${priceExtents.max}
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCustomPriceRangeChange}
                      className="w-full"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Apply Custom Range
                    </Button>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Stock Status Section */}
            <Collapsible
              open={expandedSections.stock}
              onOpenChange={() => toggleSection('stock')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Stock Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {filters.stockStatus.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.stockStatus.length}
                      </Badge>
                    )}
                    {expandedSections.stock ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {[
                  { id: 'in_stock', label: 'In Stock', color: 'bg-green-500', count: products.filter(p => p.stock > (p.minStock || 0)).length },
                  { id: 'low_stock', label: 'Low Stock', color: 'bg-yellow-500', count: products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 0)).length },
                  { id: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-500', count: products.filter(p => p.stock === 0).length }
                ].map((status) => (
                  <div key={status.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`stock-${status.id}`}
                        checked={filters.stockStatus.includes(status.id as any)}
                        onCheckedChange={(checked) => 
                          handleStockStatusChange(status.id as any, checked as boolean)
                        }
                      />
                      <Label htmlFor={`stock-${status.id}`} className="text-sm font-normal cursor-pointer">
                        <span className="inline-flex items-center gap-2">
                          <div className={`w-2 h-2 ${status.color} rounded-full`}></div>
                          {status.label}
                        </span>
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {status.count}
                    </Badge>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Tags Section */}
            <Collapsible
              open={expandedSections.tags}
              onOpenChange={() => toggleSection('tags')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Product Tags</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {filters.tags.length > 0 && `(${filters.tags.length})`}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tag-new"
                    checked={filters.tags.includes('new')}
                    onCheckedChange={(checked) => 
                      handleTagChange('new', checked as boolean)
                    }
                  />
                  <Label htmlFor="tag-new" className="text-sm font-normal cursor-pointer">
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      New Products
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tag-featured"
                    checked={filters.tags.includes('featured')}
                    onCheckedChange={(checked) => 
                      handleTagChange('featured', checked as boolean)
                    }
                  />
                  <Label htmlFor="tag-featured" className="text-sm font-normal cursor-pointer">
                    <span className="inline-flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Featured Products
                    </span>
                  </Label>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Brands Section */}
            {availableBrands.length > 0 && (
              <>
                <Separator />
                <Collapsible
                  open={expandedSections.brands}
                  onOpenChange={() => toggleSection('brands')}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-0 h-auto"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Brands</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {filters.brands.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {filters.brands.length}
                          </Badge>
                        )}
                        {expandedSections.brands ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-3">
                    {/* Brand search */}
                    {availableBrands.length > 5 && (
                      <div className="relative mb-3">
                        <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                        <Input
                          placeholder="Search brands..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="pl-7 h-8 text-xs"
                        />
                      </div>
                    )}
                    
                    {filteredBrands.map((brand) => {
                      const brandCount = products.filter(p => p.brand === brand).length
                      return (
                        <div key={brand} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`brand-${brand}`}
                              checked={filters.brands.includes(brand)}
                              onCheckedChange={(checked) => 
                                handleBrandChange(brand, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`brand-${brand}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {brand}
                            </Label>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {brandCount}
                          </Badge>
                        </div>
                      )
                    })}
                    
                    {filteredBrands.length === 0 && brandSearch && (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        No brands found
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}

            {/* Suppliers Section */}
            {availableSuppliers.length > 0 && (
              <>
                <Separator />
                <Collapsible
                  open={expandedSections.suppliers}
                  onOpenChange={() => toggleSection('suppliers')}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-0 h-auto"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Suppliers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {filters.suppliers.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {filters.suppliers.length}
                          </Badge>
                        )}
                        {expandedSections.suppliers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-3">
                    {/* Supplier search */}
                    {availableSuppliers.length > 5 && (
                      <div className="relative mb-3">
                        <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                        <Input
                          placeholder="Search suppliers..."
                          value={supplierSearch}
                          onChange={(e) => setSupplierSearch(e.target.value)}
                          className="pl-7 h-8 text-xs"
                        />
                      </div>
                    )}
                    
                    {filteredSuppliers.map((supplier) => {
                      const supplierCount = products.filter(p => p.supplier === supplier).length
                      return (
                        <div key={supplier} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`supplier-${supplier}`}
                              checked={filters.suppliers.includes(supplier)}
                              onCheckedChange={(checked) => 
                                handleSupplierChange(supplier, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`supplier-${supplier}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {supplier}
                            </Label>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {supplierCount}
                          </Badge>
                        </div>
                      )
                    })}
                    
                    {filteredSuppliers.length === 0 && supplierSearch && (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        No suppliers found
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
            
            {/* Advanced Filters Section */}
            {showAdvancedFilters && (
              <>
                <Separator />
                <Collapsible
                  open={expandedSections.advanced}
                  onOpenChange={() => toggleSection('advanced')}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-0 h-auto"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                        <span className="font-medium">Advanced Filters</span>
                      </div>
                      {expandedSections.advanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-3">
                    <Card className={isDarkMode ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-200"}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Stock Level Ranges</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          { id: 'overstocked', label: 'Overstocked', filter: (p: any) => p.stock > (p.maxStock || p.stock * 2) },
                          { id: 'well_stocked', label: 'Well Stocked', filter: (p: any) => p.stock > (p.minStock || 5) && p.stock <= (p.maxStock || p.stock) },
                          { id: 'critical', label: 'Critical Stock', filter: (p: any) => p.stock > 0 && p.stock <= Math.max(1, (p.minStock || 5) / 2) }
                        ].map((level) => {
                          const count = products.filter(level.filter).length
                          return (
                            <div key={level.id} className="flex items-center justify-between">
                              <Label className="text-xs font-normal cursor-pointer flex items-center gap-2">
                                <span>{level.label}</span>
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {count}
                              </Badge>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                    
                    <Card className={isDarkMode ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-200"}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Product Age</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          { id: 'new_week', label: 'Added this week', days: 7 },
                          { id: 'new_month', label: 'Added this month', days: 30 },
                          { id: 'old_products', label: 'Older than 6 months', days: 180, reverse: true }
                        ].map((age) => {
                          const cutoff = new Date()
                          cutoff.setDate(cutoff.getDate() - age.days)
                          const count = products.filter(p => {
                            const created = p.createdAt || new Date()
                            return age.reverse ? created < cutoff : created >= cutoff
                          }).length
                          
                          return (
                            <div key={age.id} className="flex items-center justify-between">
                              <Label className="text-xs font-normal">
                                {age.label}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {count}
                              </Badge>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                    
                    <Card className={isDarkMode ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-200"}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Profit Margin</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          { id: 'high_margin', label: 'High margin (>50%)', filter: (p: any) => p.cost && ((p.price - p.cost) / p.price) > 0.5 },
                          { id: 'medium_margin', label: 'Medium margin (25-50%)', filter: (p: any) => p.cost && ((p.price - p.cost) / p.price) >= 0.25 && ((p.price - p.cost) / p.price) <= 0.5 },
                          { id: 'low_margin', label: 'Low margin (<25%)', filter: (p: any) => p.cost && ((p.price - p.cost) / p.price) < 0.25 }
                        ].map((margin) => {
                          const count = products.filter(margin.filter).length
                          return (
                            <div key={margin.id} className="flex items-center justify-between">
                              <Label className="text-xs font-normal">
                                {margin.label}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {count}
                              </Badge>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}