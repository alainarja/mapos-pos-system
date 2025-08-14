"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingDown, 
  TrendingUp, 
  RotateCcw, 
  RefreshCw, 
  DollarSign, 
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  FileText
} from "lucide-react"
import { useReturnsStore } from "@/stores/returns"
import { useMemo } from "react"

interface ReturnsReportProps {
  dateRange?: {
    from: Date
    to: Date
  }
  compact?: boolean
}

export function ReturnsReport({ dateRange, compact = false }: ReturnsReportProps) {
  const {
    returnTransactions,
    getReturnStats,
    getFilteredReturns,
    getReturnsByStatus,
    getReturnsByType,
    getPendingApprovals
  } = useReturnsStore()

  const stats = useMemo(() => getReturnStats(), [returnTransactions])
  const pendingApprovals = useMemo(() => getPendingApprovals(), [returnTransactions])
  
  // Calculate period-specific stats
  const filteredReturns = useMemo(() => {
    if (!dateRange) return returnTransactions
    
    const fromStr = dateRange.from.toISOString().split('T')[0]
    const toStr = dateRange.to.toISOString().split('T')[0]
    
    return returnTransactions.filter(transaction => 
      transaction.date >= fromStr && transaction.date <= toStr
    )
  }, [returnTransactions, dateRange])

  const periodStats = useMemo(() => {
    const completed = filteredReturns.filter(t => t.status === 'completed')
    const returns = completed.filter(t => t.type === 'return')
    const exchanges = completed.filter(t => t.type === 'exchange')
    const refunds = completed.filter(t => t.type === 'refund')
    
    const totalRefundAmount = completed.reduce((sum, t) => sum + (t.refundAmount || 0), 0)
    const averageRefund = completed.length > 0 ? totalRefundAmount / completed.length : 0
    
    // Calculate return reasons
    const reasonCounts: Record<string, number> = {}
    completed.forEach(transaction => {
      transaction.returnItems?.forEach(item => {
        reasonCounts[item.reason] = (reasonCounts[item.reason] || 0) + 1
      })
    })
    
    const topReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: (count / Object.values(reasonCounts).reduce((a, b) => a + b, 0)) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    return {
      total: completed.length,
      returns: returns.length,
      exchanges: exchanges.length,
      refunds: refunds.length,
      totalRefundAmount: Math.round(totalRefundAmount * 100) / 100,
      averageRefund: Math.round(averageRefund * 100) / 100,
      topReasons
    }
  }, [filteredReturns])

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Returns</p>
                <p className="text-lg font-bold text-white">{periodStats.returns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Exchanges</p>
                <p className="text-lg font-bold text-white">{periodStats.exchanges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Total Refunds</p>
                <p className="text-lg font-bold text-white">${periodStats.totalRefundAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-lg font-bold text-white">{pendingApprovals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-300 flex items-center text-sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{periodStats.returns}</div>
              <div className="text-xs text-gray-400">
                {stats.todayReturns} today • {stats.weekReturns} this week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-300 flex items-center text-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Exchanges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{periodStats.exchanges}</div>
              <div className="text-xs text-gray-400">
                Even exchanges • Difference handling
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-300 flex items-center text-sm">
              <DollarSign className="w-4 h-4 mr-2" />
              Refund Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">${periodStats.totalRefundAmount}</div>
              <div className="text-xs text-gray-400">
                Average: ${periodStats.averageRefund}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-300 flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{pendingApprovals.length}</div>
              <div className="text-xs text-gray-400">
                Requires manager review
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Return Reasons */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-300 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Top Return Reasons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {periodStats.topReasons.length > 0 ? (
              periodStats.topReasons.map((reason, index) => (
                <div key={reason.reason} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="text-white capitalize">
                      {reason.reason.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-slate-600 text-purple-300">
                      {reason.count}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {reason.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No return data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Returns */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-300 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredReturns.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-400' :
                    transaction.status === 'pending' ? 'bg-orange-400' :
                    transaction.status === 'processing' ? 'bg-blue-400' :
                    'bg-red-400'
                  }`} />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {transaction.type} • {transaction.receiptNumber}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {transaction.date} • ${transaction.refundAmount?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    transaction.status === 'completed' ? 'bg-green-600/20 text-green-300' :
                    transaction.status === 'pending' ? 'bg-orange-600/20 text-orange-300' :
                    transaction.status === 'processing' ? 'bg-blue-600/20 text-blue-300' :
                    'bg-red-600/20 text-red-300'
                  }`}
                >
                  {transaction.status}
                </Badge>
              </div>
            ))}
            {filteredReturns.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="bg-slate-800/50 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-orange-300 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Pending Manager Approvals ({pendingApprovals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.map((transaction) => (
              <div key={transaction.id} className="p-4 bg-orange-600/10 rounded-lg border border-orange-500/20">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-medium">
                      {transaction.type} • {transaction.receiptNumber}
                    </h4>
                    <p className="text-orange-300 text-sm">
                      Amount: ${transaction.refundAmount?.toFixed(2)} • {transaction.date}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-orange-600/20 text-orange-300">
                    Pending Approval
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-white">Approval Required For:</h5>
                  <div className="flex flex-wrap gap-2">
                    {!transaction.originalTransaction && (
                      <Badge variant="outline" className="border-red-500/30 text-red-300">
                        No Receipt
                      </Badge>
                    )}
                    {(transaction.refundAmount || 0) > 100 && (
                      <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                        High Value (${transaction.refundAmount?.toFixed(2)})
                      </Badge>
                    )}
                    {transaction.returnItems?.some(item => item.condition === 'damaged' || item.condition === 'defective') && (
                      <Badge variant="outline" className="border-red-500/30 text-red-300">
                        Damaged Items
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    Review & Approve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Policy Insights */}
      <Card className="bg-slate-800/50 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-300 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Policy Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {periodStats.totalRefundAmount > 1000 && (
              <div className="p-3 bg-yellow-600/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-300">High Refund Volume</span>
                </div>
                <p className="text-xs text-gray-300">
                  Consider reviewing product quality or customer satisfaction processes
                </p>
              </div>
            )}
            
            {periodStats.topReasons.length > 0 && periodStats.topReasons[0].percentage > 40 && (
              <div className="p-3 bg-red-600/10 rounded-lg border border-red-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-300">Primary Return Cause</span>
                </div>
                <p className="text-xs text-gray-300">
                  {periodStats.topReasons[0].reason.replace(/_/g, ' ')} accounts for {periodStats.topReasons[0].percentage.toFixed(1)}% of returns
                </p>
              </div>
            )}
            
            {pendingApprovals.length > 5 && (
              <div className="p-3 bg-orange-600/10 rounded-lg border border-orange-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-300">Approval Backlog</span>
                </div>
                <p className="text-xs text-gray-300">
                  {pendingApprovals.length} transactions awaiting manager approval
                </p>
              </div>
            )}
            
            {periodStats.exchanges > periodStats.returns && (
              <div className="p-3 bg-green-600/10 rounded-lg border border-green-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Positive Trend</span>
                </div>
                <p className="text-xs text-gray-300">
                  More exchanges than returns indicates good customer service
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}