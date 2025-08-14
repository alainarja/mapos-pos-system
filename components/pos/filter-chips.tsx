"use client"

import React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useInventoryStore } from "@/stores/inventory"

interface FilterChipsProps {
  isDarkMode: boolean
}

export function FilterChips({ isDarkMode }: FilterChipsProps) {
  const { 
    activeFilterChips, 
    removeFilter, 
    clearAllFilters,
    getActiveFilterCount 
  } = useInventoryStore()

  const activeFilterCount = getActiveFilterCount()

  if (activeFilterCount === 0) return null

  const getChipColor = (type: string) => {
    switch (type) {
      case 'category':
        return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
      case 'price':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
      case 'stock':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
      case 'brand':
        return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
      case 'tag':
        return 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200'
      case 'supplier':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
    }
  }

  const getDarkChipColor = (type: string) => {
    switch (type) {
      case 'category':
        return 'bg-purple-900/30 text-purple-300 border-purple-800 hover:bg-purple-900/50'
      case 'price':
        return 'bg-green-900/30 text-green-300 border-green-800 hover:bg-green-900/50'
      case 'stock':
        return 'bg-blue-900/30 text-blue-300 border-blue-800 hover:bg-blue-900/50'
      case 'brand':
        return 'bg-orange-900/30 text-orange-300 border-orange-800 hover:bg-orange-900/50'
      case 'tag':
        return 'bg-pink-900/30 text-pink-300 border-pink-800 hover:bg-pink-900/50'
      case 'supplier':
        return 'bg-gray-700/30 text-gray-300 border-gray-600 hover:bg-gray-700/50'
      default:
        return 'bg-gray-700/30 text-gray-300 border-gray-600 hover:bg-gray-700/50'
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-sm font-medium ${
        isDarkMode ? "text-slate-300" : "text-slate-600"
      }`}>
        Active filters:
      </span>
      
      {activeFilterChips.map((chip) => (
        <Badge
          key={chip.id}
          variant="outline"
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium border transition-colors cursor-pointer ${
            isDarkMode ? getDarkChipColor(chip.type) : getChipColor(chip.type)
          }`}
        >
          <span className="max-w-[120px] truncate">{chip.label}</span>
          {chip.removable && (
            <Button
              variant="ghost"
              size="sm"
              className="h-3 w-3 p-0 hover:bg-black/10 ml-1"
              onClick={() => removeFilter(chip.id)}
            >
              <X className="h-2 w-2" />
            </Button>
          )}
        </Badge>
      ))}
      
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className={`text-xs h-6 px-2 ${
            isDarkMode 
              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          Clear all
        </Button>
      )}
    </div>
  )
}