'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, RefreshCw, Store, Warehouse } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCartStore } from '@/stores/cart'
import { storeIdentificationService, StoreLocation } from '@/lib/services/store-identification-service'

interface StoreSelectorProps {
  onClose?: () => void
}

export function StoreSelector({ onClose }: StoreSelectorProps) {
  const { currentStore, setCurrentStore, refreshStore } = useCartStore()
  const [availableStores, setAvailableStores] = useState<StoreLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<string>('')

  useEffect(() => {
    loadStores()
    setSelectedStoreId(currentStore?.id || '')
  }, [currentStore])

  const loadStores = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const stores = await storeIdentificationService.getAvailableStores()
      setAvailableStores(stores)
    } catch (err) {
      setError('Failed to load available stores')
      console.error('Error loading stores:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      await refreshStore()
      await loadStores()
    } catch (err) {
      setError('Failed to refresh store data')
      console.error('Error refreshing stores:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleStoreChange = async (storeId: string) => {
    try {
      setError(null)
      await setCurrentStore(storeId)
      setSelectedStoreId(storeId)
      if (onClose) {
        setTimeout(onClose, 500) // Brief delay to show selection
      }
    } catch (err) {
      setError('Failed to set store')
      console.error('Error setting store:', err)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Store Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading stores...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Store Selection
        </CardTitle>
        {currentStore && (
          <div className="text-sm text-muted-foreground">
            Current: {currentStore.name} ({currentStore.code})
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Store/Location:</label>
          <Select
            value={selectedStoreId}
            onValueChange={handleStoreChange}
            disabled={isRefreshing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a store..." />
            </SelectTrigger>
            <SelectContent>
              {availableStores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{store.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {store.code} • {store.warehouseName}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentStore && (
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Store Information</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Store className="h-3 w-3" />
                Active
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div><strong>Name:</strong> {currentStore.name}</div>
              <div><strong>Code:</strong> {currentStore.code}</div>
              <div className="flex items-center gap-1">
                <Warehouse className="h-3 w-3" />
                <strong>Warehouse:</strong> {currentStore.warehouseName}
              </div>
              <div><strong>Address:</strong> {currentStore.address}</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="secondary" className="flex-1">
              Close
            </Button>
          )}
        </div>

        {!currentStore && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a store to enable proper transaction tracking for inventory and CRM systems.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}