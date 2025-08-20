"use client"

import React, { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCashManagementStore, Expense } from "@/stores/cash-management"
import { useSettingsStore } from "@/stores/settings"
import { exportExpensesToCSV, exportExpensesWithSummary } from "@/lib/csv-export"
import {
  Trash2,
  Download,
  Filter,
  Calendar,
  DollarSign,
  TrendingDown,
  FileText,
  AlertCircle,
  MoreVertical,
  Plus,
  X,
  Search,
  ChevronDown,
  Archive,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpenseManagementDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ExpenseManagementDialog({
  isOpen,
  onClose,
}: ExpenseManagementDialogProps) {
  const {
    getAllExpenses,
    getTodaysExpenses,
    getExpensesByDateRange,
    removeExpense,
    removeMultipleExpenses,
    clearAllExpenses,
    addExpense,
  } = useCashManagementStore()
  
  const { settings } = useSettingsStore()
  const exchangeRate = settings.currency.exchangeRate

  // State for filters and selection
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterCurrency, setFilterCurrency] = useState<string>("all")
  const [filterDateRange, setFilterDateRange] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddExpense, setShowAddExpense] = useState(false)
  
  // New expense form state
  const [newExpenseDescription, setNewExpenseDescription] = useState("")
  const [newExpenseAmount, setNewExpenseAmount] = useState("")
  const [newExpenseCategory, setNewExpenseCategory] = useState("general")
  const [newExpenseCurrency, setNewExpenseCurrency] = useState<"USD" | "LBP">("USD")

  // Get filtered expenses
  const filteredExpenses = useMemo(() => {
    let expenses = getAllExpenses()
    
    // Apply date filter
    if (filterDateRange === "today") {
      expenses = getTodaysExpenses()
    } else if (filterDateRange === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      expenses = getExpensesByDateRange(weekAgo, new Date())
    } else if (filterDateRange === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      expenses = getExpensesByDateRange(monthAgo, new Date())
    }
    
    // Apply category filter
    if (filterCategory !== "all") {
      expenses = expenses.filter(e => e.category === filterCategory)
    }
    
    // Apply currency filter
    if (filterCurrency !== "all") {
      expenses = expenses.filter(e => e.currency === filterCurrency)
    }
    
    // Apply search filter
    if (searchTerm) {
      expenses = expenses.filter(e => 
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return expenses
  }, [getAllExpenses, getTodaysExpenses, getExpensesByDateRange, filterCategory, filterCurrency, filterDateRange, searchTerm])

  // Calculate totals
  const totals = useMemo(() => {
    const usd = filteredExpenses
      .filter(e => e.currency === "USD")
      .reduce((sum, e) => sum + e.amount, 0)
    
    const lbp = filteredExpenses
      .filter(e => e.currency === "LBP")
      .reduce((sum, e) => sum + e.amount, 0)
    
    const totalInUsd = filteredExpenses
      .reduce((sum, e) => sum + (e.amountInUsd || e.amount), 0)
    
    return { usd, lbp, totalInUsd }
  }, [filteredExpenses])

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = getAllExpenses().map(e => e.category)
    return Array.from(new Set(allCategories))
  }, [getAllExpenses])

  const handleSelectAll = () => {
    if (selectedExpenses.length === filteredExpenses.length) {
      setSelectedExpenses([])
    } else {
      setSelectedExpenses(filteredExpenses.map(e => e.id))
    }
  }

  const handleSelectExpense = (id: string) => {
    if (selectedExpenses.includes(id)) {
      setSelectedExpenses(selectedExpenses.filter(eId => eId !== id))
    } else {
      setSelectedExpenses([...selectedExpenses, id])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedExpenses.length > 0) {
      if (confirm(`Delete ${selectedExpenses.length} expense(s)? This will add the amounts back to the cash drawer.`)) {
        removeMultipleExpenses(selectedExpenses)
        setSelectedExpenses([])
      }
    }
  }

  const handleExportCSV = () => {
    exportExpensesToCSV(filteredExpenses)
  }

  const handleExportWithSummary = () => {
    exportExpensesWithSummary(filteredExpenses, exchangeRate)
  }

  const handleClearAll = () => {
    if (confirm("Clear ALL expenses? This will add all amounts back to the cash drawer. This action cannot be undone.")) {
      clearAllExpenses()
      setSelectedExpenses([])
    }
  }

  const handleAddExpense = () => {
    if (newExpenseDescription && newExpenseAmount) {
      addExpense(
        {
          description: newExpenseDescription,
          amount: parseFloat(newExpenseAmount),
          category: newExpenseCategory,
          currency: newExpenseCurrency,
          cashier: "current_user", // You might want to get this from user context
        },
        exchangeRate
      )
      
      // Reset form
      setNewExpenseDescription("")
      setNewExpenseAmount("")
      setNewExpenseCategory("general")
      setNewExpenseCurrency("USD")
      setShowAddExpense(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Expense Management</DialogTitle>
          <DialogDescription>
            View, export, and manage all expenses. Deleting expenses will add the amounts back to the cash drawer.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Expense List</TabsTrigger>
            <TabsTrigger value="summary">Summary & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Filters and Actions Bar */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  
                  <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="LBP">LBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowAddExpense(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleExportCSV}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportWithSummary}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export with Summary
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {selectedExpenses.length > 0 && (
                    <Button
                      onClick={handleDeleteSelected}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete ({selectedExpenses.length})
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Totals Bar */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">
                    USD: ${totals.usd.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    LBP: {totals.lbp.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">
                    Total (USD): ${totals.totalInUsd.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Table */}
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>USD Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedExpenses.includes(expense.id)}
                            onCheckedChange={() => handleSelectExpense(expense.id)}
                          />
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            {new Date(expense.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(expense.timestamp).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {expense.currency === "USD" ? "$" : ""}
                            {expense.amount.toFixed(2)}
                            {expense.currency === "LBP" ? " LBP" : ""}
                          </div>
                          <div className="text-xs text-gray-500">
                            {expense.currency}
                          </div>
                        </TableCell>
                        <TableCell>
                          ${expense.amountInUsd?.toFixed(2) || expense.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => {
                              if (confirm("Delete this expense? The amount will be added back to the cash drawer.")) {
                                removeExpense(expense.id)
                              }
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Category Breakdown */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Expenses by Category</h3>
                <div className="space-y-2">
                  {categories.map(category => {
                    const categoryExpenses = filteredExpenses.filter(e => e.category === category)
                    const total = categoryExpenses.reduce((sum, e) => sum + (e.amountInUsd || e.amount), 0)
                    
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{categoryExpenses.length}</Badge>
                          <span className="text-sm font-medium">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Currency Breakdown */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Expenses by Currency</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">USD Expenses</span>
                    <span className="text-sm font-medium">${totals.usd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">LBP Expenses</span>
                    <span className="text-sm font-medium">{totals.lbp.toLocaleString()} LBP</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Total (USD)</span>
                      <span className="text-sm font-bold">${totals.totalInUsd.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
              <h3 className="font-semibold mb-3 text-red-800 dark:text-red-200">Danger Zone</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Clear all expenses from the system
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    This will add all expense amounts back to the cash drawer
                  </p>
                </div>
                <Button
                  onClick={handleClearAll}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Expenses
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
        
        {/* Add Expense Dialog */}
        <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input
                  value={newExpenseDescription}
                  onChange={(e) => setNewExpenseDescription(e.target.value)}
                  placeholder="Enter expense description"
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={newExpenseCurrency} onValueChange={(v) => setNewExpenseCurrency(v as "USD" | "LBP")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="LBP">LBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newExpenseCategory} onValueChange={setNewExpenseCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddExpense(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense}>
                Add Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}