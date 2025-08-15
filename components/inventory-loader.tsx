'use client'

import { useEffect } from 'react'
import { useInventoryStore } from '@/stores/inventory'

export function InventoryLoader() {
  const loadInitialData = useInventoryStore((state) => state.loadInitialData)

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  return null
}