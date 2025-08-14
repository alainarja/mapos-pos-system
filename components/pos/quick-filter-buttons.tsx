"use client"

import React from "react"
import { Star, Sparkles, Package, AlertTriangle, CheckCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useInventoryStore } from "@/stores/inventory"

interface QuickFilterButtonsProps {
  isDarkMode: boolean
}

export function QuickFilterButtons({ isDarkMode }: QuickFilterButtonsProps) {
  const { 
    filters, 
    setFilters, 
    setSearchTerm, 
    clearAllFilters,
    getLowStockProducts,
    getOutOfStockProducts 
  } = useInventoryStore()

  const lowStockCount = getLowStockProducts().length
  const outOfStockCount = getOutOfStockProducts().length

  const quickFilters = [
    {
      id: 'featured',
      label: 'Featured',
      icon: Star,
      color: 'yellow',
      active: filters.tags.includes('featured'),
      action: () => {
        const newTags = filters.tags.includes('featured')
          ? filters.tags.filter(t => t !== 'featured')
          : [...filters.tags, 'featured']
        setFilters({ tags: newTags })
      }
    },
    {
      id: 'new',
      label: 'New',
      icon: Sparkles,
      color: 'blue',
      active: filters.tags.includes('new'),
      action: () => {
        const newTags = filters.tags.includes('new')
          ? filters.tags.filter(t => t !== 'new')
          : [...filters.tags, 'new']
        setFilters({ tags: newTags })
      }
    },
    {
      id: 'in-stock',
      label: 'In Stock',
      icon: CheckCircle,
      color: 'green',
      active: filters.stockStatus.includes('in_stock'),
      action: () => {
        const newStatus = filters.stockStatus.includes('in_stock')
          ? filters.stockStatus.filter(s => s !== 'in_stock')
          : [...filters.stockStatus, 'in_stock']
        setFilters({ stockStatus: newStatus })
      }
    },
    {
      id: 'low-stock',
      label: 'Low Stock',
      icon: AlertTriangle,
      color: 'orange',
      count: lowStockCount,
      active: filters.stockStatus.includes('low_stock'),
      action: () => {
        const newStatus = filters.stockStatus.includes('low_stock')
          ? filters.stockStatus.filter(s => s !== 'low_stock')
          : [...filters.stockStatus, 'low_stock']
        setFilters({ stockStatus: newStatus })
      }
    },
    {
      id: 'out-of-stock',
      label: 'Out of Stock',
      icon: Package,
      color: 'red',
      count: outOfStockCount,
      active: filters.stockStatus.includes('out_of_stock'),
      action: () => {
        const newStatus = filters.stockStatus.includes('out_of_stock')
          ? filters.stockStatus.filter(s => s !== 'out_of_stock')
          : [...filters.stockStatus, 'out_of_stock']
        setFilters({ stockStatus: newStatus })
      }
    }
  ]

  const getButtonStyles = (color: string, active: boolean) => {
    const baseStyles = "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
    
    if (active) {
      const activeStyles = {
        yellow: isDarkMode 
          ? "bg-yellow-900/50 text-yellow-300 border-yellow-700 shadow-lg" 
          : "bg-yellow-100 text-yellow-800 border-yellow-300 shadow-lg",
        blue: isDarkMode 
          ? "bg-blue-900/50 text-blue-300 border-blue-700 shadow-lg" 
          : "bg-blue-100 text-blue-800 border-blue-300 shadow-lg",
        green: isDarkMode 
          ? "bg-green-900/50 text-green-300 border-green-700 shadow-lg" 
          : "bg-green-100 text-green-800 border-green-300 shadow-lg",
        orange: isDarkMode 
          ? "bg-orange-900/50 text-orange-300 border-orange-700 shadow-lg" 
          : "bg-orange-100 text-orange-800 border-orange-300 shadow-lg",
        red: isDarkMode 
          ? "bg-red-900/50 text-red-300 border-red-700 shadow-lg" 
          : "bg-red-100 text-red-800 border-red-300 shadow-lg"
      }
      return `${baseStyles} border-2 ${activeStyles[color]}`
    }

    const inactiveStyles = {
      yellow: isDarkMode 
        ? "bg-slate-800 text-yellow-400 border-yellow-600/30 hover:bg-yellow-900/30" 
        : "bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50",
      blue: isDarkMode 
        ? "bg-slate-800 text-blue-400 border-blue-600/30 hover:bg-blue-900/30" 
        : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50",
      green: isDarkMode 
        ? "bg-slate-800 text-green-400 border-green-600/30 hover:bg-green-900/30" 
        : "bg-white text-green-600 border-green-200 hover:bg-green-50",
      orange: isDarkMode 
        ? "bg-slate-800 text-orange-400 border-orange-600/30 hover:bg-orange-900/30" 
        : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50",
      red: isDarkMode 
        ? "bg-slate-800 text-red-400 border-red-600/30 hover:bg-red-900/30" 
        : "bg-white text-red-600 border-red-200 hover:bg-red-50"
    }
    return `${baseStyles} border ${inactiveStyles[color]}`
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {quickFilters.map((filter) => {
        const Icon = filter.icon
        return (
          <Button
            key={filter.id}
            onClick={filter.action}
            className={getButtonStyles(filter.color, filter.active)}
            variant="outline"
            size="sm"
          >
            <Icon className="h-4 w-4" />
            <span>{filter.label}</span>
            {filter.count !== undefined && filter.count > 0 && (
              <Badge 
                variant="secondary" 
                className={`ml-1 text-xs px-1.5 py-0.5 ${
                  filter.active 
                    ? "bg-white/20 text-current" 
                    : "bg-current/10 text-current"
                }`}
              >
                {filter.count}
              </Badge>
            )}
          </Button>
        )
      })}
      
      {/* Keyboard shortcut indicators for desktop */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground ml-4">
        <span>Quick access:</span>
        <div className="flex items-center gap-1">
          <kbd className={`px-1.5 py-0.5 rounded text-xs ${
            isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600"
          }`}>
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className={`px-1.5 py-0.5 rounded text-xs ${
            isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600"
          }`}>
            F
          </kbd>
          <span className="ml-2">for filters</span>
        </div>
      </div>
    </div>
  )
}