"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  BarChart3,
  Store,
  CreditCard,
  Users,
  Download,
  Printer,
  TrendingUp,
  PieChart,
  ShoppingCart,
  Shield,
} from "lucide-react"

interface StoreSettings {
  name: string
  address: string
  phone: string
  email: string
  taxRate: number
  currency: string
  timezone: string
  receiptFooter: string
  inactivityTimeout: number
}

interface PaymentMethodConfig {
  id: string
  name: string
  enabled: boolean
  processingFee: number
  icon: string
}

interface UserRole {
  id: string
  name: string
  permissions: string[]
}

interface ReportData {
  salesByItem: Array<{
    item: string
    quantity: number
    revenue: number
    profit: number
  }>
  salesByCategory: Array<{
    category: string
    quantity: number
    revenue: number
    percentage: number
  }>
  salesByPaymentMethod: Array<{
    method: string
    amount: number
    transactions: number
    percentage: number
  }>
  salesByCashier: Array<{
    cashier: string
    sales: number
    transactions: number
    avgSale: number
  }>
  dailyTotals: {
    totalSales: number
    totalTransactions: number
    totalItems: number
    totalTax: number
    totalDiscounts: number
    totalReturns: number
  }
}

const sampleStoreSettings: StoreSettings = {
  name: "MAPOS Store",
  address: "123 Main Street, City, State 12345",
  phone: "(555) 123-4567",
  email: "store@mapos.com",
  taxRate: 8.0,
  currency: "USD",
  timezone: "America/New_York",
  receiptFooter: "Thank you for shopping with MAPOS!\nVisit us again soon!",
  inactivityTimeout: 15,
}

const samplePaymentMethods: PaymentMethodConfig[] = [
  { id: "cash", name: "Cash", enabled: true, processingFee: 0, icon: "💵" },
  { id: "card", name: "Credit/Debit Card", enabled: true, processingFee: 2.9, icon: "💳" },
  { id: "wallet", name: "Digital Wallet", enabled: true, processingFee: 2.5, icon: "📱" },
  { id: "gift_card", name: "Gift Card", enabled: true, processingFee: 0, icon: "🎁" },
  { id: "store_credit", name: "Store Credit", enabled: true, processingFee: 0, icon: "🏪" },
]

const sampleUserRoles: UserRole[] = [
  {
    id: "cashier",
    name: "Cashier",
    permissions: ["process_sales", "view_products", "manage_customers"],
  },
  {
    id: "supervisor",
    name: "Supervisor",
    permissions: [
      "process_sales",
      "view_products",
      "manage_customers",
      "process_returns",
      "apply_discounts",
      "void_transactions",
    ],
  },
  {
    id: "manager",
    name: "Manager",
    permissions: ["all_permissions", "manage_settings", "view_reports", "manage_users", "cash_management"],
  },
]

const sampleReportData: ReportData = {
  salesByItem: [
    { item: "Premium Coffee Beans", quantity: 45, revenue: 1124.55, profit: 337.37 },
    { item: "Organic Green Tea", quantity: 32, revenue: 592.0, profit: 177.6 },
    { item: "Artisan Chocolate", quantity: 28, revenue: 363.72, profit: 109.12 },
    { item: "Fresh Croissant", quantity: 67, revenue: 234.5, profit: 70.35 },
    { item: "Energy Drink", quantity: 89, revenue: 266.11, profit: 79.83 },
  ],
  salesByCategory: [
    { category: "Beverages", quantity: 156, revenue: 1982.66, percentage: 42.5 },
    { category: "Food", quantity: 89, revenue: 1245.33, percentage: 26.7 },
    { category: "Snacks", quantity: 67, revenue: 892.45, percentage: 19.1 },
    { category: "Confectionery", quantity: 34, revenue: 547.06, percentage: 11.7 },
  ],
  salesByPaymentMethod: [
    { method: "Card", amount: 2401.25, transactions: 78, percentage: 51.4 },
    { method: "Cash", amount: 1645.75, transactions: 49, percentage: 35.2 },
    { method: "Digital Wallet", amount: 456.5, transactions: 23, percentage: 9.8 },
    { method: "Gift Card", amount: 164.0, transactions: 8, percentage: 3.5 },
    { method: "Store Credit", amount: 0.0, transactions: 0, percentage: 0.1 },
  ],
  salesByCashier: [
    { cashier: "Sarah Johnson", sales: 2847.5, transactions: 127, avgSale: 22.42 },
    { cashier: "Mike Chen", sales: 1923.75, transactions: 89, avgSale: 21.61 },
    { cashier: "Emma Rodriguez", sales: 896.25, transactions: 42, avgSale: 21.34 },
  ],
  dailyTotals: {
    totalSales: 5667.5,
    totalTransactions: 258,
    totalItems: 742,
    totalTax: 453.4,
    totalDiscounts: 234.75,
    totalReturns: 89.5,
  },
}

export function SettingsReports() {
  const [activeTab, setActiveTab] = useState("settings")
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(sampleStoreSettings)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(samplePaymentMethods)
  const [userRoles, setUserRoles] = useState<UserRole[]>(sampleUserRoles)
  const [reportData] = useState<ReportData>(sampleReportData)
  const [reportDateRange, setReportDateRange] = useState("today")

  const updateStoreSetting = (key: keyof StoreSettings, value: any) => {
    setStoreSettings((prev) => ({ ...prev, [key]: value }))
  }

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => (method.id === id ? { ...method, enabled: !method.enabled } : method)),
    )
  }

  const updatePaymentMethodFee = (id: string, fee: number) => {
    setPaymentMethods((prev) => prev.map((method) => (method.id === id ? { ...method, processingFee: fee } : method)))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Settings & Reports</h2>
        <p className="text-purple-300">Configure your store and view detailed analytics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-purple-500/20">
          <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center">
                <Store className="w-5 h-5 mr-2" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store-name" className="text-purple-300">
                    Store Name
                  </Label>
                  <Input
                    id="store-name"
                    value={storeSettings.name}
                    onChange={(e) => updateStoreSetting("name", e.target.value)}
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="store-phone" className="text-purple-300">
                    Phone
                  </Label>
                  <Input
                    id="store-phone"
                    value={storeSettings.phone}
                    onChange={(e) => updateStoreSetting("phone", e.target.value)}
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="store-address" className="text-purple-300">
                  Address
                </Label>
                <Textarea
                  id="store-address"
                  value={storeSettings.address}
                  onChange={(e) => updateStoreSetting("address", e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tax-rate" className="text-purple-300">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.01"
                    value={storeSettings.taxRate}
                    onChange={(e) => updateStoreSetting("taxRate", Number.parseFloat(e.target.value))}
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-purple-300">
                    Currency
                  </Label>
                  <Select
                    value={storeSettings.currency}
                    onValueChange={(value) => updateStoreSetting("currency", value)}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-purple-500/30">
                      <SelectItem value="USD" className="text-white hover:bg-purple-500/20">
                        USD ($)
                      </SelectItem>
                      <SelectItem value="EUR" className="text-white hover:bg-purple-500/20">
                        EUR (€)
                      </SelectItem>
                      <SelectItem value="GBP" className="text-white hover:bg-purple-500/20">
                        GBP (£)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeout" className="text-purple-300">
                    Inactivity Timeout (min)
                  </Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={storeSettings.inactivityTimeout}
                    onChange={(e) => updateStoreSetting("inactivityTimeout", Number.parseInt(e.target.value))}
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="receipt-footer" className="text-purple-300">
                  Receipt Footer
                </Label>
                <Textarea
                  id="receipt-footer"
                  value={storeSettings.receiptFooter}
                  onChange={(e) => updateStoreSetting("receiptFooter", e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="Thank you message for receipts..."
                />
              </div>

              <Button className="bg-purple-600 hover:bg-purple-700">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-purple-500/10"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <h4 className="text-white font-medium">{method.name}</h4>
                      <p className="text-purple-300 text-sm">Processing fee: {method.processingFee}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`fee-${method.id}`} className="text-purple-300 text-sm">
                        Fee %:
                      </Label>
                      <Input
                        id={`fee-${method.id}`}
                        type="number"
                        step="0.1"
                        value={method.processingFee}
                        onChange={(e) => updatePaymentMethodFee(method.id, Number.parseFloat(e.target.value))}
                        className="w-20 bg-slate-700/50 border-purple-500/30 text-white text-sm"
                      />
                    </div>
                    <Switch checked={method.enabled} onCheckedChange={() => togglePaymentMethod(method.id)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                User Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRoles.map((role) => (
                <div key={role.id} className="p-4 bg-slate-700/30 rounded-lg border border-purple-500/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">{role.name}</h4>
                    <Badge className="bg-purple-600">{role.permissions.length} permissions</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="border-purple-500/30 text-purple-300">
                        {permission.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={reportDateRange} onValueChange={setReportDateRange}>
                <SelectTrigger className="w-48 bg-slate-700/50 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-purple-500/30">
                  <SelectItem value="today" className="text-white hover:bg-purple-500/20">
                    Today
                  </SelectItem>
                  <SelectItem value="week" className="text-white hover:bg-purple-500/20">
                    This Week
                  </SelectItem>
                  <SelectItem value="month" className="text-white hover:bg-purple-500/20">
                    This Month
                  </SelectItem>
                  <SelectItem value="year" className="text-white hover:bg-purple-500/20">
                    This Year
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 bg-transparent"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Daily Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">Total Sales</p>
                    <p className="text-2xl font-bold text-white">${reportData.dailyTotals.totalSales.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">Transactions</p>
                    <p className="text-2xl font-bold text-white">{reportData.dailyTotals.totalTransactions}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">Items Sold</p>
                    <p className="text-2xl font-bold text-white">{reportData.dailyTotals.totalItems}</p>
                  </div>
                  <PieChart className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales by Item */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300">Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.salesByItem.map((item, index) => (
                  <div key={item.item} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="text-white font-medium">{item.item}</h4>
                        <p className="text-purple-300 text-sm">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${item.revenue.toFixed(2)}</p>
                      <p className="text-green-400 text-sm">Profit: ${item.profit.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales by Category */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300">Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.salesByCategory.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{category.category}</span>
                      <span className="text-purple-300">{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">Qty: {category.quantity}</span>
                      <span className="text-white">${category.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.salesByPaymentMethod.map((method) => (
                  <div key={method.method} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{method.method}</h4>
                      <p className="text-purple-300 text-sm">{method.transactions} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${method.amount.toFixed(2)}</p>
                      <p className="text-purple-300 text-sm">{method.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cashier Performance */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300">Cashier Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.salesByCashier.map((cashier) => (
                  <div
                    key={cashier.cashier}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{cashier.cashier.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{cashier.cashier}</h4>
                        <p className="text-purple-300 text-sm">{cashier.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${cashier.sales.toFixed(2)}</p>
                      <p className="text-purple-300 text-sm">Avg: ${cashier.avgSale.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
