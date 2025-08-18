"use client"

import { CartItem } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Receipt } from 'lucide-react'

interface TaxBreakdownProps {
  items: CartItem[]
  className?: string
}

interface TaxSummary {
  taxRate: number
  taxCategory?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    tax: number
  }>
  totalTaxableAmount: number
  totalTax: number
}

export function TaxBreakdown({ items, className = "" }: TaxBreakdownProps) {
  // Group items by tax rate
  const taxGroups = items.reduce((groups, item) => {
    const taxRate = item.taxRate || 0
    const key = `${taxRate}`
    
    if (!groups[key]) {
      groups[key] = {
        taxRate,
        taxCategory: (item as any).taxCategory || 'standard',
        items: [],
        totalTaxableAmount: 0,
        totalTax: 0
      }
    }
    
    const itemTotal = item.price * item.quantity
    const itemTax = itemTotal * taxRate
    
    groups[key].items.push({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      tax: itemTax
    })
    groups[key].totalTaxableAmount += itemTotal
    groups[key].totalTax += itemTax
    
    return groups
  }, {} as Record<string, TaxSummary>)

  const totalTax = Object.values(taxGroups).reduce((sum, group) => sum + group.totalTax, 0)
  const hasMultipleTaxRates = Object.keys(taxGroups).length > 1

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Receipt className="h-4 w-4" />
          Tax Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(taxGroups).map(([key, group]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={group.taxRate === 0 ? "secondary" : "default"}>
                  {group.taxRate === 0 ? 'Tax Exempt' : `${(group.taxRate * 100).toFixed(1)}%`}
                </Badge>
                {group.taxCategory && (
                  <span className="text-xs text-gray-500 capitalize">
                    {group.taxCategory}
                  </span>
                )}
              </div>
              <span className="font-semibold">
                ${group.totalTax.toFixed(2)}
              </span>
            </div>
            
            {hasMultipleTaxRates && (
              <div className="text-xs text-gray-600 space-y-1 ml-2 border-l-2 border-gray-200 pl-2">
                {group.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.name} (×{item.quantity})</span>
                    <span>${item.tax.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {hasMultipleTaxRates && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between font-semibold">
              <span>Total Tax:</span>
              <span>${totalTax.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function InlineTaxDisplay({ items }: { items: CartItem[] }) {
  const taxGroups = items.reduce((groups, item) => {
    const taxRate = item.taxRate || 0
    const key = taxRate
    
    if (!groups[key]) {
      groups[key] = 0
    }
    
    const itemTotal = item.price * item.quantity
    groups[key] += itemTotal * taxRate
    
    return groups
  }, {} as Record<number, number>)

  const totalTax = Object.values(taxGroups).reduce((sum, tax) => sum + tax, 0)
  const taxRates = Object.keys(taxGroups).map(Number).sort((a, b) => b - a)

  if (taxRates.length === 1) {
    const rate = taxRates[0]
    return (
      <span>
        Tax {rate === 0 ? '(Exempt)' : `(${(rate * 100).toFixed(1)}%)`}: ${totalTax.toFixed(2)}
      </span>
    )
  }

  return (
    <span className="space-x-1">
      <span>Tax (Mixed Rates):</span>
      <span>${totalTax.toFixed(2)}</span>
    </span>
  )
}