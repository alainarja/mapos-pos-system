"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTablesStore, Table } from "@/stores/tables"
import { 
  Plus,
  Trash2,
  Settings,
  Grid3x3,
  Save
} from "lucide-react"
import { cn } from "@/lib/utils"

const TableConfigurationSimple = () => {
  const {
    floorPlan,
    addTable,
    updateTable,
    removeTable,
    moveTable,
    resetFloorPlan,
    loadPresetLayout
  } = useTablesStore()
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState(floorPlan.tables.length + 1)
  const [newTableSeats, setNewTableSeats] = useState(4)

  const handleTableClick = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation()
    setSelectedTable(tableId)
  }
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / 60)
    const y = Math.floor((e.clientY - rect.top) / 60)
    
    if (!selectedTable) {
      addTable({
        number: newTableNumber,
        seats: newTableSeats,
        position: { x, y },
        shape: 'round',
        status: 'available',
        size: 'medium'
      })
      setNewTableNumber(prev => prev + 1)
    }
  }
  
  const handleDragStart = (e: React.DragEvent, tableId: string) => {
    e.dataTransfer.effectAllowed = 'move'
    setSelectedTable(tableId)
    setIsDragging(true)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!selectedTable) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / 60)
    const y = Math.floor((e.clientY - rect.top) / 60)
    
    moveTable(selectedTable, { x, y })
    setIsDragging(false)
  }
  
  const renderTable = (table: Table) => {
    const x = table.position.x * 60
    const y = table.position.y * 60
    
    const statusColors = {
      available: 'bg-green-500 hover:bg-green-600 text-white',
      occupied: 'bg-red-500 hover:bg-red-600 text-white',
      reserved: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      cleaning: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
    
    return (
      <div
        key={table.id}
        draggable
        onDragStart={(e) => handleDragStart(e, table.id)}
        onClick={(e) => handleTableClick(e, table.id)}
        className={cn(
          "absolute w-12 h-12 rounded-full flex flex-col items-center justify-center cursor-move select-none transition-all",
          statusColors[table.status],
          selectedTable === table.id && "ring-2 ring-offset-2 ring-black"
        )}
        style={{ left: x, top: y }}
      >
        <span className="font-bold text-sm">{table.number}</span>
        <span className="text-xs">{table.seats}p</span>
      </div>
    )
  }
  
  return (
    <div className="h-full flex gap-4">
      {/* Controls */}
      <Card className="w-64">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Table Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>New Table Number</Label>
            <Input
              type="number"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(parseInt(e.target.value))}
            />
          </div>
          
          <div>
            <Label>Seats</Label>
            <Input
              type="number"
              value={newTableSeats}
              onChange={(e) => setNewTableSeats(parseInt(e.target.value))}
              min={1}
              max={12}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Click on the canvas to add a table
          </div>
          
          {selectedTable && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium">
                Selected: Table {floorPlan.tables.find(t => t.id === selectedTable)?.number}
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => {
                  removeTable(selectedTable)
                  setSelectedTable(null)
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Table
              </Button>
            </div>
          )}
          
          <div className="space-y-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => loadPresetLayout('small')}
            >
              Load Small Layout (10 tables)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => loadPresetLayout('medium')}
            >
              Load Medium Layout (15 tables)
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => {
                if (confirm('Clear all tables?')) {
                  resetFloorPlan()
                  setSelectedTable(null)
                }
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Canvas */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            Floor Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative w-full h-[500px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            onClick={handleCanvasClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {floorPlan.tables.map(renderTable)}
            
            {floorPlan.tables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Plus className="w-12 h-12 mx-auto mb-2" />
                  <p>Click to add tables</p>
                  <p className="text-sm">or load a preset layout</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Cleaning</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TableConfigurationSimple