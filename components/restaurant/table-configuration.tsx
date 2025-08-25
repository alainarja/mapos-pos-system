"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTablesStore, Table } from "@/stores/tables"
import { 
  Square, 
  Circle, 
  RectangleHorizontal,
  Plus,
  Trash2,
  RotateCw,
  Grid3x3,
  Save,
  Download,
  Upload,
  Layers,
  Settings,
  Home,
  Users,
  Clock,
  TrendingUp,
  ChefHat,
  Utensils,
  Wine,
  Coffee
} from "lucide-react"
import { cn } from "@/lib/utils"

const TableConfigurationInterface = () => {
  const {
    floorPlan,
    addTable,
    updateTable,
    removeTable,
    moveTable,
    updateFloorPlanSize,
    resetFloorPlan,
    loadPresetLayout,
    getOccupiedTables,
    getAvailableTables,
    getTableOccupancyRate
  } = useTablesStore()
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // New table form state
  const [newTableForm, setNewTableForm] = useState({
    number: floorPlan.tables.length + 1,
    seats: 4,
    shape: 'round' as Table['shape'],
    size: 'medium' as Table['size']
  })

  const handleTableMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.preventDefault()
    setSelectedTable(tableId)
    setIsDragging(true)
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedTable || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    let x = (e.clientX - rect.left) / floorPlan.cellSize
    let y = (e.clientY - rect.top) / floorPlan.cellSize
    
    if (snapToGrid) {
      x = Math.round(x)
      y = Math.round(y)
    }
    
    x = Math.max(0, Math.min(x, floorPlan.gridSize.width - 1))
    y = Math.max(0, Math.min(y, floorPlan.gridSize.height - 1))
    
    moveTable(selectedTable, { x, y })
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const addNewTable = () => {
    const centerX = Math.floor(floorPlan.gridSize.width / 2)
    const centerY = Math.floor(floorPlan.gridSize.height / 2)
    
    addTable({
      number: newTableForm.number,
      seats: newTableForm.seats,
      position: { x: centerX, y: centerY },
      shape: newTableForm.shape,
      status: 'available',
      size: newTableForm.size
    })
    
    setNewTableForm(prev => ({ ...prev, number: prev.number + 1 }))
  }
  
  const renderTable = (table: Table) => {
    const { cellSize } = floorPlan
    const x = table.position.x * cellSize
    const y = table.position.y * cellSize
    
    const sizeMultiplier = {
      small: 0.8,
      medium: 1,
      large: 1.3
    }[table.size || 'medium']
    
    const baseSize = cellSize * sizeMultiplier
    
    const statusColors = {
      available: 'bg-emerald-500 hover:bg-emerald-600',
      occupied: 'bg-red-500 hover:bg-red-600',
      reserved: 'bg-amber-500 hover:bg-amber-600',
      cleaning: 'bg-blue-500 hover:bg-blue-600'
    }
    
    const shapes = {
      square: (
        <rect
          width={baseSize * 0.9}
          height={baseSize * 0.9}
          rx={4}
          className={cn("transition-all cursor-move", statusColors[table.status])}
        />
      ),
      round: (
        <circle
          r={baseSize * 0.45}
          cx={baseSize * 0.45}
          cy={baseSize * 0.45}
          className={cn("transition-all cursor-move", statusColors[table.status])}
        />
      ),
      rectangle: (
        <rect
          width={baseSize * 1.3}
          height={baseSize * 0.7}
          rx={4}
          className={cn("transition-all cursor-move", statusColors[table.status])}
        />
      )
    }
    
    return (
      <g
        key={table.id}
        transform={`translate(${x}, ${y}) rotate(${table.rotation || 0} ${baseSize/2} ${baseSize/2})`}
        onMouseDown={(e) => handleTableMouseDown(e as any, table.id)}
        className="group"
      >
        {shapes[table.shape]}
        <text
          x={table.shape === 'rectangle' ? baseSize * 0.65 : baseSize * 0.45}
          y={table.shape === 'rectangle' ? baseSize * 0.35 : baseSize * 0.45}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white font-bold text-sm pointer-events-none select-none"
        >
          {table.number}
        </text>
        <text
          x={table.shape === 'rectangle' ? baseSize * 0.65 : baseSize * 0.45}
          y={table.shape === 'rectangle' ? baseSize * 0.5 : baseSize * 0.6}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-xs pointer-events-none select-none"
        >
          {table.seats}p
        </text>
        {selectedTable === table.id && (
          <rect
            width={table.shape === 'rectangle' ? baseSize * 1.4 : baseSize}
            height={table.shape === 'rectangle' ? baseSize * 0.8 : baseSize}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="animate-pulse"
            rx={4}
          />
        )}
      </g>
    )
  }
  
  const exportLayout = () => {
    const data = JSON.stringify(floorPlan, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `restaurant-layout-${Date.now()}.json`
    a.click()
  }
  
  const importLayout = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        // Here you would validate and load the data
        console.log('Imported layout:', data)
      } catch (error) {
        console.error('Failed to import layout:', error)
      }
    }
    reader.readAsText(file)
  }
  
  const occupancyRate = getTableOccupancyRate()
  const occupiedTables = getOccupiedTables()
  const availableTables = getAvailableTables()
  
  return (
    <div className="h-full flex gap-4 p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Left Sidebar - Tools & Properties */}
      <Card className="w-80 bg-slate-800/50 backdrop-blur-xl border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Layers className="w-5 h-5" />
            Table Designer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
              <TabsTrigger value="add">Add</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="add" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-300">Table Number</Label>
                  <Input
                    type="number"
                    value={newTableForm.number}
                    onChange={(e) => setNewTableForm(prev => ({ ...prev, number: parseInt(e.target.value) }))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-slate-300">Seats</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <Slider
                      value={[newTableForm.seats]}
                      onValueChange={([value]) => setNewTableForm(prev => ({ ...prev, seats: value }))}
                      min={1}
                      max={12}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-white font-semibold w-8">{newTableForm.seats}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-slate-300">Shape</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button
                      variant={newTableForm.shape === 'square' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewTableForm(prev => ({ ...prev, shape: 'square' }))}
                      className="flex flex-col items-center gap-1"
                    >
                      <Square className="w-4 h-4" />
                      <span className="text-xs">Square</span>
                    </Button>
                    <Button
                      variant={newTableForm.shape === 'round' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewTableForm(prev => ({ ...prev, shape: 'round' }))}
                      className="flex flex-col items-center gap-1"
                    >
                      <Circle className="w-4 h-4" />
                      <span className="text-xs">Round</span>
                    </Button>
                    <Button
                      variant={newTableForm.shape === 'rectangle' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewTableForm(prev => ({ ...prev, shape: 'rectangle' }))}
                      className="flex flex-col items-center gap-1"
                    >
                      <RectangleHorizontal className="w-4 h-4" />
                      <span className="text-xs">Rect</span>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-slate-300">Size</Label>
                  <Select value={newTableForm.size} onValueChange={(value) => setNewTableForm(prev => ({ ...prev, size: value as any }))}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={addNewTable} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Table
                </Button>
              </div>
              
              <div className="border-t border-slate-700 pt-4">
                <Label className="text-slate-300 mb-2">Quick Presets</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm" onClick={() => loadPresetLayout('small')}>
                    <Coffee className="w-4 h-4 mr-2" />
                    Small Cafe (10 tables)
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => loadPresetLayout('medium')}>
                    <Utensils className="w-4 h-4 mr-2" />
                    Restaurant (15 tables)
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => loadPresetLayout('large')}>
                    <Wine className="w-4 h-4 mr-2" />
                    Large Venue (25 tables)
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="edit" className="space-y-4 mt-4">
              {selectedTable ? (
                <>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-400">Selected Table</p>
                    <p className="text-lg font-semibold text-white">
                      Table {floorPlan.tables.find(t => t.id === selectedTable)?.number}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const table = floorPlan.tables.find(t => t.id === selectedTable)
                        if (table) {
                          updateTable(selectedTable, { rotation: ((table.rotation || 0) + 45) % 360 })
                        }
                      }}
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Rotate 45°
                    </Button>
                    
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
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a table to edit</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Show Grid</Label>
                  <Button
                    variant={showGrid ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowGrid(!showGrid)}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Snap to Grid</Label>
                  <Button
                    variant={snapToGrid ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSnapToGrid(!snapToGrid)}
                  >
                    {snapToGrid ? "On" : "Off"}
                  </Button>
                </div>
                
                <div>
                  <Label className="text-slate-300">Floor Size</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      type="number"
                      value={floorPlan.gridSize.width}
                      onChange={(e) => updateFloorPlanSize(parseInt(e.target.value), floorPlan.gridSize.height)}
                      placeholder="Width"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <Input
                      type="number"
                      value={floorPlan.gridSize.height}
                      onChange={(e) => updateFloorPlanSize(floorPlan.gridSize.width, parseInt(e.target.value))}
                      placeholder="Height"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="border-t border-slate-700 pt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={exportLayout}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Layout
                  </Button>
                  
                  <label className="w-full">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Import Layout
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importLayout}
                      className="hidden"
                    />
                  </label>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (confirm('Are you sure you want to reset the entire floor plan?')) {
                        resetFloorPlan()
                        setSelectedTable(null)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset Floor Plan
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Stats Bar */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-300">Available: {availableTables.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-slate-300">Occupied: {occupiedTables.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Occupancy: {occupancyRate.toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {floorPlan.tables.length} Tables
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {floorPlan.tables.reduce((sum, t) => sum + t.seats, 0)} Seats
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Canvas */}
        <Card className="flex-1 bg-slate-800/50 backdrop-blur-xl border-slate-700 overflow-hidden">
          <div
            ref={canvasRef}
            className="relative w-full h-full overflow-auto bg-slate-900/50"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              width={floorPlan.gridSize.width * floorPlan.cellSize}
              height={floorPlan.gridSize.height * floorPlan.cellSize}
              className="absolute inset-0"
            >
              {/* Grid */}
              {showGrid && (
                <g className="opacity-10">
                  {Array.from({ length: floorPlan.gridSize.width + 1 }).map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * floorPlan.cellSize}
                      y1={0}
                      x2={i * floorPlan.cellSize}
                      y2={floorPlan.gridSize.height * floorPlan.cellSize}
                      stroke="white"
                      strokeWidth="1"
                    />
                  ))}
                  {Array.from({ length: floorPlan.gridSize.height + 1 }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1={0}
                      y1={i * floorPlan.cellSize}
                      x2={floorPlan.gridSize.width * floorPlan.cellSize}
                      y2={i * floorPlan.cellSize}
                      stroke="white"
                      strokeWidth="1"
                    />
                  ))}
                </g>
              )}
              
              {/* Tables */}
              {floorPlan.tables.map(renderTable)}
            </svg>
            
            {/* Empty State */}
            {floorPlan.tables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Home className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">No Tables Yet</h3>
                  <p className="text-sm text-slate-500 mb-4">Start by adding tables or loading a preset layout</p>
                  <Button onClick={() => loadPresetLayout('medium')} className="bg-emerald-600 hover:bg-emerald-700">
                    Load Sample Layout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TableConfigurationInterface