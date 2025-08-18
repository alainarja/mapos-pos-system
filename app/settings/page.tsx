"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Store,
  Receipt,
  CreditCard,
  Package,
  Palette,
  Volume2,
  Download,
  Upload,
  Save,
  RefreshCw,
  DollarSign,
  ArrowRightLeft
} from "lucide-react"
import Link from "next/link"
import { useSettingsStore } from "@/stores/settings"
import { SoundButton } from "@/components/ui/sound-button"
import { useSound } from "@/hooks/use-sound"

export default function SettingsPage() {
  const {
    settings,
    updateStoreSettings,
    updateCurrencySettings,
    updateReceiptSettings,
    updatePaymentSettings,
    updateInventorySettings,
    updateThemeSettings,
    updateSoundSettings,
    resetSettings,
    exportSettings,
    importSettings
  } = useSettingsStore()

  const { playClick, playSuccess, playError, playSpecial } = useSound()
  const [isLoading, setIsLoading] = useState(false)
  const [importText, setImportText] = useState("")

  const handleExport = () => {
    const settingsJson = exportSettings()
    const blob = new Blob([settingsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mapos-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    try {
      const success = importSettings(importText)
      if (success) {
        alert('Settings imported successfully!')
        setImportText("")
      } else {
        alert('Failed to import settings. Please check the format.')
      }
    } catch (error) {
      alert('Error importing settings: ' + (error as Error).message)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetSettings()
      alert('Settings reset to defaults')
    }
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
                  Settings
                </h1>
                <p className="text-sm text-slate-600">Configure your POS system</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="currency">Currency</TabsTrigger>
            <TabsTrigger value="receipt">Receipt</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="sound">Sound</TabsTrigger>
          </TabsList>

          <TabsContent value="store">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={settings.store.name}
                      onChange={(e) => updateStoreSettings({ name: e.target.value })}
                      placeholder="Your Store Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={settings.store.phone}
                      onChange={(e) => updateStoreSettings({ phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.store.email}
                      onChange={(e) => updateStoreSettings({ email: e.target.value })}
                      placeholder="store@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={settings.store.taxRate * 100}
                      onChange={(e) => updateStoreSettings({ taxRate: parseFloat(e.target.value) / 100 || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={settings.store.currency}
                      onChange={(e) => updateStoreSettings({ currency: e.target.value })}
                      placeholder="USD"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={settings.store.timezone}
                      onChange={(e) => updateStoreSettings({ timezone: e.target.value })}
                      placeholder="America/New_York"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Street Address"
                      value={settings.store.address.street}
                      onChange={(e) => updateStoreSettings({
                        address: { ...settings.store.address, street: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="City"
                      value={settings.store.address.city}
                      onChange={(e) => updateStoreSettings({
                        address: { ...settings.store.address, city: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="State"
                      value={settings.store.address.state}
                      onChange={(e) => updateStoreSettings({
                        address: { ...settings.store.address, state: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="ZIP Code"
                      value={settings.store.address.zipCode}
                      onChange={(e) => updateStoreSettings({
                        address: { ...settings.store.address, zipCode: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currency">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  Multi-Currency Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exchangeRate">USD to LBP Exchange Rate</Label>
                    <Input
                      id="exchangeRate"
                      type="number"
                      min="1"
                      step="1"
                      value={settings.currency.exchangeRate}
                      onChange={(e) => updateCurrencySettings({ exchangeRate: parseFloat(e.target.value) || 89500 })}
                      placeholder="89500"
                    />
                    <p className="text-sm text-slate-500">Current rate: 1 USD = {settings.currency.exchangeRate.toLocaleString()} LBP</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Currency</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={settings.currency.primaryCurrency === 'USD' ? 'default' : 'outline'}
                        onClick={() => updateCurrencySettings({ primaryCurrency: 'USD' })}
                        className="flex-1"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        USD
                      </Button>
                      <Button
                        variant={settings.currency.primaryCurrency === 'LBP' ? 'default' : 'outline'}
                        onClick={() => updateCurrencySettings({ primaryCurrency: 'LBP' })}
                        className="flex-1"
                      >
                        🇱🇧 LBP
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Both Currencies</Label>
                    <p className="text-sm text-slate-500">Display prices in both USD and LBP throughout the POS</p>
                  </div>
                  <Switch
                    checked={settings.currency.showBothCurrencies}
                    onCheckedChange={(checked) => updateCurrencySettings({ showBothCurrencies: checked })}
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-slate-800">Cash Payment Options</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Accept USD Cash</Label>
                      <p className="text-sm text-slate-500">Allow customers to pay with US Dollars</p>
                    </div>
                    <Switch
                      checked={settings.currency.acceptUsdCash}
                      onCheckedChange={(checked) => updateCurrencySettings({ acceptUsdCash: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Accept LBP Cash</Label>
                      <p className="text-sm text-slate-500">Allow customers to pay with Lebanese Pounds</p>
                    </div>
                    <Switch
                      checked={settings.currency.acceptLbpCash}
                      onCheckedChange={(checked) => updateCurrencySettings({ acceptLbpCash: checked })}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Exchange Rate Preview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600">USD → LBP</p>
                      <p className="font-mono">$1.00 = {settings.currency.exchangeRate.toLocaleString()} LBP</p>
                      <p className="font-mono">$10.00 = {(settings.currency.exchangeRate * 10).toLocaleString()} LBP</p>
                      <p className="font-mono">$100.00 = {(settings.currency.exchangeRate * 100).toLocaleString()} LBP</p>
                    </div>
                    <div>
                      <p className="text-blue-600">LBP → USD</p>
                      <p className="font-mono">1,000 LBP = ${((1000 / settings.currency.exchangeRate)).toFixed(2)}</p>
                      <p className="font-mono">10,000 LBP = ${((10000 / settings.currency.exchangeRate)).toFixed(2)}</p>
                      <p className="font-mono">100,000 LBP = ${((100000 / settings.currency.exchangeRate)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipt">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Receipt Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="receiptHeader">Receipt Header</Label>
                  <Textarea
                    id="receiptHeader"
                    value={settings.receipt.header}
                    onChange={(e) => updateReceiptSettings({ header: e.target.value })}
                    placeholder="Thank you for your purchase!"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptFooter">Receipt Footer</Label>
                  <Textarea
                    id="receiptFooter"
                    value={settings.receipt.footer}
                    onChange={(e) => updateReceiptSettings({ footer: e.target.value })}
                    placeholder="Visit us again soon!"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={settings.receipt.logo || ''}
                    onChange={(e) => updateReceiptSettings({ logo: e.target.value })}
                    placeholder="/images/logo.png"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Logo on Receipt</Label>
                    <p className="text-sm text-slate-500">Display your logo on printed receipts</p>
                  </div>
                  <Switch
                    checked={settings.receipt.showLogo}
                    onCheckedChange={(checked) => updateReceiptSettings({ showLogo: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Accept Cash</Label>
                    <p className="text-sm text-slate-500">Allow cash payments</p>
                  </div>
                  <Switch
                    checked={settings.payment.acceptCash}
                    onCheckedChange={(checked) => updatePaymentSettings({ acceptCash: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Accept Cards</Label>
                    <p className="text-sm text-slate-500">Credit and debit card payments</p>
                  </div>
                  <Switch
                    checked={settings.payment.acceptCard}
                    onCheckedChange={(checked) => updatePaymentSettings({ acceptCard: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Accept Digital Wallets</Label>
                    <p className="text-sm text-slate-500">Apple Pay, Google Pay, etc.</p>
                  </div>
                  <Switch
                    checked={settings.payment.acceptDigitalWallet}
                    onCheckedChange={(checked) => updatePaymentSettings({ acceptDigitalWallet: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Accept Gift Cards</Label>
                    <p className="text-sm text-slate-500">Store gift cards and vouchers</p>
                  </div>
                  <Switch
                    checked={settings.payment.acceptGiftCard}
                    onCheckedChange={(checked) => updatePaymentSettings({ acceptGiftCard: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-slate-500">Get notified when items are running low</p>
                  </div>
                  <Switch
                    checked={settings.inventory.enableLowStockAlerts}
                    onCheckedChange={(checked) => updateInventorySettings({ enableLowStockAlerts: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="1"
                    value={settings.inventory.lowStockThreshold}
                    onChange={(e) => updateInventorySettings({ lowStockThreshold: parseInt(e.target.value) || 10 })}
                  />
                  <p className="text-sm text-slate-500">Alert when stock falls below this number</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Barcode Scanning</Label>
                    <p className="text-sm text-slate-500">Enable barcode scanner integration</p>
                  </div>
                  <Switch
                    checked={settings.inventory.enableBarcodeScanning}
                    onCheckedChange={(checked) => updateInventorySettings({ enableBarcodeScanning: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme & Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme Mode</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={settings.theme.mode === 'light' ? 'default' : 'outline'}
                      onClick={() => updateThemeSettings({ mode: 'light' })}
                    >
                      Light
                    </Button>
                    <Button
                      variant={settings.theme.mode === 'dark' ? 'default' : 'outline'}
                      onClick={() => updateThemeSettings({ mode: 'dark' })}
                    >
                      Dark
                    </Button>
                    <Button
                      variant={settings.theme.mode === 'auto' ? 'default' : 'outline'}
                      onClick={() => updateThemeSettings({ mode: 'auto' })}
                    >
                      Auto
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="primaryColor"
                      value={settings.theme.primaryColor}
                      onChange={(e) => updateThemeSettings({ primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <Input
                      value={settings.theme.primaryColor}
                      onChange={(e) => updateThemeSettings({ primaryColor: e.target.value })}
                      placeholder="#8b5cf6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sound">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Sound Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Sound Effects</Label>
                    <p className="text-sm text-slate-500">Play sounds for button clicks and interactions</p>
                  </div>
                  <Switch
                    checked={settings.sound?.enabled ?? true}
                    onCheckedChange={(checked) => updateSoundSettings({ enabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soundVolume">Master Volume</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      id="soundVolume"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.sound?.volume ?? 0.7}
                      onChange={(e) => updateSoundSettings({ volume: parseFloat(e.target.value) })}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-sm text-slate-600 w-12 text-right">
                      {Math.round((settings.sound?.volume ?? 0.7) * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">Adjust the volume of all sound effects</p>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-slate-800">Sound Types</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Button Click Sounds</Label>
                      <p className="text-sm text-slate-500">Play sounds when clicking buttons</p>
                    </div>
                    <Switch
                      checked={settings.sound?.clickSound ?? true}
                      onCheckedChange={(checked) => updateSoundSettings({ clickSound: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Success Sounds</Label>
                      <p className="text-sm text-slate-500">Play sounds for successful actions like completing sales</p>
                    </div>
                    <Switch
                      checked={settings.sound?.successSound ?? true}
                      onCheckedChange={(checked) => updateSoundSettings({ successSound: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Error Sounds</Label>
                      <p className="text-sm text-slate-500">Play sounds for errors and invalid actions</p>
                    </div>
                    <Switch
                      checked={settings.sound?.errorSound ?? true}
                      onCheckedChange={(checked) => updateSoundSettings({ errorSound: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Special Action Sounds</Label>
                      <p className="text-sm text-slate-500">Play sounds for adding items to cart and special interactions</p>
                    </div>
                    <Switch
                      checked={settings.sound?.specialSound ?? true}
                      onCheckedChange={(checked) => updateSoundSettings({ specialSound: checked })}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-slate-800 mb-3">Test Sounds</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <SoundButton
                      variant="outline"
                      soundType="click"
                      onClick={() => playClick()}
                      className="gap-2"
                    >
                      🔊 Test Click
                    </SoundButton>
                    <SoundButton
                      variant="success"
                      onClick={() => playSuccess()}
                      className="gap-2"
                    >
                      ✅ Test Success
                    </SoundButton>
                    <SoundButton
                      variant="destructive"
                      onClick={() => playError()}
                      className="gap-2"
                    >
                      ❌ Test Error
                    </SoundButton>
                    <SoundButton
                      variant="secondary"
                      soundType="special"
                      onClick={() => playSpecial()}
                      className="gap-2"
                    >
                      ⭐ Test Special
                    </SoundButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Import/Export Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-100 mt-6">
          <CardHeader>
            <CardTitle>Import/Export Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="importSettings">Import Settings (JSON)</Label>
              <Textarea
                id="importSettings"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste your settings JSON here..."
                rows={4}
              />
              <Button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}