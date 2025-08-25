"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTablesStore, Table, TableCart } from "@/stores/tables"
import { useCartStore } from "@/stores/cart"
import { formatDistanceToNow } from "date-fns"
import { 
  Users, 
  Clock, 
  DollarSign,
  Settings,
  ChefHat,
  User,
  Plus,
  Edit,
  ArrowRight,
  Trash2,
  Receipt,
  CreditCard,
  MoveHorizontal,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Coffee,
  Utensils
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TableSelectionProps {
  onTableSelect?: (tableId: string) => void
  currentUser?: string
}

const TableSelection: React.FC<TableSelectionProps> = ({ onTableSelect, currentUser = "Staff" }) => {
  const {
    floorPlan,
    tableCarts,
    activeTableId,
    setActiveTable,
    getTableCart,
    createTableCart,
    updateTableCart,
    clearTableCart,
    transferTable,
    updateTableStatus,
    getTableOccupancyRate,
    getAverageTableTime,
    getTotalRevenue
  } = useTablesStore()
  
  const cartStore = useCartStore()
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [showNewTableDialog, setShowNewTableDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [transferFromTable, setTransferFromTable] = useState<string | null>(null)
  const [guestCount, setGuestCount] = useState(2)
  const [serverName, setServerName] = useState(currentUser)
  const [tableNotes, setTableNotes] = useState("")
  
  const handleTableClick = (table: Table) => {
    const cart = getTableCart(table.id)
    
    if (table.status === 'available' && !cart) {
      setSelectedTable(table.id)
      setShowNewTableDialog(true)
    } else if (cart) {
      setActiveTable(table.id)
      onTableSelect?.(table.id)
    }
  }
  
  const handleStartNewTable = () => {
    if (!selectedTable) return
    
    const table = floorPlan.tables.find(t => t.id === selectedTable)
    if (!table) return
    
    createTableCart(selectedTable, `Table ${table.number}`, serverName, guestCount)
    updateTableStatus(selectedTable, 'occupied')
    setActiveTable(selectedTable)
    onTableSelect?.(selectedTable)
    
    setShowNewTableDialog(false)
    setSelectedTable(null)
    setGuestCount(2)
    setTableNotes("")
  }
  
  const handleClearTable = (tableId: string) => {
    if (!confirm('Are you sure you want to clear this table? This action cannot be undone.')) return
    
    clearTableCart(tableId)
    updateTableStatus(tableId, 'cleaning')
    
    // Set to available after a delay (simulating cleaning time)
    setTimeout(() => {
      updateTableStatus(tableId, 'available')
    }, 2000)
  }
  
  const handleTransferTable = (toTableId: string) => {
    if (!transferFromTable) return
    
    transferTable(transferFromTable, toTableId)
    setShowTransferDialog(false)
    setTransferFromTable(null)
  }
  
  const renderTableCard = (table: Table) => {
    const cart = getTableCart(table.id)
    const isActive = activeTableId === table.id
    
    const statusColors = {
      available: 'border-emerald-500 bg-emerald-500/10',
      occupied: 'border-red-500 bg-red-500/10',
      reserved: 'border-amber-500 bg-amber-500/10',
      cleaning: 'border-blue-500 bg-blue-500/10'
    }
    
    const statusIcons = {
      available: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      occupied: <Loader2 className="w-4 h-4 text-red-500 animate-spin" />,
      reserved: <Clock className="w-4 h-4 text-amber-500" />,
      cleaning: <AlertCircle className="w-4 h-4 text-blue-500" />
    }
    
    return (
      <motion.div
        key={table.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={cn(
            "cursor-pointer transition-all",
            statusColors[table.status],
            isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            "hover:shadow-lg"
          )}
          onClick={() => handleTableClick(table)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Table {table.number}
                {statusIcons[table.status]}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {cart?.guestCount || table.seats}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {cart ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Server:</span>
                  <span className="font-medium">{cart.server || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(cart.startTime), { addSuffix: false })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium">{cart.items.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">${cart.total.toFixed(2)}</span>
                </div>
                {cart.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">{cart.notes}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-xs text-muted-foreground mt-1">{table.seats} seats</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }
  
  const occupancyRate = getTableOccupancyRate()
  const avgTableTime = getAverageTableTime()
  const totalRevenue = getTotalRevenue()
  
  return (
    <div className="h-full flex flex-col gap-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Occupancy</p>
                <p className="text-2xl font-bold">{occupancyRate.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold">{avgTableTime.toFixed(0)}m</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Tables</p>
                <p className="text-2xl font-bold">{Array.from(tableCarts.values()).length}</p>
              </div>
              <Utensils className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Table Grid */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Restaurant Floor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                Available
              </Badge>
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                Occupied
              </Badge>
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
                Cleaning
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {floorPlan.tables.map(renderTableCard)}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* New Table Dialog */}
      <Dialog open={showNewTableDialog} onOpenChange={setShowNewTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Server Name</Label>
              <Input
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="Enter server name"
              />
            </div>
            <div>
              <Label>Number of Guests</Label>
              <Select value={guestCount.toString()} onValueChange={(v) => setGuestCount(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'Guest' : 'Guests'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input
                value={tableNotes}
                onChange={(e) => setTableNotes(e.target.value)}
                placeholder="Special requests, allergies, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartNewTable}>
              <Plus className="w-4 h-4 mr-2" />
              Start Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Transfer Table Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select a table to transfer the current order to:
            </p>
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-2">
                {floorPlan.tables
                  .filter(t => t.status === 'available' && t.id !== transferFromTable)
                  .map(table => (
                    <Button
                      key={table.id}
                      variant="outline"
                      onClick={() => handleTransferTable(table.id)}
                      className="justify-start"
                    >
                      <MoveHorizontal className="w-4 h-4 mr-2" />
                      Table {table.number}
                    </Button>
                  ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TableSelection