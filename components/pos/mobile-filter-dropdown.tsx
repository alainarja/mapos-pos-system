"use client"

import React, { useState } from "react"
import { Filter, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useInventoryStore } from "@/stores/inventory"
import { ProductFilterSidebar } from "./product-filter-sidebar"

interface MobileFilterDropdownProps {
  isDarkMode: boolean
}

export function MobileFilterDropdown({ isDarkMode }: MobileFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { getActiveFilterCount } = useInventoryStore()
  
  const activeFilterCount = getActiveFilterCount()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 relative ${
            activeFilterCount > 0
              ? isDarkMode
                ? "border-purple-500 text-purple-300"
                : "border-purple-500 text-purple-700"
              : isDarkMode
                ? "border-slate-600 text-slate-300"
                : "border-gray-300 text-gray-700"
          }`}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-1 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            >
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3" />
          
          {/* Active indicator dot */}
          {activeFilterCount > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className={`w-full sm:w-80 p-0 ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="h-full">
          <ProductFilterSidebar
            isOpen={true}
            onClose={() => setIsOpen(false)}
            isDarkMode={isDarkMode}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}