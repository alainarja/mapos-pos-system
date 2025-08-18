'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTransactionStore } from '@/stores/transactions'
import { usePrintStore } from '@/stores/print'
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  Receipt,
  FileText,
  Printer,
  CheckCircle,
  AlertCircle,
  Calculator,
  BarChart3
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface EndOfDayReportProps {
  date?: string
  showCashReconciliation?: boolean
}

export default function EndOfDayReport({ 
  date: initialDate, 
  showCashReconciliation = true 
}: EndOfDayReportProps) {
  const { getDailyReport, getCashReconciliation } = useTransactionStore()
  const { printEndOfDayReport, autoPrint } = usePrintStore()

  const [reportDate, setReportDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  )
  const [actualCashAmount, setActualCashAmount] = useState<string>('')
  const [cashCounted, setCashCounted] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)

  // Get report data
  const dailyReport = getDailyReport(reportDate)
  const cashReconciliation = getCashReconciliation(reportDate)

  // Calculate cash variance when actualCashAmount is provided
  const cashVariance = actualCashAmount && !isNaN(parseFloat(actualCashAmount)) 
    ? parseFloat(actualCashAmount) - cashReconciliation.expectedCash
    : null

  const hasVariance = cashVariance !== null && Math.abs(cashVariance) > 0.01

  // Auto-generate report when date changes
  useEffect(() => {
    setReportGenerated(true)
  }, [reportDate])

  const handlePrintReport = async () => {
    const reportData = {
      ...dailyReport,
      cashReconciliation: {
        ...cashReconciliation,
        actualCash: actualCashAmount ? parseFloat(actualCashAmount) : null,
        variance: cashVariance
      },
      generatedAt: new Date().toISOString(),
      generatedBy: 'Current User' // Would come from auth context
    }

    await printEndOfDayReport(reportData)
  }

  const handleCashCountComplete = () => {
    setCashCounted(true)
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">End of Day Report</h1>
            <p className="text-gray-600">Daily sales summary and cash reconciliation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <Label htmlFor="report-date" className="text-sm font-medium mb-1">
              Report Date
            </Label>
            <Input
              id="report-date"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button 
            onClick={handlePrintReport}
            className="flex items-center gap-2"
            disabled={showCashReconciliation && !cashCounted}
          >
            <Printer className="h-4 w-4" />
            Print Z-Report
          </Button>
        </div>
      </div>

      {/* Date and Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {new Date(reportDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
            <Badge variant={reportGenerated ? "default" : "secondary"}>
              {reportGenerated ? "Report Generated" : "Pending"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${dailyReport.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">{dailyReport.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Sale</p>
                <p className="text-2xl font-bold">${dailyReport.averageTransaction.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calculator className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Net Sales</p>
                <p className="text-2xl font-bold">${dailyReport.netSales.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Payment Method Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(dailyReport.paymentMethodBreakdown).map(([method, data]) => (
              <div key={method} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{method}</h4>
                <p className="text-2xl font-bold text-green-600">${data.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{data.count} transactions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cash Reconciliation */}
      {showCashReconciliation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cash Reconciliation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-600">Expected Cash</h4>
                <p className="text-2xl font-bold">${cashReconciliation.expectedCash.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  Sales: ${cashReconciliation.cashSales.toFixed(2)} - 
                  Refunds: ${cashReconciliation.cashRefunds.toFixed(2)}
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <Label htmlFor="actual-cash" className="font-medium text-gray-600">
                  Actual Cash Count
                </Label>
                <Input
                  id="actual-cash"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={actualCashAmount}
                  onChange={(e) => setActualCashAmount(e.target.value)}
                  className="text-2xl font-bold mt-2"
                />
                {!cashCounted && actualCashAmount && (
                  <Button 
                    onClick={handleCashCountComplete}
                    size="sm"
                    className="mt-2"
                  >
                    Confirm Count
                  </Button>
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-600">Variance</h4>
                {cashVariance !== null ? (
                  <>
                    <p className={`text-2xl font-bold ${hasVariance ? 'text-red-600' : 'text-green-600'}`}>
                      ${Math.abs(cashVariance).toFixed(2)}
                      {cashVariance < 0 ? ' Short' : cashVariance > 0 ? ' Over' : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {hasVariance ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className={`text-sm ${hasVariance ? 'text-red-600' : 'text-green-600'}`}>
                        {hasVariance ? 'Requires Attention' : 'Balanced'}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-gray-400">--</p>
                )}
              </div>
            </div>
            
            {hasVariance && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cash variance detected. Please recount or document the discrepancy before closing.
                  {Math.abs(cashVariance) > 5 && ' This is a significant variance that requires manager approval.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyReport.topItems.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.quantity} sold</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">${item.revenue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cashier Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cashier Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyReport.cashierPerformance.map((cashier) => (
              <div key={cashier.cashier} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{cashier.cashier}</p>
                  <p className="text-sm text-gray-600">{cashier.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${cashier.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    Avg: ${(cashier.amount / cashier.count).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hourly Sales Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {dailyReport.hourlyBreakdown.map((hour) => (
              <div key={hour.hour} className="text-center p-3 border rounded-lg">
                <p className="font-medium">{hour.hour}</p>
                <p className="text-lg font-bold text-green-600">${hour.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{hour.count} sales</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gross Sales</span>
              <span className="font-medium">${(dailyReport.totalRevenue + dailyReport.totalDiscount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discounts</span>
              <span className="font-medium text-red-600">-${dailyReport.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Net Sales</span>
              <span className="font-medium">${dailyReport.netSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax Collected</span>
              <span className="font-medium">${dailyReport.totalTax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Revenue</span>
              <span className="text-green-600">${dailyReport.totalRevenue.toFixed(2)}</span>
            </div>
            {dailyReport.refundsCount > 0 && (
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Refunds ({dailyReport.refundsCount})</span>
                <span className="text-red-600">-${dailyReport.refundsAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}