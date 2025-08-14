"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Receipt, Download, Printer, Mail, Copy, Check } from "lucide-react"
import { useState } from "react"

interface ReturnsReceiptProps {
  returnTransaction: {
    id: string
    type: 'return' | 'exchange' | 'refund'
    receiptNumber: string
    date: string
    time: string
    originalTransaction?: {
      receiptNumber: string
      cashier: string
      date: string
      paymentMethod: string
    }
    returnItems: Array<{
      name: string
      price: number
      returnQuantity: number
      reason: string
      condition: string
    }>
    refundAmount: number
    refundMethod: string
    processedBy: string
  }
  onPrint?: () => void
  onDownload?: () => void
  onEmail?: () => void
  onClose?: () => void
}

export function ReturnsReceipt({
  returnTransaction,
  onPrint,
  onDownload,
  onEmail,
  onClose
}: ReturnsReceiptProps) {
  const [copied, setCopied] = useState(false)

  const formatReceiptContent = () => {
    const { 
      type, 
      receiptNumber, 
      date, 
      time, 
      originalTransaction, 
      returnItems, 
      refundAmount, 
      refundMethod,
      processedBy 
    } = returnTransaction

    return `
=================================
         MAPOS RETAIL SYSTEM
=================================
123 Main Street, Suite 100
Anytown, ST 12345
Phone: (555) 123-4567
Email: returns@maposretail.com

${type.toUpperCase()} RECEIPT
=================================
Date: ${date}
Time: ${time}
Reference #: ${receiptNumber}
Processed By: ${processedBy}

${originalTransaction ? `
ORIGINAL TRANSACTION:
Receipt: ${originalTransaction.receiptNumber}
Date: ${originalTransaction.date}
Cashier: ${originalTransaction.cashier}
Payment: ${originalTransaction.paymentMethod}
` : ''}

${type.toUpperCase()} ITEMS:
---------------------------------
${returnItems.map(item => `
${item.name}
  Qty: ${item.returnQuantity} x $${item.price.toFixed(2)} = $${(item.price * item.returnQuantity).toFixed(2)}
  Condition: ${item.condition}
  Reason: ${item.reason}
`).join('')}

=================================
TOTAL ${type.toUpperCase()} AMOUNT: $${refundAmount.toFixed(2)}
=================================

REFUND METHOD: ${refundMethod.toUpperCase()}
${refundMethod === 'original' && originalTransaction 
  ? `Refund will be processed to original ${originalTransaction.paymentMethod}` 
  : `Refund will be processed via ${refundMethod.toUpperCase()}`
}

${type === 'return' ? 'Thank you for your business!' : 'Enjoy your exchange!'}

This receipt serves as proof of your 
${type} transaction. Please retain for 
your records.

=================================
Customer Service: (555) 123-HELP
Returns Policy: 30 days with receipt
Visit us: www.maposretail.com
=================================
    `.trim()
  }

  const handlePrint = () => {
    const content = formatReceiptContent()
    const printWindow = window.open('', '_blank')
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${returnTransaction.type.toUpperCase()} Receipt - ${returnTransaction.receiptNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                line-height: 1.3;
                margin: 20px;
                max-width: 400px;
              }
              pre { 
                white-space: pre-wrap; 
                margin: 0;
              }
              @media print {
                body { margin: 10px; }
                @page { size: 80mm 200mm; margin: 0; }
              }
            </style>
          </head>
          <body>
            <pre>${content}</pre>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 1000);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
    
    if (onPrint) onPrint()
  }

  const handleDownload = () => {
    const content = formatReceiptContent()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    
    a.href = url
    a.download = `${returnTransaction.type}-receipt-${returnTransaction.receiptNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    if (onDownload) onDownload()
  }

  const handleCopy = async () => {
    const content = formatReceiptContent()
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy receipt', err)
    }
  }

  const handleEmail = () => {
    const content = formatReceiptContent()
    const subject = `${returnTransaction.type.toUpperCase()} Receipt - ${returnTransaction.receiptNumber}`
    const body = encodeURIComponent(content)
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
    
    window.open(mailtoUrl)
    if (onEmail) onEmail()
  }

  return (
    <div className="space-y-4">
      {/* Receipt Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Receipt className="w-5 h-5 mr-2" />
            {returnTransaction.type.charAt(0).toUpperCase() + returnTransaction.type.slice(1)} Receipt Generated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-blue-900">Reference: {returnTransaction.receiptNumber}</p>
              <p className="text-sm text-blue-700">{returnTransaction.date} at {returnTransaction.time}</p>
            </div>
            <Badge className="bg-blue-600 text-white">
              ${returnTransaction.refundAmount.toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Receipt Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-xs text-gray-700 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{formatReceiptContent()}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <Button
              onClick={handleCopy}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            
            <Button
              onClick={handleEmail}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Important Information</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Keep this receipt for your records</li>
                <li>• {returnTransaction.type === 'return' ? 'Refund processing may take 3-5 business days' : 'Exchange completed successfully'}</li>
                <li>• Contact customer service for any questions</li>
                <li>• Receipt number required for future inquiries</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}