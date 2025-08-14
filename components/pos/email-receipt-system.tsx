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
import { useToast } from "@/hooks/use-toast"
import { useSound } from "@/hooks/use-sound"
import { ReceiptData } from "./receipt-preview"
import {
  Mail,
  Send,
  Eye,
  Settings,
  Image,
  Palette,
  Type,
  Layout,
  Check,
  Copy,
  Download,
  AtSign,
  User,
  Calendar,
  Clock,
  Receipt,
  Sparkles,
  Globe,
  Smartphone
} from "lucide-react"

interface EmailReceiptSystemProps {
  receipt: ReceiptData
  customerEmail?: string
  storeName?: string
  storeAddress?: string
  storePhone?: string
  storeEmail?: string
  storeLogo?: string
}

interface EmailTemplate {
  id: string
  name: string
  description: string
  preview: string
  style: 'modern' | 'classic' | 'minimal' | 'branded'
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'modern',
    name: 'Modern Business',
    description: 'Contemporary design with gradients and modern typography',
    preview: 'Clean, professional look with company branding',
    style: 'modern'
  },
  {
    id: 'classic',
    name: 'Classic Receipt',
    description: 'Traditional receipt format optimized for email',
    preview: 'Simple, clean layout focused on transaction details',
    style: 'classic'
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Minimalist design with essential information only',
    preview: 'Ultra-clean design with maximum readability',
    style: 'minimal'
  },
  {
    id: 'branded',
    name: 'Branded Experience',
    description: 'Rich branding with company colors and imagery',
    preview: 'Full brand experience with logos and brand colors',
    style: 'branded'
  }
]

const generateEmailHTML = (
  receipt: ReceiptData,
  template: EmailTemplate,
  storeName: string,
  storeAddress: string,
  storePhone: string,
  storeEmail: string,
  customMessage?: string
): string => {
  const formatDateTime = (date: Date) => ({
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString()
  })

  const { date, time } = formatDateTime(receipt.timestamp)
  const totalItems = receipt.items.reduce((sum, item) => sum + item.quantity, 0)

  const modernTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt from ${storeName}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                margin-top: 20px;
                margin-bottom: 20px;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .logo {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            .store-name {
                font-size: 28px;
                font-weight: bold;
                margin: 0;
            }
            .store-info {
                opacity: 0.9;
                margin-top: 10px;
            }
            .content {
                padding: 30px;
            }
            .receipt-header {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            .receipt-id {
                font-size: 24px;
                font-weight: bold;
                color: #334155;
                margin-bottom: 10px;
            }
            .receipt-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            .detail-item {
                text-align: center;
            }
            .detail-label {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                margin-bottom: 5px;
                font-weight: 600;
            }
            .detail-value {
                font-size: 16px;
                font-weight: 600;
                color: #334155;
            }
            .items-section {
                margin-bottom: 25px;
            }
            .section-title {
                font-size: 20px;
                font-weight: bold;
                color: #334155;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #e2e8f0;
            }
            .item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            .item:last-child {
                border-bottom: none;
            }
            .item-info {
                flex: 1;
            }
            .item-name {
                font-weight: 600;
                color: #334155;
                margin-bottom: 5px;
            }
            .item-details {
                font-size: 14px;
                color: #64748b;
            }
            .item-total {
                font-size: 18px;
                font-weight: bold;
                color: #334155;
            }
            .totals-section {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                color: #64748b;
            }
            .total-row.final {
                font-size: 24px;
                font-weight: bold;
                color: #334155;
                padding-top: 15px;
                border-top: 2px solid #e2e8f0;
                margin-top: 15px;
            }
            .custom-message {
                background: #fef3c7;
                border: 1px solid #fbbf24;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 25px;
                color: #92400e;
            }
            .footer {
                text-align: center;
                color: #64748b;
                font-size: 14px;
                padding: 20px;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
            }
            .powered-by {
                margin-top: 15px;
                font-size: 12px;
                opacity: 0.7;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🧾</div>
                <h1 class="store-name">${storeName}</h1>
                <div class="store-info">
                    ${storeAddress}<br>
                    ${storePhone} • ${storeEmail}
                </div>
            </div>
            
            <div class="content">
                <div class="receipt-header">
                    <div class="receipt-id">Receipt #${receipt.id}</div>
                    <div class="receipt-details">
                        <div class="detail-item">
                            <div class="detail-label">Date</div>
                            <div class="detail-value">${date}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Time</div>
                            <div class="detail-value">${time}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Items</div>
                            <div class="detail-value">${totalItems}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Cashier</div>
                            <div class="detail-value">${receipt.cashier}</div>
                        </div>
                    </div>
                </div>

                ${customMessage ? `
                    <div class="custom-message">
                        <strong>Personal Message:</strong><br>
                        ${customMessage}
                    </div>
                ` : ''}

                <div class="items-section">
                    <h2 class="section-title">Items Purchased</h2>
                    ${receipt.items.map(item => `
                        <div class="item">
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                                <div class="item-details">${item.quantity} × $${item.price.toFixed(2)}</div>
                            </div>
                            <div class="item-total">$${item.total.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="totals-section">
                    <div class="total-row">
                        <span>Subtotal (${totalItems} items)</span>
                        <span>$${receipt.subtotal.toFixed(2)}</span>
                    </div>
                    ${receipt.totalSavings && receipt.totalSavings > 0 ? `
                        <div class="total-row" style="color: #059669; font-weight: 600;">
                            <span>Total Savings</span>
                            <span>-$${receipt.totalSavings.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="total-row">
                        <span>Tax</span>
                        <span>$${receipt.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total</span>
                        <span>$${receipt.total.toFixed(2)}</span>
                    </div>
                    <div class="total-row" style="margin-top: 10px; font-weight: 600;">
                        <span>Payment Method</span>
                        <span>${receipt.paymentMethod}</span>
                    </div>
                </div>

                ${receipt.customer ? `
                    <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                        <strong style="color: #065f46;">Customer Information</strong><br>
                        <span style="color: #047857;">Name: ${receipt.customer.name}</span><br>
                        ${receipt.customer.loyaltyPoints ? `<span style="color: #047857;">Loyalty Points: ${receipt.customer.loyaltyPoints}</span>` : ''}
                    </div>
                ` : ''}
            </div>

            <div class="footer">
                <p><strong>Thank you for your business!</strong></p>
                <p>Please keep this receipt for your records</p>
                <p>Return policy: 30 days with receipt</p>
                <div class="powered-by">
                    Powered by MAPOS Point of Sale System
                </div>
            </div>
        </div>
    </body>
    </html>
  `

  const classicTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt from ${storeName}</title>
        <style>
            body {
                font-family: 'Courier New', monospace;
                line-height: 1.4;
                margin: 0;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .receipt {
                max-width: 400px;
                margin: 0 auto;
                background-color: white;
                border: 1px solid #ccc;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 15px;
                margin-bottom: 15px;
            }
            .store-name {
                font-size: 18px;
                font-weight: bold;
                margin: 0;
            }
            .store-info {
                font-size: 12px;
                margin-top: 5px;
            }
            .receipt-info {
                margin: 15px 0;
                font-size: 12px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
            }
            .items {
                margin: 15px 0;
                border-top: 1px solid #000;
                border-bottom: 1px solid #000;
                padding: 10px 0;
            }
            .item {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                font-size: 12px;
            }
            .item-details {
                margin-left: 10px;
                font-size: 11px;
                color: #666;
            }
            .totals {
                margin: 10px 0;
                font-size: 12px;
            }
            .total-final {
                font-weight: bold;
                font-size: 14px;
                border-top: 1px solid #000;
                padding-top: 5px;
                margin-top: 5px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 11px;
                border-top: 1px solid #000;
                padding-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="header">
                <h1 class="store-name">${storeName}</h1>
                <div class="store-info">
                    ${storeAddress}<br>
                    ${storePhone}<br>
                    ${storeEmail}
                </div>
            </div>

            <div class="receipt-info">
                <div class="info-row">
                    <span>Receipt #:</span>
                    <span>${receipt.id}</span>
                </div>
                <div class="info-row">
                    <span>Date:</span>
                    <span>${date}</span>
                </div>
                <div class="info-row">
                    <span>Time:</span>
                    <span>${time}</span>
                </div>
                <div class="info-row">
                    <span>Cashier:</span>
                    <span>${receipt.cashier}</span>
                </div>
            </div>

            ${customMessage ? `
                <div style="border: 1px solid #ccc; padding: 10px; margin: 15px 0; background: #f9f9f9;">
                    <strong>Message:</strong><br>
                    ${customMessage}
                </div>
            ` : ''}

            <div class="items">
                <div style="font-weight: bold; text-align: center; margin-bottom: 10px;">ITEMS PURCHASED</div>
                ${receipt.items.map(item => `
                    <div class="item">
                        <span>${item.name}</span>
                        <span>$${item.total.toFixed(2)}</span>
                    </div>
                    <div class="item-details">${item.quantity} @ $${item.price.toFixed(2)}</div>
                `).join('')}
            </div>

            <div class="totals">
                <div class="info-row">
                    <span>Subtotal:</span>
                    <span>$${receipt.subtotal.toFixed(2)}</span>
                </div>
                <div class="info-row">
                    <span>Tax:</span>
                    <span>$${receipt.tax.toFixed(2)}</span>
                </div>
                <div class="info-row total-final">
                    <span>TOTAL:</span>
                    <span>$${receipt.total.toFixed(2)}</span>
                </div>
                <div class="info-row">
                    <span>Payment:</span>
                    <span>${receipt.paymentMethod}</span>
                </div>
            </div>

            <div class="footer">
                <p>Thank you for your business!</p>
                <p>Please keep your receipt</p>
                <p>Return policy: 30 days with receipt</p>
                <br>
                <p style="font-size: 10px;">Powered by MAPOS</p>
            </div>
        </div>
    </body>
    </html>
  `

  switch (template.id) {
    case 'modern':
      return modernTemplate
    case 'classic':
      return classicTemplate
    case 'minimal':
    case 'branded':
    default:
      return modernTemplate // Use modern as default for now
  }
}

export function EmailReceiptSystem({
  receipt,
  customerEmail = '',
  storeName = 'MAPOS Store',
  storeAddress = '123 Commerce St, Business City, BC 12345',
  storePhone = '(555) 123-4567',
  storeEmail = 'contact@mapos.com',
  storeLogo
}: EmailReceiptSystemProps) {
  const [email, setEmail] = useState(customerEmail)
  const [customMessage, setCustomMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(emailTemplates[0])
  const [isSending, setIsSending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  
  const [emailSettings, setEmailSettings] = useState({
    includeReceipt: true,
    includeBranding: true,
    includePromotions: false,
    requestFeedback: true,
    sendCopy: false
  })

  const { toast } = useToast()
  const { playSuccess, playError } = useSound()

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return
    }

    setIsSending(true)
    try {
      // Generate the HTML email content
      const emailHTML = generateEmailHTML(
        receipt,
        selectedTemplate,
        storeName,
        storeAddress,
        storePhone,
        storeEmail,
        customMessage
      )

      // In a real implementation, this would call an email API
      // For demo purposes, we'll simulate sending
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Log the email content for debugging
      console.log('Email HTML:', emailHTML)
      console.log('Sending to:', email)
      console.log('Template:', selectedTemplate.name)
      console.log('Settings:', emailSettings)

      await playSuccess()
      toast({
        title: "Email Sent Successfully!",
        description: `Receipt sent to ${email} using ${selectedTemplate.name} template`,
        duration: 5000
      })

      setIsOpen(false)
    } catch (error) {
      await playError()
      toast({
        title: "Failed to Send Email",
        description: "Please try again or contact support if the problem persists",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  const handlePreview = () => {
    const emailHTML = generateEmailHTML(
      receipt,
      selectedTemplate,
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      customMessage
    )

    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(emailHTML)
      previewWindow.document.close()
      previewWindow.focus()
    }
  }

  const handleCopyHTML = async () => {
    const emailHTML = generateEmailHTML(
      receipt,
      selectedTemplate,
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      customMessage
    )

    try {
      await navigator.clipboard.writeText(emailHTML)
      toast({
        title: "HTML Copied",
        description: "Email HTML has been copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy HTML to clipboard",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-16 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 bg-transparent font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl"
        >
          <Mail className="w-6 h-6 mr-3" />
          Email Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-slate-800 border-purple-500/30 text-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-purple-300 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Receipt System
          </DialogTitle>
        </DialogHeader>

        <div className="h-[700px] overflow-auto">
          <Tabs defaultValue="compose" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="compose" className="data-[state=active]:bg-purple-600">
                <Mail className="w-4 h-4 mr-2" />
                Compose
              </TabsTrigger>
              <TabsTrigger value="template" className="data-[state=active]:bg-purple-600">
                <Layout className="w-4 h-4 mr-2" />
                Template
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-purple-600">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-700/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300">Recipient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-purple-300 flex items-center">
                        <AtSign className="w-4 h-4 mr-2" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@example.com"
                        className="bg-slate-700 border-purple-500/30 text-white"
                      />
                    </div>

                    {receipt.customer && (
                      <div className="bg-slate-600/30 p-3 rounded-lg">
                        <div className="flex items-center text-sm text-purple-300 mb-2">
                          <User className="w-4 h-4 mr-2" />
                          Customer Information
                        </div>
                        <p className="text-white font-semibold">{receipt.customer.name}</p>
                        {receipt.customer.email && (
                          <p className="text-sm text-gray-300">{receipt.customer.email}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300">Receipt Details</CardTitle>
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
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-700/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-300">Personal Message (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personal message to the email..."
                    className="bg-slate-700 border-purple-500/30 text-white resize-none min-h-[100px]"
                    rows={4}
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    {customMessage.length}/500 characters
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedTemplate.id === template.id
                        ? 'ring-2 ring-purple-500 bg-purple-900/20'
                        : 'bg-slate-700/50 hover:bg-slate-700/70'
                    } border-purple-500/20`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{template.name}</CardTitle>
                        {selectedTemplate.id === template.id && (
                          <Badge className="bg-purple-600 text-white">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{template.description}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300">{template.preview}</p>
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {template.style}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-slate-700/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-300">Template Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <p className="text-gray-300">
                      Currently selected: <span className="font-semibold text-white">{selectedTemplate.name}</span>
                    </p>
                    <Button
                      onClick={handlePreview}
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-slate-700/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-300">Email Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeReceipt" className="text-white">
                          Include Receipt Details
                        </Label>
                        <Checkbox
                          id="includeReceipt"
                          checked={emailSettings.includeReceipt}
                          onCheckedChange={(checked) =>
                            setEmailSettings(prev => ({ ...prev, includeReceipt: !!checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeBranding" className="text-white">
                          Include Store Branding
                        </Label>
                        <Checkbox
                          id="includeBranding"
                          checked={emailSettings.includeBranding}
                          onCheckedChange={(checked) =>
                            setEmailSettings(prev => ({ ...prev, includeBranding: !!checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="includePromotions" className="text-white">
                          Include Promotions
                        </Label>
                        <Checkbox
                          id="includePromotions"
                          checked={emailSettings.includePromotions}
                          onCheckedChange={(checked) =>
                            setEmailSettings(prev => ({ ...prev, includePromotions: !!checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requestFeedback" className="text-white">
                          Request Customer Feedback
                        </Label>
                        <Checkbox
                          id="requestFeedback"
                          checked={emailSettings.requestFeedback}
                          onCheckedChange={(checked) =>
                            setEmailSettings(prev => ({ ...prev, requestFeedback: !!checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="sendCopy" className="text-white">
                          Send Copy to Store Email
                        </Label>
                        <Checkbox
                          id="sendCopy"
                          checked={emailSettings.sendCopy}
                          onCheckedChange={(checked) =>
                            setEmailSettings(prev => ({ ...prev, sendCopy: !!checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-300">Advanced Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleCopyHTML}
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy HTML
                    </Button>

                    <Button
                      onClick={() => {
                        // Download email HTML as file
                        const emailHTML = generateEmailHTML(
                          receipt,
                          selectedTemplate,
                          storeName,
                          storeAddress,
                          storePhone,
                          storeEmail,
                          customMessage
                        )
                        
                        const blob = new Blob([emailHTML], { type: 'text/html' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `receipt-${receipt.id}-email.html`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download HTML
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card className="bg-slate-700/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-300">Email Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <p className="text-gray-300">
                      Preview the email that will be sent to <span className="font-semibold text-white">{email || 'the customer'}</span>
                    </p>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={handlePreview}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Open Email Preview
                      </Button>
                      
                      <p className="text-sm text-gray-400">
                        Preview will open in a new window
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Separator className="bg-purple-500/20" />

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Template: <span className="text-white font-semibold">{selectedTemplate.name}</span>
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
              onClick={handleSendEmail}
              disabled={isSending || !email}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email Receipt
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}