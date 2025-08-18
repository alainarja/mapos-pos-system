"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrencyStore } from "@/stores/currency"
import { useSettingsStore } from "@/stores/settings"
import { DollarSign, Banknote, Calculator, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

interface MultiCurrencyDrawerProps {
  onClose: () => void
}

interface USDDenominations {
  hundreds: number
  fifties: number
  twenties: number
  tens: number
  fives: number
  ones: number
  quarters: number
  dimes: number
  nickels: number
  pennies: number
}

interface LBPDenominations {
  hundred_thousand: number    // 100,000 LBP
  fifty_thousand: number      // 50,000 LBP
  twenty_thousand: number     // 20,000 LBP
  ten_thousand: number        // 10,000 LBP
  five_thousand: number       // 5,000 LBP
  one_thousand: number        // 1,000 LBP
  five_hundred: number        // 500 LBP
  two_fifty: number           // 250 LBP
  one_hundred: number         // 100 LBP
  fifty: number              // 50 LBP
}

export function MultiCurrencyDrawer({ onClose }: MultiCurrencyDrawerProps) {
  const { cashDrawer, setCashDrawerAmount, getCashDrawerTotal } = useCurrencyStore()
  const { settings } = useSettingsStore()
  
  const [usdCounts, setUsdCounts] = useState<USDDenominations>({
    hundreds: 0,
    fifties: 0,
    twenties: 0,
    tens: 0,
    fives: 0,
    ones: 0,
    quarters: 0,
    dimes: 0,
    nickels: 0,
    pennies: 0
  })
  
  const [lbpCounts, setLbpCounts] = useState<LBPDenominations>({
    hundred_thousand: 0,
    fifty_thousand: 0,
    twenty_thousand: 0,
    ten_thousand: 0,
    five_thousand: 0,
    one_thousand: 0,
    five_hundred: 0,
    two_fifty: 0,
    one_hundred: 0,
    fifty: 0
  })
  
  // USD denomination values
  const usdValues = {
    hundreds: 100,
    fifties: 50,
    twenties: 20,
    tens: 10,
    fives: 5,
    ones: 1,
    quarters: 0.25,
    dimes: 0.10,
    nickels: 0.05,
    pennies: 0.01
  }
  
  // LBP denomination values
  const lbpValues = {
    hundred_thousand: 100000,
    fifty_thousand: 50000,
    twenty_thousand: 20000,
    ten_thousand: 10000,
    five_thousand: 5000,
    one_thousand: 1000,
    five_hundred: 500,
    two_fifty: 250,
    one_hundred: 100,
    fifty: 50
  }
  
  // Calculate totals
  const calculateUsdTotal = () => {
    return Object.entries(usdCounts).reduce((total, [denom, count]) => {
      return total + (count * usdValues[denom as keyof USDDenominations])
    }, 0)
  }
  
  const calculateLbpTotal = () => {
    return Object.entries(lbpCounts).reduce((total, [denom, count]) => {
      return total + (count * lbpValues[denom as keyof LBPDenominations])
    }, 0)
  }
  
  const usdTotal = calculateUsdTotal()
  const lbpTotal = calculateLbpTotal()
  
  // Get current drawer totals
  const currentDrawerTotals = getCashDrawerTotal()
  
  const handleUpdateDrawer = () => {
    setCashDrawerAmount('usd', usdTotal)
    setCashDrawerAmount('lbp', lbpTotal)
    onClose()
  }
  
  const handleUsdCountChange = (denom: keyof USDDenominations, value: string) => {
    const numValue = parseInt(value) || 0
    setUsdCounts(prev => ({ ...prev, [denom]: numValue }))
  }
  
  const handleLbpCountChange = (denom: keyof LBPDenominations, value: string) => {
    const numValue = parseInt(value) || 0
    setLbpCounts(prev => ({ ...prev, [denom]: numValue }))
  }
  
  const variance = {
    usd: usdTotal - currentDrawerTotals.usd,
    lbp: lbpTotal - currentDrawerTotals.lbp
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Multi-Currency Cash Drawer Count
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="usd" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usd" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                US Dollars
              </TabsTrigger>
              <TabsTrigger value="lbp" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Lebanese Pounds
              </TabsTrigger>
            </TabsList>
            
            {/* USD Tab */}
            <TabsContent value="usd" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Bills */}
                <div className="space-y-2">
                  <Label className="font-semibold">$100 Bills</Label>
                  <Input
                    type="number"
                    min="0"
                    value={usdCounts.hundreds || ''}
                    onChange={(e) => handleUsdCountChange('hundreds', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">${(usdCounts.hundreds * 100).toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">$50 Bills</Label>
                  <Input
                    type="number"
                    min="0"
                    value={usdCounts.fifties || ''}
                    onChange={(e) => handleUsdCountChange('fifties', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">${(usdCounts.fifties * 50).toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">$20 Bills</Label>
                  <Input
                    type="number"
                    min="0"
                    value={usdCounts.twenties || ''}
                    onChange={(e) => handleUsdCountChange('twenties', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">${(usdCounts.twenties * 20).toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">$10 Bills</Label>
                  <Input
                    type="number"
                    min="0"
                    value={usdCounts.tens || ''}
                    onChange={(e) => handleUsdCountChange('tens', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">${(usdCounts.tens * 10).toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">$5 Bills</Label>
                  <Input
                    type="number"
                    min="0"
                    value={usdCounts.fives || ''}
                    onChange={(e) => handleUsdCountChange('fives', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">${(usdCounts.fives * 5).toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">$1 Bills</Label>
                  <Input
                    type="number"
                    min="0"
                    value={usdCounts.ones || ''}
                    onChange={(e) => handleUsdCountChange('ones', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">${(usdCounts.ones * 1).toFixed(2)}</p>
                </div>
                
                {/* Coins */}
                <div className="space-y-2">
                  <Label className="font-semibold">Quarters</Label>
                  <Input
                    type="number"
                    min="0"
                    value={usdCounts.quarters || ''}
                    onChange={(e) => handleUsdCountChange('quarters', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">${(usdCounts.quarters * 0.25).toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">Dimes</Label>
                  <Input
                    type="number"
                    min="0"
                    value={usdCounts.dimes || ''}
                    onChange={(e) => handleUsdCountChange('dimes', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">${(usdCounts.dimes * 0.10).toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">Nickels</Label>
                  <Input
                    type="number"
                    min="0"
                    value={usdCounts.nickels || ''}
                    onChange={(e) => handleUsdCountChange('nickels', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">${(usdCounts.nickels * 0.05).toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">Pennies</Label>
                  <Input
                    type="number"
                    min="0"
                    value={usdCounts.pennies || ''}
                    onChange={(e) => handleUsdCountChange('pennies', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">${(usdCounts.pennies * 0.01).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">USD Total Counted:</span>
                  <span className="text-xl font-bold text-blue-600">${usdTotal.toFixed(2)}</span>
                </div>
              </div>
            </TabsContent>
            
            {/* LBP Tab */}
            <TabsContent value="lbp" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">100,000 LBP</Label>
                  <Input
                    type="number"
                    min="0"
                    value={lbpCounts.hundred_thousand || ''}
                    onChange={(e) => handleLbpCountChange('hundred_thousand', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">{(lbpCounts.hundred_thousand * 100000).toLocaleString()} LBP</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">50,000 LBP</Label>
                  <Input
                    type="number"
                    min="0"
                    value={lbpCounts.fifty_thousand || ''}
                    onChange={(e) => handleLbpCountChange('fifty_thousand', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">{(lbpCounts.fifty_thousand * 50000).toLocaleString()} LBP</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">20,000 LBP</Label>
                  <Input
                    type="number"
                    min="0"
                    value={lbpCounts.twenty_thousand || ''}
                    onChange={(e) => handleLbpCountChange('twenty_thousand', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">{(lbpCounts.twenty_thousand * 20000).toLocaleString()} LBP</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">10,000 LBP</Label>
                  <Input
                    type="number"
                    min="0"
                    value={lbpCounts.ten_thousand || ''}
                    onChange={(e) => handleLbpCountChange('ten_thousand', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">{(lbpCounts.ten_thousand * 10000).toLocaleString()} LBP</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">5,000 LBP</Label>
                  <Input
                    type="number"
                    min="0"
                    value={lbpCounts.five_thousand || ''}
                    onChange={(e) => handleLbpCountChange('five_thousand', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">{(lbpCounts.five_thousand * 5000).toLocaleString()} LBP</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-semibold">1,000 LBP</Label>
                  <Input
                    type="number"
                    min="0"
                    value={lbpCounts.one_thousand || ''}
                    onChange={(e) => handleLbpCountChange('one_thousand', e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-center">{(lbpCounts.one_thousand * 1000).toLocaleString()} LBP</p>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">LBP Total Counted:</span>
                  <span className="text-xl font-bold text-orange-600">{lbpTotal.toLocaleString()} LBP</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-6" />
          
          {/* Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold">Cash Drawer Summary</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Current USD</div>
                  <div className="text-lg font-bold">${currentDrawerTotals.usd.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Counted USD</div>
                  <div className="text-lg font-bold text-blue-600">${usdTotal.toFixed(2)}</div>
                  <div className={`text-sm flex items-center gap-1 ${variance.usd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {variance.usd >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    Variance: ${Math.abs(variance.usd).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Current LBP</div>
                  <div className="text-lg font-bold">{currentDrawerTotals.lbp.toLocaleString()} LBP</div>
                  <div className="text-sm text-gray-600">Counted LBP</div>
                  <div className="text-lg font-bold text-orange-600">{lbpTotal.toLocaleString()} LBP</div>
                  <div className={`text-sm flex items-center gap-1 ${variance.lbp >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {variance.lbp >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    Variance: {Math.abs(variance.lbp).toLocaleString()} LBP
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {(Math.abs(variance.usd) > 1 || Math.abs(variance.lbp) > 1000) && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  Significant variance detected. Please double-check your counts before updating the drawer.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpdateDrawer} className="flex-1">
              Update Cash Drawer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}