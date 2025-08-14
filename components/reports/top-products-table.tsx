"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category?: string
}

interface TopProduct {
  product: Product
  quantitySold: number
  revenue: number
}

interface TopProductsTableProps {
  products: TopProduct[]
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No product data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-purple-100">
          <tr>
            <th className="text-left p-4 font-medium text-sm">Rank</th>
            <th className="text-left p-4 font-medium text-sm">Product</th>
            <th className="text-left p-4 font-medium text-sm">Category</th>
            <th className="text-left p-4 font-medium text-sm">Quantity Sold</th>
            <th className="text-left p-4 font-medium text-sm">Revenue</th>
            <th className="text-left p-4 font-medium text-sm">Unit Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, index) => (
            <tr key={item.product.id} className="border-b border-purple-50 hover:bg-purple-50/50">
              <td className="p-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 font-bold text-sm">
                  {index + 1}
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.product.name}</p>
                    <p className="text-xs text-slate-500">ID: {item.product.id}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <Badge variant="outline" className="text-xs">
                  {item.product.category || 'Uncategorized'}
                </Badge>
              </td>
              <td className="p-4">
                <span className="font-semibold text-sm">{item.quantitySold}</span>
              </td>
              <td className="p-4">
                <span className="font-semibold text-sm text-green-600">
                  ${item.revenue.toFixed(2)}
                </span>
              </td>
              <td className="p-4">
                <span className="font-semibold text-sm text-purple-600">
                  ${item.product.price.toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}