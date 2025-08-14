"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useSettingsStore } from "@/stores/settings"
import { usePrintStore } from "@/stores/print"
import {
  Printer,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  Check,
  AlertCircle,
  TestTube,
  Save,
} from "lucide-react"

export function PrintSettings() {
  const { settings, updatePrintSettings } = useSettingsStore()
  const { 
    availablePrinters, 
    selectedPrinter, 
    printerStatus, 
    setSelectedPrinter, 
    refreshPrinters, 
    printReceipt, 
    generateReceipt 
  } = usePrintStore()
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings.print)
  
  const { toast } = useToast()

  const handleSettingChange = <K extends keyof typeof settings.print>(
    key: K,
    value: typeof settings.print[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
    setUnsavedChanges(true)
  }

  const handleSaveSettings = () => {
    updatePrintSettings(localSettings)
    setUnsavedChanges(false)
    toast({
      title: "Settings Saved",
      description: "Print settings have been updated successfully.",
    })
  }

  const handleRefreshPrinters = async () => {
    setIsRefreshing(true)
    try {
      await refreshPrinters()
      toast({
        title: "Printers Refreshed",
        description: "Printer list has been updated.",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh printer list.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleTestPrint = async () => {
    setIsTesting(true)
    try {
      // Generate a test receipt
      const testReceipt = generateReceipt(
        [
          { name: "Test Item", quantity: 1, price: 1.00, total: 1.00 }
        ],
        {
          method: "Test",
          subtotal: 1.00,
          tax: 0.08,
          total: 1.08
        },
        "System Test",
        undefined
      )

      const success = await printReceipt(testReceipt, {
        includeLogo: localSettings.includeLogo,
        includeBarcode: localSettings.includeBarcode,
        includeCustomerInfo: localSettings.includeCustomerInfo,
        paperSize: localSettings.paperSize,
        copies: 1
      })

      if (success) {
        toast({
          title: "Test Print Successful",
          description: "Test receipt printed successfully.",
        })
      } else {
        throw new Error("Print failed")
      }
    } catch (error) {
      toast({
        title: "Test Print Failed",
        description: error instanceof Error ? error.message : "Failed to print test receipt.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Print Settings</h2>
          <p className="text-purple-300">Configure automatic receipt printing and printer options</p>
        </div>
        {unsavedChanges && (
          <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Automatic Printing Settings */}
      <Card className="bg-slate-800/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Automatic Printing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto-print Enable */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium">Enable Auto-Print</Label>
                <p className="text-sm text-gray-400">Automatically print receipts after payment completion</p>
              </div>
              <Switch
                checked={localSettings.autoPrintEnabled}
                onCheckedChange={(checked) => handleSettingChange('autoPrintEnabled', checked)}
              />
            </div>

            {/* Print Immediately */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium">Print Immediately</Label>
                <p className="text-sm text-gray-400">Print receipt immediately without delay</p>
              </div>
              <Switch
                checked={localSettings.printImmediately}
                onCheckedChange={(checked) => handleSettingChange('printImmediately', checked)}
                disabled={!localSettings.autoPrintEnabled}
              />
            </div>

            {/* Show Preview */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium">Show Preview</Label>
                <p className="text-sm text-gray-400">Show receipt preview before printing</p>
              </div>
              <Switch
                checked={localSettings.showPreview}
                onCheckedChange={(checked) => handleSettingChange('showPreview', checked)}
                disabled={!localSettings.autoPrintEnabled}
              />
            </div>

            {/* Confirm Before Print */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium">Confirm Before Print</Label>
                <p className="text-sm text-gray-400">Ask for confirmation before printing</p>
              </div>
              <Switch
                checked={localSettings.confirmBeforePrint}
                onCheckedChange={(checked) => handleSettingChange('confirmBeforePrint', checked)}
                disabled={!localSettings.autoPrintEnabled}
              />
            </div>
          </div>

          <Separator className="bg-purple-500/20" />

          {/* Copy Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Copy Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white font-medium">Customer Copy</Label>
                  <p className="text-sm text-gray-400">Print a copy for the customer</p>
                </div>
                <Switch
                  checked={localSettings.customerCopy}
                  onCheckedChange={(checked) => handleSettingChange('customerCopy', checked)}
                  disabled={!localSettings.autoPrintEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white font-medium">Merchant Copy</Label>
                  <p className="text-sm text-gray-400">Print a copy for the merchant</p>
                </div>
                <Switch
                  checked={localSettings.merchantCopy}
                  onCheckedChange={(checked) => handleSettingChange('merchantCopy', checked)}
                  disabled={!localSettings.autoPrintEnabled}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-purple-500/20" />

          {/* Print Delay */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white font-medium">Print Delay (seconds)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={localSettings.printDelay}
                  onChange={(e) => handleSettingChange('printDelay', parseInt(e.target.value) || 0)}
                  className="bg-slate-700 border-purple-500/30 text-white"
                  disabled={!localSettings.autoPrintEnabled || localSettings.printImmediately}
                />
                <p className="text-sm text-gray-400">Delay before automatic printing starts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printer Management */}
      <Card className="bg-slate-800/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center justify-between">
            <div className="flex items-center">
              <Printer className="w-5 h-5 mr-2" />
              Printer Management
            </div>
            <Button
              onClick={handleRefreshPrinters}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Printer Selection */}
          <div className="space-y-2">
            <Label className="text-white font-medium">Default Printer</Label>
            <Select
              value={selectedPrinter}
              onValueChange={(value) => {
                setSelectedPrinter(value)
                handleSettingChange('defaultPrinter', value)
              }}
            >
              <SelectTrigger className="bg-slate-700 border-purple-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePrinters.map((printer) => (
                  <SelectItem key={printer.id} value={printer.id} disabled={printer.status === 'offline'}>
                    <div className="flex items-center justify-between w-full">
                      <span>{printer.name}</span>
                      <div className="flex items-center space-x-2 ml-4">
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
          </div>

          {/* Printer Status */}
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-300">Current Status:</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(printerStatus)}
                <Badge variant={printerStatus === 'ready' ? 'default' : 'destructive'}>
                  {printerStatus}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              {printerStatus === 'ready' && 'Printer is ready to print'}
              {printerStatus === 'busy' && 'Printer is currently printing'}
              {printerStatus === 'error' && 'Printer has encountered an error'}
              {printerStatus === 'offline' && 'Printer is offline or disconnected'}
            </p>
          </div>

          {/* Test Print */}
          <div className="flex justify-end">
            <Button
              onClick={handleTestPrint}
              disabled={isTesting || printerStatus !== 'ready'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTesting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4 mr-2" />
              )}
              Test Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Format Settings */}
      <Card className="bg-slate-800/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300">Receipt Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Include Logo */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium">Include Logo</Label>
                <p className="text-sm text-gray-400">Show store logo on receipts</p>
              </div>
              <Switch
                checked={localSettings.includeLogo}
                onCheckedChange={(checked) => handleSettingChange('includeLogo', checked)}
              />
            </div>

            {/* Include Barcode */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium">Include Barcode</Label>
                <p className="text-sm text-gray-400">Add barcode to receipts</p>
              </div>
              <Switch
                checked={localSettings.includeBarcode}
                onCheckedChange={(checked) => handleSettingChange('includeBarcode', checked)}
              />
            </div>

            {/* Include Customer Info */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium">Customer Information</Label>
                <p className="text-sm text-gray-400">Show customer details when available</p>
              </div>
              <Switch
                checked={localSettings.includeCustomerInfo}
                onCheckedChange={(checked) => handleSettingChange('includeCustomerInfo', checked)}
              />
            </div>

            {/* Paper Size */}
            <div className="space-y-2">
              <Label className="text-white font-medium">Paper Size</Label>
              <Select
                value={localSettings.paperSize}
                onValueChange={(value: 'thermal' | 'a4' | 'letter') => 
                  handleSettingChange('paperSize', value)
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}