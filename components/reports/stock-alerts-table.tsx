"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package } from "lucide-react"
import { Product } from "@/types"

interface StockAlertsTableProps {
  lowStock?: Product[]
  outOfStock?: Product[]
}

export function StockAlertsTable({ lowStock = [], outOfStock = [] }: StockAlertsTableProps) {
  const combinedAlerts = [
    ...outOfStock.map(product => ({ ...product, alertType: 'out' as const })),
    ...lowStock.map(product => ({ ...product, alertType: 'low' as const }))
  ]

  if (combinedAlerts.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">All stock levels are healthy!</p>
        <p className="text-xs text-slate-500 mt-1">No alerts at this time</p>
      </div>
    )
  }

  const getAlertBadge = (alertType: 'out' | 'low', stock: number) => {
    if (alertType === 'out') {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
    }
    return <Badge variant="secondary" className="text-xs">Low Stock ({stock})</Badge>
  }

  const getAlertIcon = (alertType: 'out' | 'low') => {
    return (
      <AlertTriangle 
        className={`h-4 w-4 ${
          alertType === 'out' ? 'text-red-500' : 'text-yellow-500'
        }`} 
      />
    )
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {combinedAlerts.slice(0, 10).map((product) => (
        <div
          key={product.id}
          className={`p-3 rounded-lg border ${
            product.alertType === 'out' 
              ? 'border-red-200 bg-red-50' 
              : 'border-yellow-200 bg-yellow-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getAlertIcon(product.alertType)}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-sm">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getAlertBadge(product.alertType, product.stock)}
                  <span className="text-xs text-slate-500">
                    Min: {product.minStock || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className={`text-xs ${
                product.alertType === 'out'
                  ? 'border-red-300 text-red-700 hover:bg-red-100'
                  : 'border-yellow-300 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              Restock
            </Button>
          </div>
        </div>
      ))}
      
      {combinedAlerts.length > 10 && (
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-slate-500">
            Showing 10 of {combinedAlerts.length} alerts
          </p>
          <Button variant="outline" size="sm" className="mt-2 text-xs">
            View All Alerts
          </Button>
        </div>
      )}
    </div>
  )
}