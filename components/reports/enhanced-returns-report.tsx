"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RotateCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  Filter,
  Download,
  Eye,
  Calendar,
  Users,
  ClipboardList,
  BarChart3,
  PieChart,
  RefreshCw
} from "lucide-react"
import { useState } from "react"
import { useReturnsIntegration } from "../pos/returns-integration"

interface ReturnsReportProps {
  dateRange?: {
    start: string
    end: string
  }
}

export function EnhancedReturnsReport({ dateRange }: ReturnsReportProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const {
    returnsStore,
    calculateReturnRate,
    getReturnImpactedStock
  } = useReturnsIntegration()

  // Get return statistics
  const returnStats = returnsStore.getReturnStats()
  const returnRateData = calculateReturnRate(selectedPeriod as any)
  const stockImpact = getReturnImpactedStock()
  
  // Get filtered returns
  const filteredReturns = returnsStore.getFilteredReturns()

  // Calculate additional metrics
  const pendingReturns = returnsStore.getPendingApprovals()
  const todayReturns = returnsStore.returnTransactions.filter(r => 
    r.date === new Date().toISOString().split('T')[0]
  )

  const returnReasons = returnStats.topReturnReasons

  // Mock data for charts (in real app, this would come from analytics service)
  const monthlyTrends = [
    { month: 'Jan', returns: 45, refunds: 38, exchanges: 7 },
    { month: 'Feb', returns: 52, refunds: 41, exchanges: 11 },
    { month: 'Mar', returns: 38, refunds: 29, exchanges: 9 },
    { month: 'Apr', returns: 61, refunds: 48, exchanges: 13 },
    { month: 'May', returns: 55, refunds: 42, exchanges: 13 },
    { month: 'Jun', returns: 49, refunds: 35, exchanges: 14 }
  ]

  const refundMethods = [
    { method: 'Original Payment', count: 156, percentage: 62 },
    { method: 'Store Credit', count: 45, percentage: 18 },
    { method: 'Cash', count: 32, percentage: 13 },
    { method: 'Different Card', count: 18, percentage: 7 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Returns & Exchanges Report</h1>
          <p className="text-gray-600">Comprehensive analysis of returns, refunds, and exchanges</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-blue-300 text-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Period Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="return">Returns</SelectItem>
                  <SelectItem value="exchange">Exchanges</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
              <Input
                placeholder="Receipt, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Returns</p>
                <p className="text-2xl font-bold text-blue-900">{returnStats.totalReturns}</p>
                <p className="text-xs text-blue-700">+{returnStats.todayReturns} today</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <RotateCcw className="w-5 h-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-600 text-sm font-medium">Refund Amount</p>
                <p className="text-2xl font-bold text-green-900">${returnStats.totalRefundAmount.toFixed(2)}</p>
                <p className="text-xs text-green-700">Avg: ${returnStats.averageRefundAmount.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-600 text-sm font-medium">Return Rate</p>
                <p className="text-2xl font-bold text-orange-900">{returnRateData.returnRate}%</p>
                <p className="text-xs text-orange-700">Of total sales</p>
              </div>
              <div className="p-2 bg-orange-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-600 text-sm font-medium">Pending Approvals</p>
                <p className="text-2xl font-bold text-red-900">{pendingReturns.length}</p>
                <p className="text-xs text-red-700">Needs attention</p>
              </div>
              <div className="p-2 bg-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reasons">Reasons</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Return vs Sales Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Return vs Sales Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">Total Sales</p>
                      <p className="text-sm text-blue-600">{returnRateData.totalSales} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-900">${returnRateData.salesValue}</p>
                      <p className="text-sm text-blue-600">Revenue</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">Total Returns</p>
                      <p className="text-sm text-red-600">{returnRateData.totalReturns} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-900">${returnRateData.returnValue}</p>
                      <p className="text-sm text-red-600">Refunded</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Rate:</span>
                      <span className="font-bold">{returnRateData.returnRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value Return Rate:</span>
                      <span className="font-bold">{returnRateData.valueReturnRate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refund Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Refund Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {refundMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-orange-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{method.count}</p>
                        <p className="text-xs text-gray-500">{method.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Return Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4">
                {monthlyTrends.map((month, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-2">
                      <div className="h-20 flex items-end justify-center space-x-1">
                        <div 
                          className="bg-red-400 w-3" 
                          style={{height: `${(month.refunds / 70) * 80}px`}}
                          title={`Refunds: ${month.refunds}`}
                        ></div>
                        <div 
                          className="bg-blue-400 w-3" 
                          style={{height: `${(month.exchanges / 70) * 80}px`}}
                          title={`Exchanges: ${month.exchanges}`}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs font-medium">{month.month}</p>
                    <p className="text-xs text-gray-500">{month.returns}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 mr-2"></div>
                  <span>Refunds</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 mr-2"></div>
                  <span>Exchanges</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reasons">
          <Card>
            <CardHeader>
              <CardTitle>Top Return Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {returnReasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{reason.reason}</p>
                      <p className="text-sm text-gray-600">{reason.count} occurrences</p>
                    </div>
                    <Badge variant="outline">
                      {reason.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Pending Manager Approvals
                </span>
                <Badge variant="destructive">{pendingReturns.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingReturns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReturns.map((returnTxn, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">{returnTxn.receiptNumber}</p>
                        <p className="text-sm text-gray-600">${returnTxn.refundAmount.toFixed(2)} • {returnTxn.date}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Inventory Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">Items Restocked</p>
                    <p className="text-2xl font-bold text-blue-900">{stockImpact.recentReturns.length}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-700">Low Stock Items</p>
                    <p className="text-2xl font-bold text-orange-900">{stockImpact.lowStockProducts.length}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-700">Impacted Products</p>
                    <p className="text-2xl font-bold text-green-900">{stockImpact.impactedProducts.length}</p>
                  </div>
                </div>

                {stockImpact.lowStockProducts.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Low Stock Products Affected by Returns:</h4>
                    <div className="space-y-2">
                      {stockImpact.lowStockProducts.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{product.name}</span>
                          <Badge variant="outline">{product.stock} remaining</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}