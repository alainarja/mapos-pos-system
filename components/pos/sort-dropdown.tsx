"use client"

import React, { useMemo } from "react"
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Star, TrendingUp, Package, DollarSign, Clock, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInventoryStore } from "@/stores/inventory"
import { SortOption } from "@/types"

interface SortDropdownProps {
  isDarkMode: boolean
  showAdvanced?: boolean
  resultsCount?: number
}

export function SortDropdown({ isDarkMode, showAdvanced = false, resultsCount }: SortDropdownProps) {
  const { sortBy, setSortBy, getResultsCount } = useInventoryStore()
  const actualResultsCount = resultsCount ?? getResultsCount()

  const basicSortOptions: (SortOption & { icon?: React.ComponentType<{ className?: string }>, description?: string })[] = [
    { field: 'name', direction: 'asc', label: 'Name (A-Z)', icon: ArrowUp, description: 'Alphabetical order' },
    { field: 'name', direction: 'desc', label: 'Name (Z-A)', icon: ArrowDown, description: 'Reverse alphabetical' },
    { field: 'price', direction: 'asc', label: 'Price (Low to High)', icon: DollarSign, description: 'Cheapest first' },
    { field: 'price', direction: 'desc', label: 'Price (High to Low)', icon: DollarSign, description: 'Most expensive first' },
    { field: 'stock', direction: 'desc', label: 'Stock (High to Low)', icon: Package, description: 'Most in stock first' },
    { field: 'stock', direction: 'asc', label: 'Stock (Low to High)', icon: Package, description: 'Least in stock first' }
  ]
  
  const advancedSortOptions: (SortOption & { icon?: React.ComponentType<{ className?: string }>, description?: string })[] = [
    { field: 'category', direction: 'asc', label: 'Category (A-Z)', icon: BarChart3, description: 'Group by category' },
    { field: 'created', direction: 'desc', label: 'Recently Added', icon: Clock, description: 'Newest products first' },
    { field: 'updated', direction: 'desc', label: 'Recently Updated', icon: TrendingUp, description: 'Latest changes first' }
  ]
  
  const sortOptions = useMemo(() => {
    return showAdvanced ? [...basicSortOptions, ...advancedSortOptions] : basicSortOptions
  }, [showAdvanced])

  const handleSortChange = (option: SortOption) => {
    setSortBy(option)
  }

  const getSortIcon = (direction: 'asc' | 'desc') => {
    if (direction === 'asc') {
      return <ArrowUp className="h-3 w-3" />
    } else {
      return <ArrowDown className="h-3 w-3" />
    }
  }
  
  const getCurrentSortOption = () => {
    return sortOptions.find(option => 
      option.field === sortBy.field && option.direction === sortBy.direction
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 relative ${
            isDarkMode
              ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {getCurrentSortOption()?.icon ? (
            <getCurrentSortOption()!.icon className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Sort:</span>
          <span className="max-w-[120px] truncate">{sortBy.label}</span>
          {actualResultsCount > 0 && (
            <span className={`hidden lg:inline text-xs px-1.5 py-0.5 rounded ${
              isDarkMode ? "bg-slate-700 text-slate-400" : "bg-gray-100 text-gray-600"
            }`}>
              {actualResultsCount}
            </span>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={`w-72 ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Results header */}
        {actualResultsCount > 0 && (
          <div className={`px-3 py-2 text-xs border-b ${
            isDarkMode ? "text-slate-400 border-slate-700" : "text-gray-600 border-gray-200"
          }`}>
            Sorting {actualResultsCount} product{actualResultsCount !== 1 ? 's' : ''}
          </div>
        )}
        
        {/* Basic sort options */}
        <div className={`px-2 py-1 text-xs font-medium border-b ${
          isDarkMode ? "text-slate-500 border-slate-700" : "text-gray-500 border-gray-200"
        }`}>
          Basic Sorting
        </div>
        
        {basicSortOptions.map((option, index) => {
          const isActive = sortBy.field === option.field && sortBy.direction === option.direction
          const OptionIcon = option.icon || ArrowUpDown
          
          return (
            <DropdownMenuItem
              key={`basic-${index}`}
              onClick={() => handleSortChange(option)}
              className={`flex items-start gap-3 cursor-pointer p-3 ${
                isActive
                  ? isDarkMode 
                    ? "bg-purple-900/30 text-purple-300" 
                    : "bg-purple-50 text-purple-700"
                  : isDarkMode
                    ? "text-slate-300 hover:bg-slate-700"
                    : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <OptionIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                isActive ? "" : isDarkMode ? "text-slate-500" : "text-gray-400"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {isActive && getSortIcon(option.direction)}
                </div>
                {option.description && (
                  <div className={`text-xs mt-0.5 ${
                    isActive 
                      ? isDarkMode ? "text-purple-400" : "text-purple-600"
                      : isDarkMode ? "text-slate-500" : "text-gray-500"
                  }`}>
                    {option.description}
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          )
        })}
        
        {/* Advanced sort options */}
        {showAdvanced && (
          <>
            <div className={`px-2 py-1 text-xs font-medium border-b border-t ${
              isDarkMode ? "text-slate-500 border-slate-700" : "text-gray-500 border-gray-200"
            }`}>
              Advanced Sorting
            </div>
            
            {advancedSortOptions.map((option, index) => {
              const isActive = sortBy.field === option.field && sortBy.direction === option.direction
              const OptionIcon = option.icon || ArrowUpDown
              
              return (
                <DropdownMenuItem
                  key={`advanced-${index}`}
                  onClick={() => handleSortChange(option)}
                  className={`flex items-start gap-3 cursor-pointer p-3 ${
                    isActive
                      ? isDarkMode 
                        ? "bg-purple-900/30 text-purple-300" 
                        : "bg-purple-50 text-purple-700"
                      : isDarkMode
                        ? "text-slate-300 hover:bg-slate-700"
                        : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <OptionIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    isActive ? "" : isDarkMode ? "text-slate-500" : "text-gray-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {isActive && getSortIcon(option.direction)}
                    </div>
                    {option.description && (
                      <div className={`text-xs mt-0.5 ${
                        isActive 
                          ? isDarkMode ? "text-purple-400" : "text-purple-600"
                          : isDarkMode ? "text-slate-500" : "text-gray-500"
                      }`}>
                        {option.description}
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}