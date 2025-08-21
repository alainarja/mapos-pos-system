"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useSound } from "@/hooks/use-sound"
import { ReceiptData } from "./receipt-preview"
import {
  MessageSquare,
  Send,
  Phone,
  User,
  Calendar,
  Clock,
  Receipt,
  Smartphone,
  Globe,
  Settings,
  Copy,
  Link,
  QrCode,
  ExternalLink,
  Check,
  AlertTriangle,
  Info
} from "lucide-react"

interface SMSReceiptSystemProps {
  receipt: ReceiptData
  customerPhone?: string
  storeName?: string
  storePhone?: string
  storeWebsite?: string
}

interface SMSTemplate {
  id: string
  name: string
  description: string
  template: string
  characterCount: number
  includeLink: boolean
}

const smsTemplates: SMSTemplate[] = [
  {
    id: 'compact',
    name: 'Compact Receipt',
    description: 'Essential transaction details in minimal text',
    template: 'Thanks for shopping at {STORE_NAME}! Receipt #{RECEIPT_ID}, Total: ${TOTAL}. Date: {DATE}. Return policy: 30 days with receipt.',
    characterCount: 0,
    includeLink: false
  },
  {
    id: 'standard',
    name: 'Standard Receipt',
    description: 'Standard format with key transaction information',
    template: '{STORE_NAME} Receipt\nReceipt: #{RECEIPT_ID}\nDate: {DATE} {TIME}\nItems: {ITEM_COUNT}\nTotal: ${TOTAL}\nPayment: {PAYMENT_METHOD}\nThank you!',
    characterCount: 0,
    includeLink: false
  },
  {
    id: 'detailed',
    name: 'Detailed Receipt',
    description: 'Comprehensive receipt with item breakdown',
    template: '{STORE_NAME} Receipt #{RECEIPT_ID}\n{DATE} at {TIME}\n\n{ITEMS}\n\nSubtotal: ${SUBTOTAL}\nTax: ${TAX}\nTotal: ${TOTAL}\nPaid: {PAYMENT_METHOD}\n\nThanks for your business!',
    characterCount: 0,
    includeLink: false
  },
  {
    id: 'link',
    name: 'Receipt Link',
    description: 'Short message with link to digital receipt',
    template: 'Thanks for shopping at {STORE_NAME}! Your receipt #{RECEIPT_ID} for ${TOTAL} is ready. View: {RECEIPT_LINK}',
    characterCount: 0,
    includeLink: true
  }
]

const generateSMSContent = (
  receipt: ReceiptData,
  template: SMSTemplate,
  storeName: string,
  customMessage?: string
): { content: string, characterCount: number } => {
  const formatDateTime = (date: Date) => ({
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString()
  })

  const { date, time } = formatDateTime(receipt.timestamp)
  const itemCount = receipt.items.reduce((sum, item) => sum + item.quantity, 0)
  
  // Generate items list for detailed template
  const itemsList = receipt.items.map(item => 
    `${item.name} x${item.quantity} $${item.total.toFixed(2)}`
  ).join('\n')

  // Generate receipt link (in real implementation, this would be a real URL)
  const receiptLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/receipt/${receipt.receiptNumber || receipt.id}`

  let content = template.template
    .replace(/{STORE_NAME}/g, storeName)
    .replace(/{RECEIPT_ID}/g, receipt.id)
    .replace(/{DATE}/g, date)
    .replace(/{TIME}/g, time)
    .replace(/{TOTAL}/g, receipt.total.toFixed(2))
    .replace(/{SUBTOTAL}/g, receipt.subtotal.toFixed(2))
    .replace(/{TAX}/g, receipt.tax.toFixed(2))
    .replace(/{PAYMENT_METHOD}/g, receipt.paymentMethod)
    .replace(/{ITEM_COUNT}/g, itemCount.toString())
    .replace(/{ITEMS}/g, itemsList)
    .replace(/{RECEIPT_LINK}/g, receiptLink)

  if (customMessage) {
    content = `${customMessage}\n\n${content}`
  }

  return {
    content,
    characterCount: content.length
  }
}

const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
}

const validatePhoneNumber = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, "")
  return digits.length === 10 || digits.length === 11
}

export function SMSReceiptSystem({
  receipt,
  customerPhone = '',
  storeName = 'MAPOS Store',
  storePhone = '(555) 123-4567',
  storeWebsite = 'mapos.com'
}: SMSReceiptSystemProps) {
  const [phone, setPhone] = useState(customerPhone)
  const [customMessage, setCustomMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate>(smsTemplates[0])
  const [isSending, setIsSending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [sendingProgress, setSendingProgress] = useState(0)
  
  const [smsSettings, setSmsSettings] = useState({
    includeStoreInfo: true,
    includeWebsite: false,
    requestReview: false,
    saveNumber: true,
    sendConfirmation: true
  })

  const { toast } = useToast()
  const { playSuccess, playError } = useSound()

  const smsContent = generateSMSContent(receipt, selectedTemplate, storeName, customMessage)
  const isPhoneValid = validatePhoneNumber(phone)
  const isContentTooLong = smsContent.characterCount > 160

  const handleSendSMS = async () => {
    if (!isPhoneValid) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      })
      return
    }

    if (isContentTooLong) {
      toast({
        title: "Message Too Long",
        description: "SMS content exceeds 160 characters. Please choose a shorter template or reduce the custom message.",
        variant: "destructive"
      })
      return
    }

    setIsSending(true)
    setSendingProgress(0)

    try {
      // Simulate sending progress
      const progressInterval = setInterval(() => {
        setSendingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // In a real implementation, this would call an SMS API (Twilio, AWS SNS, etc.)
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      clearInterval(progressInterval)
      setSendingProgress(100)

      // Log the SMS content for debugging
      console.log('SMS Content:', smsContent.content)
      console.log('Sending to:', phone)
      console.log('Template:', selectedTemplate.name)
      console.log('Settings:', smsSettings)

      await playSuccess()
      toast({
        title: "SMS Sent Successfully!",
        description: `Receipt sent to ${phone} using ${selectedTemplate.name} template`,
        duration: 5000
      })

      setIsOpen(false)
    } catch (error) {
      await playError()
      toast({
        title: "Failed to Send SMS",
        description: "Please check the phone number and try again",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
      setSendingProgress(0)
    }
  }

  const handleCopySMS = async () => {
    try {
      await navigator.clipboard.writeText(smsContent.content)
      toast({
        title: "SMS Content Copied",
        description: "SMS content has been copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy SMS content to clipboard",
        variant: "destructive"
      })
    }
  }

  const generateReceiptQR = () => {
    // In a real implementation, this would generate an actual QR code
    const receiptUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/receipt/${receipt.receiptNumber || receipt.id}`
    return receiptUrl
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-16 border-green-500/30 text-green-300 hover:bg-green-500/20 bg-transparent font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl"
        >
          <MessageSquare className="w-6 h-6 mr-3" />
          SMS Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-slate-800 border-purple-500/30 text-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-green-300 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            SMS Receipt System
          </DialogTitle>
        </DialogHeader>

        <div className="h-[650px] overflow-auto">
          <Tabs defaultValue="compose" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="compose" className="data-[state=active]:bg-green-600">
                <MessageSquare className="w-4 h-4 mr-2" />
                Compose
              </TabsTrigger>
              <TabsTrigger value="template" className="data-[state=active]:bg-green-600">
                <Smartphone className="w-4 h-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-green-600">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-green-600">
                <Phone className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-700/50 border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-300">Recipient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-green-300 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        placeholder="(555) 123-4567"
                        className={`bg-slate-700 border-green-500/30 text-white ${
                          phone && !isPhoneValid ? 'border-red-500' : ''
                        }`}
                        maxLength={14}
                      />
                      {phone && !isPhoneValid && (
                        <p className="text-red-400 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Please enter a valid phone number
                        </p>
                      )}
                    </div>

                    {receipt.customer && (
                      <div className="bg-slate-600/30 p-3 rounded-lg">
                        <div className="flex items-center text-sm text-green-300 mb-2">
                          <User className="w-4 h-4 mr-2" />
                          Customer Information
                        </div>
                        <p className="text-white font-semibold">{receipt.customer.name}</p>
                        {receipt.customer.loyaltyPoints && (
                          <p className="text-sm text-gray-300">{receipt.customer.loyaltyPoints} loyalty points</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-300">Receipt Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 flex items-center">
                          <Receipt className="w-4 h-4 mr-1" />
                          Receipt #
                        </div>
                        <p className="font-semibold text-white">{receipt.id}</p>
                      </div>
                      <div>
                        <div className="text-gray-400 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Date
                        </div>
                        <p className="font-semibold text-white">
                          {receipt.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <div className="text-gray-400 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Time
                        </div>
                        <p className="font-semibold text-white">
                          {receipt.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <div className="text-gray-400">Total</div>
                        <p className="font-bold text-lg text-green-400">
                          ${receipt.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-300 text-sm">Items Purchased</span>
                        <span className="text-white font-semibold">
                          {receipt.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-700/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-300">Custom Message (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personal message (will be added before receipt details)..."
                    className="bg-slate-700 border-green-500/30 text-white resize-none"
                    rows={3}
                    maxLength={50}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">
                      {customMessage.length}/50 characters
                    </p>
                    {customMessage.length > 40 && (
                      <p className="text-yellow-400 text-sm flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Keep it short for SMS
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {smsTemplates.map((template) => {
                  const templateContent = generateSMSContent(receipt, template, storeName, customMessage)
                  const isSelected = selectedTemplate.id === template.id
                  
                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'ring-2 ring-green-500 bg-green-900/20'
                          : 'bg-slate-700/50 hover:bg-slate-700/70'
                      } border-green-500/20`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">{template.name}</CardTitle>
                          {isSelected && (
                            <Badge className="bg-green-600 text-white">
                              <Check className="w-3 h-3 mr-1" />
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{template.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                          <p className="text-sm text-white font-mono whitespace-pre-wrap">
                            {templateContent.content.substring(0, 100)}
                            {templateContent.content.length > 100 && '...'}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Badge 
                            variant={templateContent.characterCount <= 160 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {templateContent.characterCount} chars
                          </Badge>
                          
                          {template.includeLink && (
                            <Badge variant="outline" className="text-xs">
                              <Link className="w-3 h-3 mr-1" />
                              Includes Link
                            </Badge>
                          )}
                        </div>
                        
                        {templateContent.characterCount > 160 && (
                          <p className="text-red-400 text-xs flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            May be sent as multiple messages
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Card className="bg-slate-700/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-300">SMS Limitations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Character Limit</p>
                        <p className="text-gray-400">SMS messages are limited to 160 characters</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Multiple Parts</p>
                        <p className="text-gray-400">Longer messages are split into multiple SMS</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Plain Text</p>
                        <p className="text-gray-400">SMS supports text only, no formatting</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-slate-700/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-300">SMS Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeStoreInfo" className="text-white">
                          Include Store Information
                        </Label>
                        <Checkbox
                          id="includeStoreInfo"
                          checked={smsSettings.includeStoreInfo}
                          onCheckedChange={(checked) =>
                            setSmsSettings(prev => ({ ...prev, includeStoreInfo: !!checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeWebsite" className="text-white">
                          Include Website Link
                        </Label>
                        <Checkbox
                          id="includeWebsite"
                          checked={smsSettings.includeWebsite}
                          onCheckedChange={(checked) =>
                            setSmsSettings(prev => ({ ...prev, includeWebsite: !!checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="requestReview" className="text-white">
                          Request Customer Review
                        </Label>
                        <Checkbox
                          id="requestReview"
                          checked={smsSettings.requestReview}
                          onCheckedChange={(checked) =>
                            setSmsSettings(prev => ({ ...prev, requestReview: !!checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="saveNumber" className="text-white">
                          Save Phone Number
                        </Label>
                        <Checkbox
                          id="saveNumber"
                          checked={smsSettings.saveNumber}
                          onCheckedChange={(checked) =>
                            setSmsSettings(prev => ({ ...prev, saveNumber: !!checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="sendConfirmation" className="text-white">
                          Send Confirmation SMS
                        </Label>
                        <Checkbox
                          id="sendConfirmation"
                          checked={smsSettings.sendConfirmation}
                          onCheckedChange={(checked) =>
                            setSmsSettings(prev => ({ ...prev, sendConfirmation: !!checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-300">Digital Receipt Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-600/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code Receipt
                      </h4>
                      <p className="text-sm text-gray-300 mb-3">
                        Generate a QR code that links to the digital receipt
                      </p>
                      <Button
                        onClick={() => {
                          const qrUrl = generateReceiptQR()
                          window.open(qrUrl, '_blank')
                        }}
                        variant="outline"
                        size="sm"
                        className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Generate QR Code
                      </Button>
                    </div>

                    <div className="bg-slate-600/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Web Receipt
                      </h4>
                      <p className="text-sm text-gray-300 mb-3">
                        Create a web link to view the full receipt online
                      </p>
                      <Button
                        onClick={() => {
                          const webUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/receipt/${receipt.receiptNumber || receipt.id}`
                          navigator.clipboard.writeText(webUrl)
                          toast({
                            title: "Link Copied",
                            description: "Receipt web link copied to clipboard"
                          })
                        }}
                        variant="outline"
                        size="sm"
                        className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Web Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card className="bg-slate-700/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-300 flex items-center justify-between">
                    <span>SMS Preview</span>
                    <Badge 
                      variant={smsContent.characterCount <= 160 ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {smsContent.characterCount}/160 characters
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Phone Preview */}
                  <div className="max-w-sm mx-auto">
                    <div className="bg-gray-900 rounded-3xl p-4 shadow-2xl">
                      <div className="bg-gray-800 rounded-2xl overflow-hidden">
                        {/* Phone Header */}
                        <div className="bg-gray-700 p-3 flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Messages</span>
                          <span className="text-gray-300 text-sm">
                            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        
                        {/* Message Bubble */}
                        <div className="p-4 space-y-3">
                          <div className="flex justify-start">
                            <div className="bg-gray-600 text-white p-3 rounded-2xl rounded-bl-md max-w-xs">
                              <div className="text-xs text-gray-300 mb-1">{storeName}</div>
                              <div className="font-mono text-sm whitespace-pre-wrap">
                                {smsContent.content}
                              </div>
                              <div className="text-xs text-gray-400 mt-2">
                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Character Analysis */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Character Count:</span>
                      <span className={`font-semibold ${
                        smsContent.characterCount <= 160 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {smsContent.characterCount} / 160
                      </span>
                    </div>
                    
                    <Progress 
                      value={Math.min(100, (smsContent.characterCount / 160) * 100)}
                      className="w-full"
                    />

                    {isContentTooLong && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-400 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          This message exceeds 160 characters and will be sent as multiple SMS messages, 
                          which may increase costs and reduce readability.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleCopySMS}
                      variant="outline"
                      className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy SMS Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Separator className="bg-green-500/20" />

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Template: <span className="text-white font-semibold">{selectedTemplate.name}</span>
            {isContentTooLong && (
              <span className="text-red-400 ml-2">• Message too long</span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendSMS}
              disabled={isSending || !isPhoneValid || isContentTooLong}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                  <span className="text-xs">({sendingProgress}%)</span>
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send SMS Receipt
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar for Sending */}
        {isSending && (
          <div className="mt-2">
            <Progress value={sendingProgress} className="w-full" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}