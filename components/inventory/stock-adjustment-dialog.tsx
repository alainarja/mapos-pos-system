"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/types"
import { useInventoryStore } from "@/stores/inventory"
import { Plus, Minus, Package } from "lucide-react"
import Image from "next/image"

interface StockAdjustmentDialogProps {
  open: boolean
  onClose: () => void
  product?: Product | null
}

export function StockAdjustmentDialog({ open, onClose, product }: StockAdjustmentDialogProps) {
  const { updateStock } = useInventoryStore()
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add')
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setAdjustmentType('add')
      setQuantity(0)
      setReason('')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || quantity <= 0) return

    setIsLoading(true)

    try {
      updateStock(product.id, quantity, adjustmentType)
      
      // In a real app, you'd also log this adjustment to an audit trail
      console.log(`Stock adjustment for ${product.name}: ${adjustmentType} ${quantity}, reason: ${reason}`)
      
      onClose()
    } catch (error) {
      console.error('Error adjusting stock:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNewStockLevel = () => {
    if (!product) return 0
    
    switch (adjustmentType) {
      case 'add':
        return product.stock + quantity
      case 'subtract':
        return Math.max(0, product.stock - quantity)
      case 'set':
        return Math.max(0, quantity)
      default:
        return product.stock
    }
  }

  const getStockStatus = (stock: number) => {
    if (!product) return 'unknown'
    if (stock === 0) return 'out'
    if (product.minStock && stock <= product.minStock) return 'low'
    return 'good'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'out':
        return <Badge variant="destructive">Out of Stock</Badge>
      case 'low':
        return <Badge variant="secondary">Low Stock</Badge>
      case 'good':
        return <Badge variant="default">Good Stock</Badge>
      default:
        return null
    }
  }

  if (!product) return null

  const newStock = getNewStockLevel()
  const currentStatus = getStockStatus(product.stock)
  const newStatus = getStockStatus(newStock)

  return (
    <Dialog open={open} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Stock Adjustment</DialogTitle>
        </DialogHeader>
        
        {/* Product Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500">Current Stock: {product.stock}</span>
                  {getStatusBadge(currentStatus)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <Select
              value={adjustmentType}
              onValueChange={(value: 'add' | 'subtract' | 'set') => setAdjustmentType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    Add Stock (Receiving)
                  </div>
                </SelectItem>
                <SelectItem value="subtract">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-red-600" />
                    Subtract Stock (Damage/Loss)
                  </div>
                </SelectItem>
                <SelectItem value="set">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    Set Stock (Count Adjustment)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {adjustmentType === 'set' ? 'New Stock Level' : 'Quantity'} *
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder={adjustmentType === 'set' ? 'Enter new stock level' : 'Enter quantity'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select
              value={reason}
              onValueChange={setReason}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {adjustmentType === 'add' && (
                  <>
                    <SelectItem value="receiving">New Stock Received</SelectItem>
                    <SelectItem value="return">Customer Return</SelectItem>
                    <SelectItem value="found">Found Stock</SelectItem>
                    <SelectItem value="correction">Count Correction</SelectItem>
                  </>
                )}
                {adjustmentType === 'subtract' && (
                  <>
                    <SelectItem value="damage">Damaged Items</SelectItem>
                    <SelectItem value="expired">Expired Items</SelectItem>
                    <SelectItem value="theft">Theft/Loss</SelectItem>
                    <SelectItem value="sample">Sample/Demo</SelectItem>
                    <SelectItem value="correction">Count Correction</SelectItem>
                  </>
                )}
                {adjustmentType === 'set' && (
                  <>
                    <SelectItem value="count">Physical Count</SelectItem>
                    <SelectItem value="audit">Inventory Audit</SelectItem>
                    <SelectItem value="correction">System Correction</SelectItem>
                  </>
                )}
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stock Preview */}
          {quantity > 0 && (
            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">Stock Level Preview</h4>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-slate-600">Current: </span>
                    <span className="font-semibold">{product.stock}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">New: </span>
                    <span className="font-semibold">{newStock}</span>
                    {newStatus !== currentStatus && (
                      <span className="ml-2">{getStatusBadge(newStatus)}</span>
                    )}
                  </div>
                </div>
                {adjustmentType !== 'set' && (
                  <div className="text-sm text-slate-600 mt-1">
                    {adjustmentType === 'add' ? 'Adding' : 'Subtracting'} {quantity} {product.unit || 'units'}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || quantity <= 0}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              {isLoading ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}