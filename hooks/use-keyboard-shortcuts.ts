import { useEffect } from 'react'

interface KeyboardShortcuts {
  [key: string]: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts, deps: React.DependencyList = []) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Create a key combination string
      const modifiers = []
      if (e.ctrlKey || e.metaKey) modifiers.push('ctrl')
      if (e.shiftKey) modifiers.push('shift')
      if (e.altKey) modifiers.push('alt')
      
      const key = e.key.toLowerCase()
      const combination = [...modifiers, key].join('+')
      
      // Check if we have a handler for this combination
      if (shortcuts[combination]) {
        e.preventDefault()
        shortcuts[combination]()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, deps)
}

// Predefined shortcut combinations for POS
export const POS_SHORTCUTS = {
  SEARCH_FOCUS: 'ctrl+f',
  TOGGLE_FILTERS: 'ctrl+shift+f',
  ESCAPE: 'escape',
  CLEAR_SEARCH: 'ctrl+shift+x',
  QUICK_PAY: 'ctrl+p',
  NEW_CUSTOMER: 'ctrl+shift+c',
  PRINT_RECEIPT: 'ctrl+shift+p',
  TOGGLE_CART: 'ctrl+shift+k',
  
  // Quick filters
  FILTER_FEATURED: 'ctrl+1',
  FILTER_NEW: 'ctrl+2',
  FILTER_IN_STOCK: 'ctrl+3',
  FILTER_LOW_STOCK: 'ctrl+4',
  FILTER_OUT_OF_STOCK: 'ctrl+5',
  
  // Sort shortcuts
  SORT_NAME: 'ctrl+shift+n',
  SORT_PRICE: 'ctrl+shift+r',
  SORT_STOCK: 'ctrl+shift+s',
}