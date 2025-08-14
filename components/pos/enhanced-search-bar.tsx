"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Search, Filter, X, Zap, ScanLine, Clock, TrendingUp, Hash, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useInventoryStore } from "@/stores/inventory"

interface SearchSuggestion {
  id: string
  type: 'product' | 'category' | 'brand' | 'sku' | 'recent' | 'trending'
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  product?: {
    id: string
    name: string
    price: number
    stock: number
    image?: string
  }
  score?: number
}

interface EnhancedSearchBarProps {
  isDarkMode: boolean
  onFilterToggle: () => void
  onBarcodeSubmit?: (barcode: string) => void
  onScanStart?: () => void
  isScanning?: boolean
  showSuggestions?: boolean
}

export function EnhancedSearchBar({ 
  isDarkMode, 
  onFilterToggle, 
  onBarcodeSubmit,
  onScanStart,
  isScanning = false,
  showSuggestions = true
}: EnhancedSearchBarProps) {
  const {
    searchTerm,
    setSearchTerm,
    getActiveFilterCount,
    getResultsCount,
    clearAllFilters,
    getSearchSuggestions,
    addRecentSearch,
    clearRecentSearches
  } = useInventoryStore()

  const [isFocused, setIsFocused] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const activeFilterCount = getActiveFilterCount()
  const resultsCount = getResultsCount()

  // Generate search suggestions based on current input
  const searchSuggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      return getSearchSuggestions('')
    }
    return getSearchSuggestions(searchTerm)
  }, [searchTerm, getSearchSuggestions])

  // Update suggestions when search term changes
  useEffect(() => {
    if (showSuggestions && isFocused) {
      setSuggestions(searchSuggestions)
      setSelectedSuggestionIndex(-1)
    }
  }, [searchSuggestions, showSuggestions, isFocused])

  // Keyboard shortcuts and navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      
      // Ctrl/Cmd + Shift + F to toggle filters
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        onFilterToggle()
      }
      
      // Handle suggestion navigation when dropdown is open
      if (document.activeElement === inputRef.current && showDropdown && suggestions.length > 0) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            setSelectedSuggestionIndex(prev => 
              prev < suggestions.length - 1 ? prev + 1 : 0
            )
            break
          case 'ArrowUp':
            e.preventDefault()
            setSelectedSuggestionIndex(prev => 
              prev > 0 ? prev - 1 : suggestions.length - 1
            )
            break
          case 'Enter':
            e.preventDefault()
            if (selectedSuggestionIndex >= 0) {
              handleSuggestionSelect(suggestions[selectedSuggestionIndex])
            } else {
              handleSubmit(e)
            }
            break
          case 'Escape':
            setShowDropdown(false)
            setSelectedSuggestionIndex(-1)
            break
        }
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setSearchTerm('')
        setShowDropdown(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [setSearchTerm, onFilterToggle, showDropdown, suggestions, selectedSuggestionIndex])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTerm = searchTerm.trim()
    if (trimmedTerm) {
      if (onBarcodeSubmit) {
        onBarcodeSubmit(trimmedTerm)
      }
      addRecentSearch(trimmedTerm)
      setShowDropdown(false)
    }
  }

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'product':
        setSearchTerm(suggestion.product?.name || suggestion.value)
        if (onBarcodeSubmit && suggestion.product) {
          onBarcodeSubmit(suggestion.product.id)
        }
        break
      case 'category':
      case 'brand':
      case 'sku':
      case 'recent':
      case 'trending':
        setSearchTerm(suggestion.value)
        break
    }
    addRecentSearch(suggestion.value)
    setShowDropdown(false)
    setSelectedSuggestionIndex(-1)
    inputRef.current?.blur()
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    if (value.trim().length >= 1 && showSuggestions) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (showSuggestions && (searchTerm.trim().length >= 1 || suggestions.length > 0)) {
      setShowDropdown(true)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Delay hiding dropdown to allow for click events
    setTimeout(() => {
      setShowDropdown(false)
      setSelectedSuggestionIndex(-1)
    }, 150)
  }

  const handleClear = () => {
    setSearchTerm('')
    if (activeFilterCount > 0) {
      clearAllFilters()
    }
    setShowDropdown(false)
    setSelectedSuggestionIndex(-1)
    inputRef.current?.focus()
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product': return Package
      case 'category': return Package
      case 'brand': return Package
      case 'sku': return Hash
      case 'recent': return Clock
      case 'trending': return TrendingUp
      default: return Search
    }
  }

  const placeholderText = isFocused 
    ? "Search products, SKU, barcode, brand..."
    : "Search products or scan barcode..."

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        {/* Main Search Input */}
        <div className={`relative flex items-center border rounded-lg transition-all duration-300 ${
          isFocused 
            ? isDarkMode
              ? "border-purple-500 ring-2 ring-purple-500/20 bg-slate-800"
              : "border-purple-400 ring-2 ring-purple-400/20 bg-white"
            : isDarkMode
              ? "border-slate-600 bg-slate-800 hover:border-slate-500"
              : "border-gray-300 bg-white hover:border-gray-400"
        }`}>
          
          {/* Search Icon */}
          <div className="pl-3 pr-2">
            <Search className={`h-4 w-4 ${
              isFocused 
                ? "text-purple-500" 
                : isDarkMode 
                  ? "text-slate-400" 
                  : "text-gray-400"
            }`} />
          </div>

          {/* Input Field */}
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholderText}
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete="off"
            className={`border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:transition-all placeholder:duration-300 ${
              isDarkMode ? "text-white placeholder:text-slate-400" : "text-gray-900 placeholder:text-gray-500"
            }`}
          />

          {/* Action Buttons Container */}
          <div className="flex items-center gap-1 pr-2">
            
            {/* Results Count */}
            {(searchTerm || activeFilterCount > 0) && (
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-1 ${
                  isDarkMode 
                    ? "bg-slate-700 text-slate-300" 
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {resultsCount} result{resultsCount !== 1 ? 's' : ''}
              </Badge>
            )}

            {/* Filter Count Badge */}
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              >
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
              </Badge>
            )}

            {/* Clear Button */}
            {(searchTerm || activeFilterCount > 0) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className={`h-6 w-6 p-0 rounded-full hover:scale-110 transition-transform ${
                  isDarkMode 
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            {/* Scan Button */}
            {onScanStart && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onScanStart}
                disabled={isScanning}
                className={`h-8 px-2 ${
                  isScanning 
                    ? "cursor-not-allowed opacity-50" 
                    : "hover:scale-105 transition-transform"
                } ${
                  isDarkMode 
                    ? "text-green-400 hover:text-green-300 hover:bg-green-900/20" 
                    : "text-green-600 hover:text-green-700 hover:bg-green-50"
                }`}
                title="Scan barcode"
              >
                {isScanning ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <ScanLine className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Filter Toggle Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onFilterToggle}
              className={`h-8 px-2 relative hover:scale-105 transition-transform ${
                activeFilterCount > 0
                  ? isDarkMode
                    ? "text-purple-300 hover:text-purple-200 hover:bg-purple-900/20"
                    : "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  : isDarkMode
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              title="Toggle filters (Ctrl+Shift+F)"
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              )}
            </Button>

            {/* Submit Button for Barcode */}
            {searchTerm && onBarcodeSubmit && (
              <Button
                type="submit"
                size="sm"
                className={`h-8 px-3 font-medium ${
                  isDarkMode
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                <Zap className="h-3 w-3 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        {showDropdown && showSuggestions && suggestions.length > 0 && (
          <div 
            ref={dropdownRef}
            className={`absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-lg z-50 max-h-80 overflow-hidden ${
              isDarkMode 
                ? "bg-slate-800 border-slate-700" 
                : "bg-white border-gray-200"
            }`}
          >
            <div className="py-2">
              {suggestions.map((suggestion, index) => {
                const Icon = getSuggestionIcon(suggestion.type)
                const isSelected = index === selectedSuggestionIndex
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={`w-full px-4 py-2 text-left transition-colors duration-150 flex items-center gap-3 hover:bg-opacity-80 ${
                      isSelected
                        ? isDarkMode
                          ? "bg-slate-700 text-white"
                          : "bg-gray-100 text-gray-900"
                        : isDarkMode
                          ? "text-slate-300 hover:bg-slate-700"
                          : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${
                      suggestion.type === 'recent' 
                        ? "text-gray-400" 
                        : suggestion.type === 'trending'
                          ? "text-green-500"
                          : "text-purple-500"
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{suggestion.label}</span>
                        {suggestion.type !== 'recent' && suggestion.type !== 'trending' && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-1.5 py-0.5 capitalize"
                          >
                            {suggestion.type}
                          </Badge>
                        )}
                      </div>
                      
                      {suggestion.product && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>${suggestion.product.price}</span>
                          <span>•</span>
                          <span>{suggestion.product.stock} in stock</span>
                        </div>
                      )}
                    </div>

                    {suggestion.score && (
                      <div className="text-xs text-muted-foreground">
                        {Math.round(suggestion.score * 100)}%
                      </div>
                    )}
                  </button>
                )
              })}
              
              {/* Clear recent searches */}
              {suggestions.some(s => s.type === 'recent') && (
                <div className="border-t mt-2 pt-2">
                  <button
                    onClick={() => {
                      clearRecentSearches()
                      setShowDropdown(false)
                    }}
                    className={`w-full px-4 py-1 text-xs text-left transition-colors ${
                      isDarkMode
                        ? "text-slate-400 hover:text-slate-300"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Clear recent searches
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Tips (when focused and empty) */}
        {isFocused && !searchTerm && !showDropdown && (
          <div className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-lg border shadow-lg z-10 ${
            isDarkMode 
              ? "bg-slate-800 border-slate-700 text-slate-300" 
              : "bg-white border-gray-200 text-gray-600"
          }`}>
            <div className="text-sm space-y-1">
              <div className="font-medium mb-2">Search tips:</div>
              <div className="flex flex-wrap gap-4 text-xs">
                <span>• Product names</span>
                <span>• SKU codes</span>
                <span>• Barcodes</span>
                <span>• Brand names</span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs mt-2 pt-2 border-t border-current/20">
                <span><kbd className="px-1 py-0.5 bg-current/10 rounded">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1 py-0.5 bg-current/10 rounded">Enter</kbd> Select</span>
                <span><kbd className="px-1 py-0.5 bg-current/10 rounded">Esc</kbd> Clear</span>
                <span><kbd className="px-1 py-0.5 bg-current/10 rounded">Ctrl+F</kbd> Focus</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}