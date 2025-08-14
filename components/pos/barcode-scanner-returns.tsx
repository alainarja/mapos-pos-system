"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scan, Camera, X, CheckCircle, AlertCircle } from "lucide-react"

interface BarcodeScannerReturnsProps {
  onScanComplete: (result: string) => void
  onCancel: () => void
  isOpen: boolean
}

export function BarcodeScannerReturns({ onScanComplete, onCancel, isOpen }: BarcodeScannerReturnsProps) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScan, setLastScan] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Simulate barcode scanning (since we can't access real camera in demo)
  const startScanning = async () => {
    try {
      setScanning(true)
      setError(null)
      
      // In a real implementation, this would access the camera
      // For demo purposes, we'll simulate scanning after a delay
      setTimeout(() => {
        // Simulate successful barcode scan with receipt number pattern
        const mockReceiptNumbers = [
          "20240813-1234-001",
          "20240812-5678-002", 
          "20240811-9012-003",
          "20240810-3456-004",
          "20240809-7890-005"
        ]
        
        const randomReceipt = mockReceiptNumbers[Math.floor(Math.random() * mockReceiptNumbers.length)]
        setLastScan(randomReceipt)
        setScanning(false)
        onScanComplete(randomReceipt)
      }, 2000)
      
    } catch (err) {
      setError("Failed to access camera. Please check permissions.")
      setScanning(false)
    }
  }

  const stopScanning = () => {
    setScanning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-gray-900">
              <Scan className="w-5 h-5 mr-2" />
              Scan Receipt Barcode
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Preview Area */}
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            {scanning ? (
              <div className="text-center">
                <div className="animate-pulse">
                  <Camera className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Scanning for barcode...</p>
                <div className="mt-2">
                  <div className="inline-block w-8 h-1 bg-blue-600 animate-ping"></div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Camera preview will appear here</p>
              </div>
            )}
          </div>

          {/* Scan Result */}
          {lastScan && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Scan Successful</p>
                    <p className="text-sm text-green-600 font-mono">{lastScan}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Hold receipt steady in camera view</li>
              <li>• Ensure barcode is clearly visible</li>
              <li>• Wait for automatic detection</li>
              <li>• Good lighting improves accuracy</li>
            </ul>
          </div>

          {/* Scan Controls */}
          <div className="flex space-x-2">
            {!scanning ? (
              <Button 
                onClick={startScanning} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={scanning}
              >
                <Scan className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <Button 
                onClick={stopScanning} 
                variant="outline" 
                className="flex-1"
              >
                Stop Scanning
              </Button>
            )}
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          {/* Manual Entry Option */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Having trouble? Try manual entry instead
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}