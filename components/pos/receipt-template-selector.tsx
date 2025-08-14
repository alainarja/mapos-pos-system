"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ReceiptTemplates, ReceiptTemplateName } from "./receipt-templates"
import { ReceiptData } from "./receipt-preview"
import { PrintOptions } from "@/stores/print"
import { 
  Eye, 
  Settings, 
  Palette, 
  Layout,
  FileText,
  Smartphone,
  Monitor,
  Printer,
  Star
} from "lucide-react"

interface ReceiptTemplateSelectorProps {
  receipt: ReceiptData
  options: PrintOptions
  selectedTemplate: ReceiptTemplateName
  onTemplateSelect: (template: ReceiptTemplateName) => void
  storeName?: string
  storeAddress?: string
  storePhone?: string
  storeEmail?: string
}

interface TemplateInfo {
  name: string
  description: string
  icon: React.ComponentType<any>
  features: string[]
  bestFor: string[]
  paperSize: string[]
}

const templateInfo: Record<ReceiptTemplateName, TemplateInfo> = {
  classic: {
    name: "Classic",
    description: "Traditional receipt layout with clean formatting",
    icon: FileText,
    features: ["Standard layout", "Monospace font", "Basic branding", "Compact design"],
    bestFor: ["Thermal printers", "General retail", "Quick service"],
    paperSize: ["Thermal (80mm)", "A4", "Letter"]
  },
  modern: {
    name: "Modern",
    description: "Contemporary design with gradient accents and icons",
    icon: Monitor,
    features: ["Gradient design", "Icon integration", "Enhanced typography", "Professional look"],
    bestFor: ["Digital receipts", "Premium brands", "Customer experience"],
    paperSize: ["A4", "Letter", "Thermal (80mm)"]
  },
  compact: {
    name: "Compact",
    description: "Minimalist format optimized for thermal printers",
    icon: Smartphone,
    features: ["Ultra-compact", "Minimal spacing", "Essential info only", "Fast printing"],
    bestFor: ["Thermal printers", "High-volume", "Mobile POS"],
    paperSize: ["Thermal (58mm)", "Thermal (80mm)"]
  },
  detailed: {
    name: "Detailed",
    description: "Comprehensive format with complete transaction breakdown",
    icon: Layout,
    features: ["Complete details", "Item breakdown", "Professional layout", "Customer copy"],
    bestFor: ["Business receipts", "B2B transactions", "Detailed records"],
    paperSize: ["A4", "Letter"]
  }
}

export function ReceiptTemplateSelector({
  receipt,
  options,
  selectedTemplate,
  onTemplateSelect,
  storeName,
  storeAddress,
  storePhone,
  storeEmail
}: ReceiptTemplateSelectorProps) {
  const [previewTemplate, setPreviewTemplate] = useState<ReceiptTemplateName>(selectedTemplate)

  const handleTemplateSelect = (template: ReceiptTemplateName) => {
    setPreviewTemplate(template)
    onTemplateSelect(template)
  }

  const SelectedTemplate = ReceiptTemplates[previewTemplate]

  return (
    <div className="space-y-6">
      {/* Template Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(templateInfo) as [ReceiptTemplateName, TemplateInfo][]).map(([key, info]) => {
          const Icon = info.icon
          const isSelected = selectedTemplate === key

          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleTemplateSelect(key)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                  {isSelected && (
                    <Badge className="bg-purple-600 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{info.name}</CardTitle>
                <p className="text-sm text-gray-600">{info.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
                  <div className="space-y-1">
                    {info.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center">
                        <div className="w-1 h-1 bg-purple-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Best For</h4>
                  <div className="flex flex-wrap gap-1">
                    {info.bestFor.slice(0, 2).map((use, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Paper Sizes</h4>
                  <div className="flex flex-wrap gap-1">
                    {info.paperSize.map((size, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Template Preview */}
      <Card className="bg-slate-800/50 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-300 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Template Preview - {templateInfo[previewTemplate].name}
            </CardTitle>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                  <Eye className="w-4 h-4 mr-2" />
                  Full Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-slate-800 border-purple-500/30 text-white">
                <DialogHeader>
                  <DialogTitle className="text-purple-300">
                    {templateInfo[previewTemplate].name} Template - Full Preview
                  </DialogTitle>
                </DialogHeader>
                <div className="p-6 bg-gray-100 rounded-lg">
                  <SelectedTemplate
                    receipt={receipt}
                    options={options}
                    storeName={storeName}
                    storeAddress={storeAddress}
                    storePhone={storePhone}
                    storeEmail={storeEmail}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabs for different preview modes */}
          <Tabs defaultValue="preview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="preview" className="data-[state=active]:bg-purple-600">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-purple-600">
                <Settings className="w-4 h-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger value="specs" className="data-[state=active]:bg-purple-600">
                <Printer className="w-4 h-4 mr-2" />
                Specifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview">
              <div className="bg-gray-100 rounded-lg p-6 flex justify-center">
                <div className="transform scale-75 origin-top">
                  <SelectedTemplate
                    receipt={receipt}
                    options={options}
                    storeName={storeName}
                    storeAddress={storeAddress}
                    storePhone={storePhone}
                    storeEmail={storeEmail}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                <Card className="bg-slate-700/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Design Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {templateInfo[previewTemplate].features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Best Use Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {templateInfo[previewTemplate].bestFor.map((use, index) => (
                        <Badge key={index} variant="outline" className="mr-2 mb-2 border-purple-500/30 text-purple-300">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="specs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                <Card className="bg-slate-700/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300 text-sm">Paper Sizes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {templateInfo[previewTemplate].paperSize.map((size, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{size}</span>
                          <Badge variant="secondary" className="text-xs">Supported</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300 text-sm">Print Quality</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Thermal:</span>
                      <span className="text-green-400">Excellent</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Inkjet:</span>
                      <span className="text-green-400">Very Good</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Laser:</span>
                      <span className="text-green-400">Excellent</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300 text-sm">Customization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Logo:</span>
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Colors:</span>
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Layout:</span>
                      <span className="text-green-400">✓</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Template Comparison */}
      <Card className="bg-slate-800/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300">Template Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left p-2 text-purple-300">Feature</th>
                  <th className="text-center p-2 text-purple-300">Classic</th>
                  <th className="text-center p-2 text-purple-300">Modern</th>
                  <th className="text-center p-2 text-purple-300">Compact</th>
                  <th className="text-center p-2 text-purple-300">Detailed</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-purple-500/20">
                  <td className="p-2 font-medium">Print Speed</td>
                  <td className="text-center p-2">Fast</td>
                  <td className="text-center p-2">Medium</td>
                  <td className="text-center p-2 text-green-400">Fastest</td>
                  <td className="text-center p-2">Slow</td>
                </tr>
                <tr className="border-b border-purple-500/20">
                  <td className="p-2 font-medium">Paper Usage</td>
                  <td className="text-center p-2">Medium</td>
                  <td className="text-center p-2">Medium</td>
                  <td className="text-center p-2 text-green-400">Low</td>
                  <td className="text-center p-2">High</td>
                </tr>
                <tr className="border-b border-purple-500/20">
                  <td className="p-2 font-medium">Detail Level</td>
                  <td className="text-center p-2">Medium</td>
                  <td className="text-center p-2">High</td>
                  <td className="text-center p-2">Low</td>
                  <td className="text-center p-2 text-green-400">Highest</td>
                </tr>
                <tr className="border-b border-purple-500/20">
                  <td className="p-2 font-medium">Professional Look</td>
                  <td className="text-center p-2">Good</td>
                  <td className="text-center p-2 text-green-400">Excellent</td>
                  <td className="text-center p-2">Basic</td>
                  <td className="text-center p-2 text-green-400">Excellent</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Mobile Friendly</td>
                  <td className="text-center p-2">Good</td>
                  <td className="text-center p-2">Good</td>
                  <td className="text-center p-2 text-green-400">Excellent</td>
                  <td className="text-center p-2">Fair</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}