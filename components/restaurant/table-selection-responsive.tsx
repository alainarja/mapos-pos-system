"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTablesStore, Reservation } from "@/stores/tables"
import { useCartStore } from "@/stores/cart"
import { 
  Users, 
  Clock,
  X,
  CalendarDays,
  Phone,
  Mail,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"

interface TableSelectionResponsiveProps {
  onClose: () => void
  onTableSelect: (tableId: string) => void
}

const TableSelectionResponsive: React.FC<TableSelectionResponsiveProps> = ({ onClose, onTableSelect }) => {
  const {
    floorPlan,
    tableCarts,
    activeTableId,
    setActiveTable,
    getTableCart,
    createTableCart,
    clearTableCart,
    updateTableStatus,
    addReservation,
    cancelReservation,
    getUpcomingReservations,
    checkTableAvailability
  } = useTablesStore()
  
  const cartStore = useCartStore()
  const [showNewTableDialog, setShowNewTableDialog] = useState(false)
  const [showReservationDialog, setShowReservationDialog] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [guestCount, setGuestCount] = useState(2)
  
  // Reservation form state
  const [reservationForm, setReservationForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '19:00',
    duration: 120,
    partySize: 2,
    notes: ''
  })
  
  const upcomingReservations = getUpcomingReservations()
  
  const handleTableClick = (table: any) => {
    const cart = getTableCart(table.id)
    
    if (table.status === 'available' && !cart) {
      setSelectedTable(table.id)
      setShowNewTableDialog(true)
    } else if (table.status === 'reserved') {
      // Show reservation details
      setSelectedTable(table.id)
      setShowReservationDialog(true)
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
  
  const handleCreateReservation = () => {
    if (!selectedTable) return
    
    const isAvailable = checkTableAvailability(
      selectedTable,
      new Date(reservationForm.date),
      reservationForm.time,
      reservationForm.duration
    )
    
    if (!isAvailable) {
      alert('Table not available at this time')
      return
    }
    
    addReservation({
      tableId: selectedTable,
      customerName: reservationForm.customerName,
      customerPhone: reservationForm.customerPhone,
      customerEmail: reservationForm.customerEmail,
      date: new Date(reservationForm.date),
      time: reservationForm.time,
      duration: reservationForm.duration,
      partySize: reservationForm.partySize,
      notes: reservationForm.notes,
      status: 'confirmed'
    })
    
    setShowReservationDialog(false)
    setReservationForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '19:00',
      duration: 120,
      partySize: 2,
      notes: ''
    })
  }
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'available': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'occupied': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'reserved': return <CalendarDays className="w-4 h-4 text-yellow-500" />
      case 'cleaning': return <Clock className="w-4 h-4 text-blue-500" />
      default: return null
    }
  }
  
  return (
    <>
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <CardTitle className="text-lg md:text-xl">Table Management</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="tables" className="w-full">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="tables" className="flex-1">Tables</TabsTrigger>
              <TabsTrigger value="reservations" className="flex-1">
                Reservations
                {upcomingReservations.length > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {upcomingReservations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tables" className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {floorPlan.tables.map(table => {
                  const cart = getTableCart(table.id)
                  const isActive = activeTableId === table.id
                  
                  return (
                    <div
                      key={table.id}
                      onClick={() => handleTableClick(table)}
                      className={cn(
                        "relative p-3 rounded-lg border-2 cursor-pointer transition-all",
                        table.status === 'available' && "bg-green-50 border-green-300 hover:bg-green-100",
                        table.status === 'occupied' && "bg-red-50 border-red-300 hover:bg-red-100",
                        table.status === 'reserved' && "bg-yellow-50 border-yellow-300 hover:bg-yellow-100",
                        table.status === 'cleaning' && "bg-blue-50 border-blue-300",
                        isActive && "ring-2 ring-primary"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-base">T{table.number}</span>
                        {getStatusIcon(table.status)}
                      </div>
                      
                      {cart ? (
                        <>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {cart.guestCount}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(cart.startTime), { addSuffix: false })}
                          </div>
                          <div className="text-sm font-semibold mt-1">
                            ${cart.total.toFixed(2)}
                          </div>
                        </>
                      ) : table.reservation ? (
                        <>
                          <div className="text-xs text-muted-foreground">
                            {table.reservation.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {table.reservation.time}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          {table.seats} seats
                        </div>
                      )}
                      
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
                    </div>
                  )
                })}
              </div>
              
              {floorPlan.tables.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No tables configured</p>
                  <p className="text-sm mt-2">Configure tables to get started</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reservations" className="p-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {upcomingReservations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No upcoming reservations</p>
                    </div>
                  ) : (
                    upcomingReservations.map(reservation => {
                      const table = floorPlan.tables.find(t => t.id === reservation.tableId)
                      return (
                        <Card key={reservation.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold">
                                Table {table?.number} - {reservation.customerName}
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="w-3 h-3" />
                                  {format(new Date(reservation.date), 'MMM dd, yyyy')}
                                  at {reservation.time}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-3 h-3" />
                                  {reservation.partySize} guests
                                </div>
                                {reservation.customerPhone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    {reservation.customerPhone}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge 
                                variant={
                                  reservation.status === 'confirmed' ? 'default' :
                                  reservation.status === 'pending' ? 'secondary' :
                                  'destructive'
                                }
                                className="text-xs"
                              >
                                {reservation.status}
                              </Badge>
                              {reservation.status === 'confirmed' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => cancelReservation(reservation.id)}
                                  className="h-6 text-xs"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
              
              <Button
                className="w-full mt-4"
                onClick={() => {
                  setSelectedTable(floorPlan.tables[0]?.id || null)
                  setShowReservationDialog(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Reservation
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Start Table Dialog */}
      <Dialog open={showNewTableDialog} onOpenChange={setShowNewTableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Start Table {selectedTable && floorPlan.tables.find(t => t.id === selectedTable)?.number}
            </DialogTitle>
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
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowNewTableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartTable}>
              Start Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reservation Dialog */}
      <Dialog open={showReservationDialog} onOpenChange={setShowReservationDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Reservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Table</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedTable || ''}
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  {floorPlan.tables.map(table => (
                    <option key={table.id} value={table.id}>
                      Table {table.number} ({table.seats} seats)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Party Size</Label>
                <Input
                  type="number"
                  value={reservationForm.partySize}
                  onChange={(e) => setReservationForm({...reservationForm, partySize: parseInt(e.target.value)})}
                  min={1}
                  max={20}
                />
              </div>
            </div>
            
            <div>
              <Label>Customer Name*</Label>
              <Input
                value={reservationForm.customerName}
                onChange={(e) => setReservationForm({...reservationForm, customerName: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone*</Label>
                <Input
                  type="tel"
                  value={reservationForm.customerPhone}
                  onChange={(e) => setReservationForm({...reservationForm, customerPhone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={reservationForm.customerEmail}
                  onChange={(e) => setReservationForm({...reservationForm, customerEmail: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={reservationForm.date}
                  onChange={(e) => setReservationForm({...reservationForm, date: e.target.value})}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={reservationForm.time}
                  onChange={(e) => setReservationForm({...reservationForm, time: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label>Duration (minutes)</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={reservationForm.duration}
                onChange={(e) => setReservationForm({...reservationForm, duration: parseInt(e.target.value)})}
              >
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={150}>2.5 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
            
            <div>
              <Label>Notes</Label>
              <Input
                value={reservationForm.notes}
                onChange={(e) => setReservationForm({...reservationForm, notes: e.target.value})}
                placeholder="Special requests, allergies, etc."
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowReservationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateReservation}
              disabled={!reservationForm.customerName || !reservationForm.customerPhone}
            >
              Create Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TableSelectionResponsive