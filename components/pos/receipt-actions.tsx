"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useSound } from "@/hooks/use-sound"
import {
  Mail,
  MessageSquare,
  Send,
  Download,
  Copy,
  CheckCircle,
  Phone,
  AtSign,
  Printer,
} from "lucide-react"

interface Receipt {
  id: string
  date: string
  time: string
  cashier: string
  customer?: {
    name: string
    email: string
    phone?: string
  }
  total: number
}

interface EmailReceiptDialogProps {
  receipt: Receipt
  onSend: (email: string, message?: string) => Promise<void>
}

function EmailReceiptDialog({ receipt, onSend }: EmailReceiptDialogProps) {
  const [email, setEmail] = useState(receipt.customer?.email || "")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const { playSuccess } = useSound()

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      await onSend(email, message)
      await playSuccess()
      toast({
        title: "Email Sent!",
        description: `Receipt sent successfully to ${email}`,
      })
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send email receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
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
      <DialogContent className="bg-slate-800 border-purple-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-purple-300 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Receipt
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-300">
              Email Address
            </Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="pl-10 bg-slate-700 border-purple-500/30 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-purple-300">
              Additional Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="bg-slate-700 border-purple-500/30 text-white resize-none"
              rows={3}
            />
          </div>

          <div className="bg-slate-700/30 p-3 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-300">
              Receipt #{receipt.id} • ${receipt.total.toFixed(2)} • {receipt.date} {receipt.time}
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !email}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SMSReceiptDialogProps {
  receipt: Receipt
  onSend: (phone: string, message?: string) => Promise<void>
}

function SMSReceiptDialog({ receipt, onSend }: SMSReceiptDialogProps) {
  const [phone, setPhone] = useState(receipt.customer?.phone || "")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const { playSuccess } = useSound()

  const handleSend = async () => {
    if (!phone || phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      await onSend(phone, message)
      await playSuccess()
      toast({
        title: "SMS Sent!",
        description: `Receipt sent successfully to ${phone}`,
      })
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send SMS receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    const match = numbers.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join("-")
    }
    return value
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
      <DialogContent className="bg-slate-800 border-purple-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-green-300 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            SMS Receipt
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-green-300">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-green-400" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="555-123-4567"
                className="pl-10 bg-slate-700 border-green-500/30 text-white"
                maxLength={12}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sms-message" className="text-green-300">
              Additional Message (Optional)
            </Label>
            <Textarea
              id="sms-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="bg-slate-700 border-green-500/30 text-white resize-none"
              rows={2}
              maxLength={160}
            />
            <p className="text-xs text-green-400">{160 - message.length} characters remaining</p>
          </div>

          <div className="bg-slate-700/30 p-3 rounded-lg border border-green-500/20">
            <p className="text-sm text-green-300">
              Receipt #{receipt.id} • ${receipt.total.toFixed(2)} • {receipt.date} {receipt.time}
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !phone}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send SMS
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ReceiptActionsProps {
  receipt: Receipt
  onEmailSend: (email: string, message?: string) => Promise<void>
  onSMSSend: (phone: string, message?: string) => Promise<void>
  onPrint: () => void
  onDownload?: () => void
  autoPrintStatus?: 'pending' | 'completed' | 'error'
}

export function ReceiptActions({
  receipt,
  onEmailSend,
  onSMSSend,
  onPrint,
  onDownload,
  autoPrintStatus = 'pending',
}: ReceiptActionsProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { playSuccess } = useSound()

  const handleCopyReceipt = async () => {
    try {
      const receiptText = `
MAPOS Store Receipt
Receipt #: ${receipt.id}
Date: ${receipt.date} ${receipt.time}
Cashier: ${receipt.cashier}
${receipt.customer ? `Customer: ${receipt.customer.name}` : ''}
Total: $${receipt.total.toFixed(2)}

Thank you for shopping with MAPOS!
      `.trim()
      
      await navigator.clipboard.writeText(receiptText)
      setCopied(true)
      await playSuccess()
      toast({
        title: "Copied!",
        description: "Receipt details copied to clipboard",
      })
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy receipt to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          onClick={onPrint}
          className={`w-full h-16 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl relative ${
            autoPrintStatus === 'completed'
              ? 'bg-green-600 hover:bg-green-700'
              : autoPrintStatus === 'error'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Printer className="w-6 h-6 mr-3" />
          {autoPrintStatus === 'completed' ? 'Print Another Copy' : 'Print Receipt'}
          {autoPrintStatus === 'completed' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-2 h-2 text-green-600" />
            </div>
          )}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <EmailReceiptDialog receipt={receipt} onSend={onEmailSend} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SMSReceiptDialog receipt={receipt} onSend={onSMSSend} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={handleCopyReceipt}
          variant="outline"
          className="w-full h-16 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 bg-transparent font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl"
        >
          {copied ? (
            <>
              <CheckCircle className="w-6 h-6 mr-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-6 h-6 mr-3" />
              Copy Receipt
            </>
          )}
        </Button>
      </motion.div>

      {onDownload && (
        <motion.div
          className="md:col-span-2 lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onDownload}
            variant="outline"
            className="w-full h-16 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 bg-transparent font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl"
          >
            <Download className="w-6 h-6 mr-3" />
            Download PDF
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}