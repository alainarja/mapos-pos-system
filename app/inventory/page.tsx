"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  Download,
  Upload,
  Filter,
  ArrowLeft,
  Eye
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useInventoryStore } from "@/stores/inventory"
import { Product, Category } from "@/types"
import { ProductDialog } from "@/components/inventory/product-dialog"
import { CategoryDialog } from "@/components/inventory/category-dialog"
import { StockAdjustmentDialog } from "@/components/inventory/stock-adjustment-dialog"
import { BarcodeScanner } from "@/components/inventory/barcode-scanner"

export default function InventoryPage() {
  const {
    products,
    categories,
    alerts,
    selectedCategory,
    searchTerm,
    setSelectedCategory,
    setSearchTerm,
    getFilteredProducts,
    getLowStockProducts,
    getOutOfStockProducts,
    updateProduct,
    deleteProduct,
    markAlertAsRead
  } = useInventoryStore()

  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showStockDialog, setShowStockDialog] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredProducts = getFilteredProducts()
  const lowStockProducts = getLowStockProducts()
  const outOfStockProducts = getOutOfStockProducts()

  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)
  const totalCost = products.reduce((sum, product) => sum + ((product.cost || 0) * product.stock), 0)

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowProductDialog(true)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id)
    }
  }

  const handleStockAdjustment = (product: Product) => {
    setSelectedProduct(product)
    setShowStockDialog(true)
  }

  const handleBarcodeScanned = (barcode: string) => {
    // Handle barcode scan result
    console.log("Scanned barcode:", barcode)
    setShowBarcodeScanner(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to POS
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Inventory Management
                </h1>
                <p className="text-sm text-slate-600">Manage your products, categories, and stock levels</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowBarcodeScanner(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                Scan Product
              </Button>
              <Button
                onClick={() => {
                  setEditingCategory(null)
                  setShowCategoryDialog(true)
                }}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setShowProductDialog(true)
                }}
                className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Products</p>
                  <p className="text-2xl font-bold text-slate-900">{products.length}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-slate-900">${totalValue.toFixed(2)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-slate-900">{lowStockProducts.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-slate-900">{outOfStockProducts.length}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({alerts.filter(a => !a.isRead).length})</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search products by name, SKU, or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-purple-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="All">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      List
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="bg-white/80 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                          <Badge
                            variant={product.stock === 0 ? "destructive" : product.stock <= (product.minStock || 0) ? "secondary" : "default"}
                            className="ml-2"
                          >
                            {product.stock}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-purple-600 font-bold">${product.price}</span>
                          <span className="text-slate-500">SKU: {product.sku}</span>
                        </div>
                        <div className="flex items-center gap-1 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockAdjustment(product)}
                            className="flex-1"
                          >
                            <Package className="h-3 w-3 mr-1" />
                            Stock
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-purple-100">
                        <tr>
                          <th className="text-left p-4 font-medium">Product</th>
                          <th className="text-left p-4 font-medium">SKU</th>
                          <th className="text-left p-4 font-medium">Category</th>
                          <th className="text-left p-4 font-medium">Price</th>
                          <th className="text-left p-4 font-medium">Stock</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b border-purple-50 hover:bg-purple-50/50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
                                  <Image
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{product.name}</p>
                                  <p className="text-xs text-slate-500">{product.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm">{product.sku}</td>
                            <td className="p-4 text-sm">{product.category}</td>
                            <td className="p-4 text-sm font-semibold text-purple-600">${product.price}</td>
                            <td className="p-4 text-sm">{product.stock}</td>
                            <td className="p-4">
                              <Badge
                                variant={product.stock === 0 ? "destructive" : product.stock <= (product.minStock || 0) ? "secondary" : "default"}
                              >
                                {product.stock === 0 ? "Out of Stock" : product.stock <= (product.minStock || 0) ? "Low Stock" : "In Stock"}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStockAdjustment(product)}
                                >
                                  <Package className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="bg-white/80 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{category.icon}</div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-slate-500">{category.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {products.filter(p => p.category === category.name).length} items
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCategory(category)
                          setShowCategoryDialog(true)
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No alerts</h3>
                    <p className="text-slate-500">All your inventory levels are looking good!</p>
                  </CardContent>
                </Card>
              ) : (
                alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={`bg-white/80 backdrop-blur-sm border-purple-100 ${!alert.isRead ? 'ring-2 ring-purple-200' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{alert.message}</p>
                            <p className="text-xs text-slate-500">
                              {alert.createdAt.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!alert.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAlertAsRead(alert.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="text-lg">Inventory Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Products</span>
                    <span className="font-semibold">{products.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Value (Retail)</span>
                    <span className="font-semibold">${totalValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Cost</span>
                    <span className="font-semibold">${totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Potential Profit</span>
                    <span className="font-semibold text-green-600">${(totalValue - totalCost).toFixed(2)}</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="text-lg">Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Out of Stock</span>
                    <span className="font-semibold text-red-600">{outOfStockProducts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Low Stock</span>
                    <span className="font-semibold text-yellow-600">{lowStockProducts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Healthy Stock</span>
                    <span className="font-semibold text-green-600">
                      {products.length - outOfStockProducts.length - lowStockProducts.length}
                    </span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Stock Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ProductDialog
        open={showProductDialog}
        onClose={() => {
          setShowProductDialog(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
      />

      <CategoryDialog
        open={showCategoryDialog}
        onClose={() => {
          setShowCategoryDialog(false)
          setEditingCategory(null)
        }}
        category={editingCategory}
      />

      <StockAdjustmentDialog
        open={showStockDialog}
        onClose={() => {
          setShowStockDialog(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
      />

      <BarcodeScanner
        open={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
      />
    </div>
  )
}