"use client"

import React from "react"

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Users, Package, AlertTriangle, FileText, Download } from "lucide-react"
import Link from "next/link"
import { SalesChart } from "@/components/reports/sales-chart"
import { CategoryChart } from "@/components/reports/category-chart"
import { PaymentMethodChart } from "@/components/reports/payment-method-chart"
import { HourlyChart } from "@/components/reports/hourly-chart"
import { InventoryChart } from "@/components/reports/inventory-chart"
import { TopProductsTable } from "@/components/reports/top-products-table"
import { StockAlertsTable } from "@/components/reports/stock-alerts-table"
import { ReturnsReport } from "@/components/reports/returns-report"

export default function ReportsPage() {
  const salesData = [
    { date: "2025-01-08", sales: 1247.25 },
    { date: "2025-01-09", sales: 1456.50 },
    { date: "2025-01-10", sales: 1189.75 },
    { date: "2025-01-11", sales: 1678.00 },
    { date: "2025-01-12", sales: 1523.25 },
    { date: "2025-01-13", sales: 1834.50 },
  ]

  const categoryData = [
    { category: "Electronics", sales: 4567.25, percentage: 35 },
    { category: "Clothing", sales: 3245.50, percentage: 25 },
    { category: "Food & Beverages", sales: 2678.75, percentage: 20 },
    { category: "Home & Garden", sales: 1834.25, percentage: 14 },
    { category: "Books & Media", sales: 789.50, percentage: 6 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to POS
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export Report
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Today's Sales</p>
                  <p className="text-2xl font-bold text-blue-900">$1,247.25</p>
                  <p className="text-xs text-blue-600">+15% from yesterday</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Transactions</p>
                  <p className="text-2xl font-bold text-emerald-900">47</p>
                  <p className="text-xs text-emerald-600">+8% from yesterday</p>
                </div>
                <BarChart3 className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Avg. Sale</p>
                  <p className="text-2xl font-bold text-purple-900">$26.54</p>
                  <p className="text-xs text-purple-600">+3% from yesterday</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Active Items</p>
                  <p className="text-2xl font-bold text-amber-900">247</p>
                  <p className="text-xs text-amber-600">12 low stock</p>
                </div>
                <Package className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Sales Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart data={salesData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart data={categoryData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Hourly Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HourlyChart />
            </CardContent>
          </Card>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopProductsTable />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockAlertsTable />
            </CardContent>
          </Card>
        </div>

        {/* Additional Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                Inventory Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InventoryChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5 text-purple-600" />
                Returns & Exchanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReturnsReport />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}