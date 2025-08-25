"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTablesStore } from "@/stores/tables"
import { useCartStore } from "@/stores/cart"
import { 
  Users, 
  Clock,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface TableSelectionSimpleProps {
  onClose: () => void
  onTableSelect: (tableId: string) => void
}

const TableSelectionSimple: React.FC<TableSelectionSimpleProps> = ({ onClose, onTableSelect }) => {
  const {
    floorPlan,
    tableCarts,
    activeTableId,
    setActiveTable,
    getTableCart,
    createTableCart,
    clearTableCart,
    updateTableStatus
  } = useTablesStore()
  
  const cartStore = useCartStore()
  const [showNewTableDialog, setShowNewTableDialog] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [guestCount, setGuestCount] = useState(2)
  
  const handleTableClick = (table: any) => {
    const cart = getTableCart(table.id)
    
    if (table.status === 'available' && !cart) {
      setSelectedTable(table.id)
      setShowNewTableDialog(true)
    } else if (cart) {
      // Load table cart into main cart
      cartStore.clearCart()
      cart.items.forEach((item: any) => {
        cartStore.addItem(item, item.quantity)
      })
      
      setActiveTable(table.id)
      onTableSelect(table.id)
      onClose()
    }
  }
  
  const handleStartTable = () => {
    if (!selectedTable) return
    
    const table = floorPlan.tables.find(t => t.id === selectedTable)
    if (!table) return
    
    createTableCart(selectedTable, `Table ${table.number}`, 'Staff', guestCount)
    updateTableStatus(selectedTable, 'occupied')
    setActiveTable(selectedTable)
    onTableSelect(selectedTable)
    
    setShowNewTableDialog(false)
    onClose()
  }
  
  const handleClearTable = (tableId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Clear this table?')) return
    
    clearTableCart(tableId)
    updateTableStatus(tableId, 'available')
  }
  
  return (
    <>
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Select Table</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
            {floorPlan.tables.map(table => {
              const cart = getTableCart(table.id)
              const isActive = activeTableId === table.id
              
              return (
                <div
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={cn(
                    "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                    table.status === 'available' && "bg-green-50 border-green-300 hover:bg-green-100",
                    table.status === 'occupied' && "bg-red-50 border-red-300 hover:bg-red-100",
                    table.status === 'reserved' && "bg-yellow-50 border-yellow-300",
                    table.status === 'cleaning' && "bg-blue-50 border-blue-300",
                    isActive && "ring-2 ring-primary"
                  )}
                >
                  <div className="font-bold text-lg">Table {table.number}</div>
                  
                  {cart ? (
                    <>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3" />
                        {cart.guestCount || table.seats} guests
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(cart.startTime), { addSuffix: false })}
                      </div>
                      <div className="text-sm font-semibold mt-1">
                        ${cart.total.toFixed(2)}
                      </div>
                      {table.status === 'occupied' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={(e) => handleClearTable(table.id, e)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-1">
                      {table.seats} seats • Available
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {floorPlan.tables.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tables configured. Please configure tables first.
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showNewTableDialog} onOpenChange={setShowNewTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Table {selectedTable && floorPlan.tables.find(t => t.id === selectedTable)?.number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Number of Guests</Label>
              <Input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value))}
                min={1}
                max={20}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartTable}>
              Start Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TableSelectionSimple