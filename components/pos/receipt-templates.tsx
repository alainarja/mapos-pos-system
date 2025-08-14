"use client"

import React, { forwardRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Receipt as ReceiptIcon, Star, QrCode, MapPin, Phone, Mail } from "lucide-react"
import { ReceiptData } from "./receipt-preview"
import { PrintOptions } from "@/stores/print"

export interface ReceiptTemplateProps {
  receipt: ReceiptData
  options: PrintOptions
  storeName?: string
  storeAddress?: string
  storePhone?: string
  storeEmail?: string
  className?: string
}

// Classic Template - Traditional receipt layout
export const ClassicTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ receipt, options, storeName = "MAPOS Store", storeAddress, storePhone, storeEmail, className }, ref) => {
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
              <div className="text-xs text-gray-600 space-y-1">
                {storePhone && <p>Tel: {storePhone}</p>}
                {storeEmail && <p>Email: {storeEmail}</p>}
              </div>
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
                        {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-xs font-semibold">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
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
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
)

// Modern Template - Clean, minimalist design
export const ModernTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ receipt, options, storeName = "MAPOS Store", storeAddress, storePhone, storeEmail, className }, ref) => {
    const formatDateTime = (date: Date) => ({
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    })

    const { date, time } = formatDateTime(receipt.timestamp)

    return (
      <div ref={ref} className={`receipt-container ${className || ''}`}>
        <Card className="w-full max-w-sm mx-auto bg-white text-black border-0 shadow-2xl">
          <CardContent className="p-8 space-y-6 font-sans text-sm">
            {/* Header */}
            <div className="text-center space-y-3">
              {options.includeLogo && (
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                    <ReceiptIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-800">{storeName}</h1>
              {storeAddress && (
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{storeAddress}</span>
                </div>
              )}
              <div className="flex justify-center space-x-4 text-gray-600 text-sm">
                {storePhone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{storePhone}</span>
                  </div>
                )}
                {storeEmail && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{storeEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-1 rounded-full"></div>

            {/* Transaction Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Receipt #</span>
                  <p className="font-semibold">{receipt.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date & Time</span>
                  <p className="font-semibold">{date} {time}</p>
                </div>
                <div>
                  <span className="text-gray-500">Cashier</span>
                  <p className="font-semibold">{receipt.cashier}</p>
                </div>
                {options.includeCustomerInfo && receipt.customer && (
                  <div>
                    <span className="text-gray-500">Customer</span>
                    <p className="font-semibold">{receipt.customer.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Items Purchased
              </h3>
              {receipt.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="font-semibold text-gray-800">
                    ${item.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-0.5 rounded-full"></div>

            {/* Totals */}
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${receipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${receipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 bg-gray-50 rounded-lg p-3">
                <span>Total</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Method</span>
                <span className="font-medium">{receipt.paymentMethod}</span>
              </div>
            </div>

            {/* QR Code */}
            {options.includeBarcode && (
              <div className="text-center space-y-3 bg-gray-50 rounded-lg p-4">
                <QrCode className="w-16 h-16 mx-auto text-gray-600" />
                <p className="text-sm text-gray-600">{receipt.id}</p>
                <p className="text-xs text-gray-500">Scan for receipt details</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center space-y-3 text-gray-600">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-0.5 rounded-full"></div>
              <p className="font-semibold text-gray-800">Thank you for choosing us!</p>
              <p className="text-sm">We appreciate your business</p>
              <p className="text-xs">Return policy: 30 days with receipt</p>
              <Badge variant="outline" className="text-purple-600 border-purple-600 mt-3">
                <Star className="w-3 h-3 mr-1" />
                Powered by MAPOS
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
)

// Compact Template - Minimal thermal printer format
export const CompactTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ receipt, options, storeName = "MAPOS Store", storeAddress, storePhone, className }, ref) => {
    const formatDateTime = (date: Date) => ({
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    })

    const { date, time } = formatDateTime(receipt.timestamp)

    return (
      <div ref={ref} className={`receipt-container ${className || ''}`}>
        <div className="w-full max-w-xs mx-auto bg-white text-black font-mono text-xs leading-tight">
          <div className="p-3 space-y-2">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-bold text-sm">{storeName}</h2>
              {storeAddress && <p className="text-xs">{storeAddress}</p>}
              {storePhone && <p className="text-xs">{storePhone}</p>}
            </div>

            <div className="border-t border-gray-300 my-2"></div>

            {/* Transaction Info */}
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span>Receipt:</span>
                <span>{receipt.id}</span>
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
            </div>

            <div className="border-t border-gray-300 my-2"></div>

            {/* Items */}
            <div className="space-y-1">
              {receipt.items.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <span className="truncate pr-2">{item.name}</span>
                    <span>${item.total.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-600 ml-2">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 my-2"></div>

            {/* Totals */}
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${receipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${receipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-300 pt-1">
                <span>TOTAL:</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Payment:</span>
                <span>{receipt.paymentMethod}</span>
              </div>
            </div>

            {/* Barcode */}
            {options.includeBarcode && (
              <div className="text-center space-y-1 border-t border-gray-300 pt-2">
                <div className="font-mono tracking-wider">
                  |||| || ||| |||| |||
                </div>
                <div className="text-xs">{receipt.id}</div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-gray-600 border-t border-gray-300 pt-2">
              <p>Thank you!</p>
              <p>Return: 30 days w/ receipt</p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @media print {
            .receipt-container {
              width: 58mm;
              margin: 0;
              padding: 0;
            }
            
            @page {
              size: 58mm auto;
              margin: 2mm;
            }
          }
        `}</style>
      </div>
    )
  }
)

// Detailed Template - Comprehensive business receipt
export const DetailedTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ receipt, options, storeName = "MAPOS Store", storeAddress, storePhone, storeEmail, className }, ref) => {
    const formatDateTime = (date: Date) => ({
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    })

    const { date, time } = formatDateTime(receipt.timestamp)
    const totalItems = receipt.items.reduce((sum, item) => sum + item.quantity, 0)

    return (
      <div ref={ref} className={`receipt-container ${className || ''}`}>
        <Card className="w-full max-w-md mx-auto bg-white text-black border border-gray-300 shadow-lg">
          <CardContent className="p-6 space-y-4 font-serif text-sm">
            {/* Header */}
            <div className="text-center space-y-3 border-b-2 border-gray-800 pb-4">
              {options.includeLogo && (
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <ReceiptIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-800">{storeName}</h1>
              <div className="space-y-1 text-gray-600">
                {storeAddress && (
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{storeAddress}</span>
                  </div>
                )}
                <div className="flex justify-center space-x-6">
                  {storePhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{storePhone}</span>
                    </div>
                  )}
                  {storeEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{storeEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">Transaction Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Receipt Number</span>
                  <p className="font-bold text-lg">{receipt.id}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Total Items</span>
                  <p className="font-bold text-lg">{totalItems}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Date</span>
                  <p className="font-semibold">{date}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Time</span>
                  <p className="font-semibold">{time}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Cashier</span>
                  <p className="font-semibold">{receipt.cashier}</p>
                </div>
                {options.includeCustomerInfo && receipt.customer && (
                  <div>
                    <span className="text-gray-500 text-sm">Customer</span>
                    <p className="font-semibold">{receipt.customer.name}</p>
                    {receipt.customer.loyaltyPoints && (
                      <p className="text-sm text-purple-600">
                        {receipt.customer.loyaltyPoints} loyalty points
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 border-b border-gray-300 pb-2">
                Purchased Items
              </h3>
              <div className="space-y-3">
                {receipt.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Quantity: {item.quantity}</p>
                          <p>Unit Price: ${item.price.toFixed(2)}</p>
                          {item.discount && item.discount > 0 && (
                            <p className="text-green-600">
                              Discount: {item.discountType === 'percentage' ? `${item.discount}%` : `$${item.discount}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${item.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discounts and Coupons */}
            {(receipt.discountInfo || (receipt.appliedCoupons && receipt.appliedCoupons.length > 0)) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-green-800">Applied Discounts</h4>
                {receipt.discountInfo && (
                  <div className="flex justify-between text-green-700">
                    <span>Store Discount ({receipt.discountInfo.type === 'percentage' ? `${receipt.discountInfo.value}%` : `$${receipt.discountInfo.value}`})</span>
                    <span>-${(receipt.discountInfo.type === 'percentage' 
                      ? receipt.subtotal * (receipt.discountInfo.value / 100)
                      : Math.min(receipt.discountInfo.value, receipt.subtotal)
                    ).toFixed(2)}</span>
                  </div>
                )}
                {receipt.appliedCoupons && receipt.appliedCoupons.map((applied, index) => (
                  <div key={index} className="flex justify-between text-green-700">
                    <span>{applied.coupon.code} - {applied.coupon.name}</span>
                    <span>-${applied.discountAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg text-gray-800">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${receipt.subtotal.toFixed(2)}</span>
                </div>
                {receipt.totalSavings && receipt.totalSavings > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Total Savings</span>
                    <span>-${receipt.totalSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${receipt.tax.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-400 pt-2">
                  <div className="flex justify-between text-2xl font-bold text-gray-800">
                    <span>Total</span>
                    <span>${receipt.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-200">
                  <span>Payment Method</span>
                  <span className="font-semibold">{receipt.paymentMethod}</span>
                </div>
                {receipt.change && receipt.change > 0 && (
                  <div className="flex justify-between font-semibold">
                    <span>Change Given</span>
                    <span>${receipt.change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            {options.includeBarcode && (
              <div className="text-center space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <QrCode className="w-20 h-20 mx-auto text-gray-600" />
                <div className="space-y-1">
                  <p className="font-semibold">{receipt.id}</p>
                  <p className="text-sm text-gray-600">Scan for digital receipt</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center space-y-3 border-t-2 border-gray-800 pt-4">
              <h3 className="font-bold text-lg text-gray-800">Thank You for Your Business!</h3>
              <div className="space-y-2 text-gray-600">
                <p>We appreciate your trust in our products and services</p>
                <p className="font-semibold">Return Policy: 30 days with receipt</p>
                <p className="text-sm">For questions or concerns, please contact us</p>
              </div>
              <div className="pt-3">
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  <Star className="w-4 h-4 mr-2" />
                  Premium Service by MAPOS
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <style jsx>{`
          @media print {
            .receipt-container {
              width: auto;
              max-width: none;
              margin: 0;
              padding: 0;
            }
            
            @page {
              size: A4;
              margin: 15mm;
            }
          }
        `}</style>
      </div>
    )
  }
)

ClassicTemplate.displayName = "ClassicTemplate"
ModernTemplate.displayName = "ModernTemplate"
CompactTemplate.displayName = "CompactTemplate"
DetailedTemplate.displayName = "DetailedTemplate"

export const ReceiptTemplates = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  compact: CompactTemplate,
  detailed: DetailedTemplate
}

export type ReceiptTemplateName = keyof typeof ReceiptTemplates