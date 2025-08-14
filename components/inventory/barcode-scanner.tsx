"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Camera, 
  Keyboard, 
  CheckCircle, 
  XCircle,
  Package,
  Search
} from "lucide-react"
import { useInventoryStore } from "@/stores/inventory"
import Image from "next/image"

interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onScan: (barcode: string) => void
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const { getProductByBarcode } = useInventoryStore()
  const [manualBarcode, setManualBarcode] = useState('')
  const [scanResult, setScanResult] = useState<{
    barcode: string
    found: boolean
    product?: any
  } | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanMethod, setScanMethod] = useState<'camera' | 'manual'>('manual')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (open) {
      setScanResult(null)
      setManualBarcode('')
    }
  }, [open])

  const handleManualScan = (barcode: string) => {
    if (!barcode.trim()) return

    const product = getProductByBarcode(barcode.trim())
    setScanResult({
      barcode: barcode.trim(),
      found: !!product,
      product
    })
  }

  const handleCameraScan = async () => {
    setIsScanning(true)
    
    try {
      // Simulate camera scanning - in a real app, you'd use a barcode scanning library
      // like QuaggaJS, ZXing, or react-barcode-reader
      setTimeout(() => {
        // Mock scan result - randomly pick a product barcode for demo
        const mockBarcodes = [
          "1234567890123",
          "1234567890124", 
          "1234567890125",
          "1234567890126",
          "9999999999999" // Non-existent barcode for demo
        ]
        
        const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]
        const product = getProductByBarcode(randomBarcode)
        
        setScanResult({
          barcode: randomBarcode,
          found: !!product,
          product
        })
        setIsScanning(false)
      }, 2000)
      
    } catch (error) {
      console.error('Camera scan error:', error)
      setIsScanning(false)
    }
  }

  const handleConfirmScan = () => {
    if (scanResult) {
      onScan(scanResult.barcode)
    }
  }

  const handleReset = () => {
    setScanResult(null)
    setManualBarcode('')
  }

  return (
    <Dialog open={open} onOpenChange={() => !isScanning && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Barcode Scanner
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={scanMethod} onValueChange={(value) => setScanMethod(value as 'camera' | 'manual')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Camera Scan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Enter Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Scan or type barcode..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualScan(manualBarcode)
                    }
                  }}
                />
                <Button
                  onClick={() => handleManualScan(manualBarcode)}
                  disabled={!manualBarcode.trim()}
                  variant="outline"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="camera" className="space-y-4">
            <div className="space-y-4">
              <Card className="bg-slate-100">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-slate-200 rounded-lg mx-auto flex items-center justify-center">
                      <Camera className="h-12 w-12 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Camera Scanner</p>
                      <p className="text-sm text-slate-600">
                        Position barcode in camera view
                      </p>
                    </div>
                    <Button
                      onClick={handleCameraScan}
                      disabled={isScanning}
                      className="w-full"
                    >
                      {isScanning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Start Camera Scan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-slate-500 text-center">
                Note: This is a demo. Real implementation would use camera API.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Scan Result */}
        {scanResult && (
          <Card className={`mt-4 ${scanResult.found ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {scanResult.found ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">
                      {scanResult.found ? 'Product Found' : 'Product Not Found'}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {scanResult.barcode}
                    </Badge>
                  </div>
                  
                  {scanResult.found && scanResult.product ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
                        <Image
                          src={scanResult.product.image || "/placeholder.svg"}
                          alt={scanResult.product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{scanResult.product.name}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>${scanResult.product.price}</span>
                          <span>•</span>
                          <span>Stock: {scanResult.product.stock}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">
                      No product found with this barcode. You can add it as a new product.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isScanning}
          >
            Cancel
          </Button>
          
          {scanResult && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isScanning}
            >
              Scan Again
            </Button>
          )}
          
          <Button
            onClick={handleConfirmScan}
            disabled={!scanResult || isScanning}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            {scanResult?.found ? 'Use Product' : 'Add New Product'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}