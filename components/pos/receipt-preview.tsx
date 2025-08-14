"use client"

import React, { forwardRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Receipt as ReceiptIcon, Star } from "lucide-react"
import { PrintOptions } from "@/stores/print"

export interface ReceiptData {
  id: string
  timestamp: Date
  cashier: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
    discount?: number
    discountType?: 'percentage' | 'fixed'
  }>
  subtotal: number
  tax: number
  total: number
  totalSavings?: number
  paymentMethod: string
  discountInfo?: {
    type: 'percentage' | 'fixed'
    value: number
    reason?: string
    managerId?: string
    timestamp: Date
  } | null
  appliedCoupons?: Array<{
    coupon: {
      code: string
      name: string
      type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'category_discount'
      value: number
    }
    discountAmount: number
    appliedAt: Date
  }>
  customer?: {
    name: string
    email?: string
    loyaltyPoints?: number
  }
  change?: number
}

interface ReceiptPreviewProps {
  receipt: ReceiptData
  options: PrintOptions
  storeName?: string
  storeAddress?: string
  storePhone?: string
  className?: string
}

export const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(
  ({ receipt, options, storeName = "MAPOS Store", storeAddress, storePhone, className }, ref) => {
    const formatDateTime = (date: Date) => ({
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    })

    const { date, time } = formatDateTime(receipt.timestamp)

    return (
      <div ref={ref} className={`receipt-container ${className || ''}`}>
        <Card className="w-full max-w-sm mx-auto bg-white text-black border border-gray-200 shadow-lg">
          <CardContent className="p-6 space-y-4 font-mono text-sm">
            {/* Header */}
            <div className="text-center space-y-2">
              {options.includeLogo && (
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <ReceiptIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
              <h2 className="text-lg font-bold">{storeName}</h2>
              {storeAddress && (
                <p className="text-xs text-gray-600 leading-tight">
                  {storeAddress}
                </p>
              )}
              {storePhone && (
                <p className="text-xs text-gray-600">Phone: {storePhone}</p>
              )}
            </div>

            <Separator className="bg-gray-300" />

            {/* Transaction Info */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-semibold">{receipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{date}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{time}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{receipt.cashier}</span>
              </div>
              {options.includeCustomerInfo && receipt.customer && (
                <>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{receipt.customer.name}</span>
                  </div>
                  {receipt.customer.loyaltyPoints && (
                    <div className="flex justify-between">
                      <span>Loyalty Points:</span>
                      <span>{receipt.customer.loyaltyPoints}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <Separator className="bg-gray-300" />

            {/* Items */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-center">ITEMS PURCHASED</h3>
              {receipt.items.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <div className="text-xs font-medium">{item.name}</div>
                      <div className="text-xs text-gray-600">
                        {item.quantity} @ ${item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-xs font-semibold">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                  {item.discount && item.discount > 0 && (
                    <div className="flex justify-between text-xs text-green-600 ml-2">
                      <span>Item Discount:</span>
                      <span>
                        -${item.discountType === 'fixed' 
                          ? item.discount.toFixed(2)
                          : (item.total * (item.discount / 100)).toFixed(2)
                        }
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Separator className="bg-gray-300" />

            {/* Totals */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${receipt.subtotal.toFixed(2)}</span>
              </div>
              
              {receipt.discountInfo && (
                <div className="flex justify-between text-blue-600">
                  <span>
                    Store Discount ({receipt.discountInfo.type === 'percentage' 
                      ? `${receipt.discountInfo.value}%` 
                      : `$${receipt.discountInfo.value}`}):
                  </span>
                  <span>
                    -${(receipt.discountInfo.type === 'percentage' 
                      ? receipt.subtotal * (receipt.discountInfo.value / 100)
                      : Math.min(receipt.discountInfo.value, receipt.subtotal)
                    ).toFixed(2)}
                  </span>
                </div>
              )}
              
              {receipt.appliedCoupons && receipt.appliedCoupons.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-gray-200">
                  <div className="text-xs font-semibold text-orange-600">COUPONS APPLIED:</div>
                  {receipt.appliedCoupons.map((applied, index) => (
                    <div key={index} className="flex justify-between text-xs text-orange-600">
                      <span>{applied.coupon.code} - {applied.coupon.name}</span>
                      <span>-${applied.discountAmount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {receipt.totalSavings && receipt.totalSavings > 0 && (
                <div className="flex justify-between text-green-600 font-semibold border-t border-gray-200 pt-1">
                  <span>YOU SAVED:</span>
                  <span>${receipt.totalSavings.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${receipt.tax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-base border-t-2 border-gray-400 pt-1">
                <span>TOTAL:</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span>{receipt.paymentMethod}</span>
              </div>
              
              {receipt.change && receipt.change > 0 && (
                <div className="flex justify-between font-semibold">
                  <span>Change:</span>
                  <span>${receipt.change.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Barcode */}
            {options.includeBarcode && (
              <div className="text-center space-y-2 border-t border-gray-200 pt-3">
                <div className="font-mono text-lg tracking-wider">
                  |||| || ||| |||| |||
                </div>
                <div className="text-xs">{receipt.id}</div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center space-y-1 text-xs text-gray-600 border-t border-gray-200 pt-3">
              <p className="font-semibold">Thank you for your business!</p>
              <p>Please keep your receipt</p>
              <p>Return policy: 30 days with receipt</p>
              <div className="pt-2 text-xs">
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  <Star className="w-3 h-3 mr-1" />
                  Powered by MAPOS
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <style jsx>{`
          @media print {
            .receipt-container {
              width: 80mm;
              margin: 0;
              padding: 0;
            }
            
            .receipt-container * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            @page {
              size: 80mm 200mm;
              margin: 5mm;
            }
          }
        `}</style>
      </div>
    )
  }
)

ReceiptPreview.displayName = "ReceiptPreview"