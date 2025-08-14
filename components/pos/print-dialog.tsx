"use client"

import React, { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useSound } from "@/hooks/use-sound"
import { ReceiptPreview, ReceiptData } from "./receipt-preview"
import { PrintOptions, usePrintStore } from "@/stores/print"
import { useSettingsStore } from "@/stores/settings"
import {
  Printer,
  Eye,
  Settings,
  Check,
  AlertCircle,
  Copy,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react"

interface PrintDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  receipt: ReceiptData
  onPrintComplete?: () => void
  showPreview?: boolean
  allowMultipleCopies?: boolean
  showPrinterSelection?: boolean
}

interface Printer {
  id: string
  name: string
  status: 'ready' | 'busy' | 'error' | 'offline'
  isDefault: boolean
  type: 'thermal' | 'inkjet' | 'laser'
}

export function PrintDialog({
  isOpen,
  onOpenChange,
  receipt,
  onPrintComplete,
  showPreview = true,
  allowMultipleCopies = true,
  showPrinterSelection = true
}: PrintDialogProps) {
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    includeLogo: true,
    includeBarcode: true,
    includeCustomerInfo: true,
    paperSize: 'thermal',
    copies: 1,
  })
  
  const [selectedPrinter, setSelectedPrinter] = useState<string>('default')
  const [isPrinting, setIsPrinting] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview')
  
  const receiptRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { playSuccess, playError } = useSound()
  
  const { printReceipt, printerStatus } = usePrintStore()
  const { settings } = useSettingsStore()

  // Mock printer list - in a real app, this would come from the system
  const availablePrinters: Printer[] = [
    { id: 'default', name: 'Default Printer', status: 'ready', isDefault: true, type: 'thermal' },
    { id: 'thermal1', name: 'Star TSP143III (Thermal)', status: 'ready', isDefault: false, type: 'thermal' },
    { id: 'inkjet1', name: 'Canon PIXMA (Inkjet)', status: 'ready', isDefault: false, type: 'inkjet' },
    { id: 'laser1', name: 'Brother HL-L2350DW (Laser)', status: 'offline', isDefault: false, type: 'laser' },
  ]

  const handlePrint = async () => {
    setIsPrinting(true)
    
    try {
      // Print multiple copies if specified
      for (let i = 0; i < printOptions.copies; i++) {
        const success = await printReceipt({
          id: receipt.id,
          timestamp: receipt.timestamp,
          cashier: receipt.cashier,
          items: receipt.items,
          subtotal: receipt.subtotal,
          tax: receipt.tax,
          total: receipt.total,
          totalSavings: receipt.totalSavings,
          paymentMethod: receipt.paymentMethod,
          discountInfo: receipt.discountInfo,
          appliedCoupons: receipt.appliedCoupons,
          customer: receipt.customer,
        }, printOptions)
        
        if (!success) {
          throw new Error(`Failed to print copy ${i + 1}`)
        }
        
        // Small delay between copies
        if (i < printOptions.copies - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      await playSuccess()
      
      const copyText = printOptions.copies > 1 ? ` (${printOptions.copies} copies)` : ''
      toast({
        title: "Print Successful!",
        description: `Receipt printed successfully${copyText}`,
      })
      
      onPrintComplete?.()
      onOpenChange(false)
      
    } catch (error) {
      await playError()
      toast({
        title: "Print Failed",
        description: error instanceof Error ? error.message : "Failed to print receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPrinting(false)
    }
  }

  const handlePreviewPrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const receiptHTML = receiptRef.current.innerHTML
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Receipt Preview - ${receipt.id}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: 'Courier New', monospace;
                background: white;
              }
              @media print {
                body { padding: 0; margin: 0; }
                @page { 
                  size: ${printOptions.paperSize === 'thermal' ? '80mm 200mm' : 'A4'}; 
                  margin: 5mm; 
                }
              }
            </style>
          </head>
          <body>
            ${receiptHTML}
          </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const handleSavePDF = () => {
    // In a real implementation, this would generate a proper PDF
    toast({
      title: "PDF Generation",
      description: "PDF generation would be implemented here using a library like jsPDF",
    })
  }

  const updatePrintOption = <K extends keyof PrintOptions>(
    key: K,
    value: PrintOptions[K]
  ) => {
    setPrintOptions(prev => ({ ...prev, [key]: value }))
  }

  const getStatusIcon = (status: Printer['status']) => {
    switch (status) {
      case 'ready':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'busy':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'offline':
        return <WifiOff className="w-4 h-4 text-gray-500" />
      default:
        return <Printer className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-800 border-purple-500/30 text-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-purple-300 flex items-center">
            <Printer className="w-5 h-5 mr-2" />
            Print Receipt #{receipt.id}
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[600px]">
          {/* Left Panel - Preview */}
          {showPreview && (
            <div className="flex-1 flex flex-col">
              <div className="flex border-b border-purple-500/20 mb-4">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'preview'
                      ? 'border-purple-400 text-purple-300'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-4 h-4 mr-2 inline" />
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'settings'
                      ? 'border-purple-400 text-purple-300'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2 inline" />
                  Settings
                </button>
              </div>

              <div className="flex-1 overflow-auto">
                {activeTab === 'preview' ? (
                  <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
                    <ReceiptPreview
                      ref={receiptRef}
                      receipt={receipt}
                      options={printOptions}
                      storeName={settings.store.name}
                      storeAddress={`${settings.store.address.street}, ${settings.store.address.city}, ${settings.store.address.state} ${settings.store.address.zipCode}`}
                      storePhone={settings.store.phone}
                    />
                  </div>
                ) : (
                  <div className="space-y-4 p-4">
                    {/* Print Options */}
                    <Card className="bg-slate-700/30 border-purple-500/20">
                      <CardContent className="p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-purple-300">Print Options</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="include-logo"
                              checked={printOptions.includeLogo}
                              onCheckedChange={(checked) => updatePrintOption('includeLogo', !!checked)}
                            />
                            <Label htmlFor="include-logo" className="text-sm text-white">
                              Include Logo
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="include-barcode"
                              checked={printOptions.includeBarcode}
                              onCheckedChange={(checked) => updatePrintOption('includeBarcode', !!checked)}
                            />
                            <Label htmlFor="include-barcode" className="text-sm text-white">
                              Include Barcode
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="include-customer"
                              checked={printOptions.includeCustomerInfo}
                              onCheckedChange={(checked) => updatePrintOption('includeCustomerInfo', !!checked)}
                            />
                            <Label htmlFor="include-customer" className="text-sm text-white">
                              Customer Info
                            </Label>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="paper-size" className="text-sm text-purple-300">
                              Paper Size
                            </Label>
                            <Select
                              value={printOptions.paperSize}
                              onValueChange={(value: 'thermal' | 'a4' | 'letter') => 
                                updatePrintOption('paperSize', value)
                              }
                            >
                              <SelectTrigger className="bg-slate-700 border-purple-500/30">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="thermal">Thermal (80mm)</SelectItem>
                                <SelectItem value="a4">A4</SelectItem>
                                <SelectItem value="letter">Letter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {allowMultipleCopies && (
                            <div className="space-y-2">
                              <Label htmlFor="copies" className="text-sm text-purple-300">
                                Copies
                              </Label>
                              <Input
                                id="copies"
                                type="number"
                                min="1"
                                max="10"
                                value={printOptions.copies}
                                onChange={(e) => updatePrintOption('copies', Math.max(1, parseInt(e.target.value) || 1))}
                                className="bg-slate-700 border-purple-500/30 text-white"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Panel - Controls */}
          <div className="w-80 border-l border-purple-500/20 pl-6 space-y-4">
            {/* Printer Selection */}
            {showPrinterSelection && (
              <Card className="bg-slate-700/30 border-purple-500/20">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-purple-300">Printer Selection</h3>
                  
                  <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                    <SelectTrigger className="bg-slate-700 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePrinters.map((printer) => (
                        <SelectItem key={printer.id} value={printer.id} disabled={printer.status === 'offline'}>
                          <div className="flex items-center justify-between w-full">
                            <span>{printer.name}</span>
                            <div className="flex items-center space-x-1 ml-2">
                              {getStatusIcon(printer.status)}
                              {printer.isDefault && (
                                <Badge variant="outline" className="text-xs">Default</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="text-xs text-gray-400">
                    Status: {availablePrinters.find(p => p.id === selectedPrinter)?.status || 'Unknown'}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-slate-700/30 border-purple-500/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-purple-300">Quick Actions</h3>
                
                <div className="space-y-2">
                  <Button
                    onClick={handlePreviewPrint}
                    variant="outline"
                    className="w-full justify-start border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Print
                  </Button>
                  
                  <Button
                    onClick={handleSavePDF}
                    variant="outline"
                    className="w-full justify-start border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Save as PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Print Status */}
            <Card className="bg-slate-700/30 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-300">Print Status:</span>
                  <Badge 
                    variant={printerStatus === 'ready' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {printerStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Separator className="bg-purple-500/20" />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handlePrint}
                disabled={isPrinting || printerStatus !== 'ready'}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {isPrinting ? (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Printing...
                  </div>
                ) : (
                  <>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Receipt {printOptions.copies > 1 && `(${printOptions.copies} copies)`}
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}