"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SoundButton } from "@/components/ui/sound-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Save,
  Package,
  User,
  Tag,
  FileText,
  Bookmark,
  Quote,
  ShoppingCart,
  X,
  Plus
} from "lucide-react"
import { useCartStore } from "@/stores/cart"
import { useSavedCartsStore } from "@/stores/saved-carts"
import { useUserStore } from "@/stores/user"
import { CartSaveOptions } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

interface SaveCartDialogProps {
  isOpen: boolean
  onClose: () => void
  onCartSaved?: (cartId: string) => void
  isDarkMode?: boolean
}

const CATEGORY_OPTIONS = [
  { value: 'saved', label: 'Saved Cart', icon: ShoppingCart, description: 'Regular saved cart' },
  { value: 'customer', label: 'Customer Cart', icon: User, description: 'Cart for specific customer' },
  { value: 'template', label: 'Template', icon: Package, description: 'Reusable cart template' },
  { value: 'quote', label: 'Quote', icon: Quote, description: 'Price quote for customer' }
]

const PREDEFINED_TAGS = [
  'bulk-order', 'frequent-customer', 'seasonal', 'promotional', 'wholesale',
  'urgent', 'recurring', 'special-pricing', 'corporate', 'loyalty-member'
]

export function SaveCartDialog({
  isOpen,
  onClose,
  onCartSaved,
  isDarkMode = false
}: SaveCartDialogProps) {
  const [label, setLabel] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<'customer' | 'template' | 'quote' | 'saved'>('saved')
  const [isTemplate, setIsTemplate] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const { saveCart, canSaveCart, items, total, selectedCustomer } = useCartStore()
  const { addSavedCart } = useSavedCartsStore()
  const { currentUser } = useUserStore()

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Pre-fill with customer name if available
      if (selectedCustomer) {
        setLabel(`${selectedCustomer.name}'s Cart`)
        setCategory('customer')
      } else {
        setLabel("")
        setCategory('saved')
      }
      setDescription("")
      setIsTemplate(false)
      setTags([])
      setNewTag("")
      setError("")
    }
  }, [isOpen, selectedCustomer])

  // Update isTemplate based on category
  useEffect(() => {
    setIsTemplate(category === 'template')
  }, [category])

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!currentUser || !canSaveCart()) {
      setError("Cannot save cart: No user or empty cart")
      return
    }

    if (!label.trim()) {
      setError("Please enter a label for the cart")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const saveOptions: CartSaveOptions = {
        label: label.trim(),
        description: description.trim() || undefined,
        isTemplate,
        tags: tags.length > 0 ? tags : undefined,
        category
      }

      const savedCart = saveCart(currentUser.id, currentUser.username, saveOptions)
      
      if (savedCart) {
        const success = await addSavedCart(savedCart)
        
        if (success) {
          onCartSaved?.(savedCart.id)
          onClose()
        } else {
          setError("Failed to save cart to storage")
        }
      } else {
        setError("Failed to save cart")
      }
    } catch (err) {
      setError("An error occurred while saving the cart")
      console.error("Save cart error:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedCategoryOption = CATEGORY_OPTIONS.find(opt => opt.value === category)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-w-2xl rounded-2xl shadow-2xl backdrop-blur-xl ${
          isDarkMode 
            ? 'bg-slate-900/95 border-slate-600 text-slate-100' 
            : 'bg-white/95 border-purple-200/50'
        }`}
      >
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold flex items-center gap-3 mb-2 ${
            isDarkMode 
              ? 'text-slate-100' 
              : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
          }`}>
            <Save className="h-6 w-6" />
            Save Cart
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cart Summary */}
          <div className={`p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-600/50' 
              : 'bg-gradient-to-r from-purple-50/80 to-violet-50/80 border-purple-200/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {items.length} items • Total: ${total.toFixed(2)}
                </p>
                {selectedCustomer && (
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Customer: {selectedCustomer.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="cart-label" className="text-sm font-medium">
              Cart Label *
            </Label>
            <Input
              id="cart-label"
              placeholder="Enter a name for this cart..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={`h-12 rounded-xl transition-all duration-300 shadow-sm ${
                isDarkMode
                  ? "bg-slate-800/80 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:bg-slate-800 focus:border-purple-400/60"
                  : "bg-white/80 border-purple-200/60 focus:border-purple-400 focus:bg-white"
              }`}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger className={`h-12 rounded-xl ${
                isDarkMode
                  ? "bg-slate-800/80 border-slate-600/50 text-slate-100"
                  : "bg-white/80 border-purple-200/60"
              }`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Template Checkbox */}
          {category !== 'template' && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is-template" 
                checked={isTemplate}
                onCheckedChange={setIsTemplate}
              />
              <Label 
                htmlFor="is-template" 
                className="text-sm font-medium cursor-pointer"
              >
                Make this a reusable template
              </Label>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="cart-description" className="text-sm font-medium">
              Description (optional)
            </Label>
            <Textarea
              id="cart-description"
              placeholder="Add notes or description for this cart..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`rounded-xl transition-all duration-300 shadow-sm ${
                isDarkMode
                  ? "bg-slate-800/80 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:bg-slate-800 focus:border-purple-400/60"
                  : "bg-white/80 border-purple-200/60 focus:border-purple-400 focus:bg-white"
              }`}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags (optional)</Label>
            
            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {tags.map((tag) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isDarkMode 
                            ? 'bg-purple-900/40 text-purple-300 border-purple-700/50' 
                            : 'bg-purple-100/80 text-purple-700 border-purple-200/50'
                        }`}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:bg-purple-200/30 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(newTag)
                  }
                }}
                className={`flex-1 h-10 rounded-lg ${
                  isDarkMode
                    ? "bg-slate-800/80 border-slate-600/50 text-slate-100"
                    : "bg-white/80 border-purple-200/60"
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(newTag)}
                disabled={!newTag.trim()}
                className="h-10 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Predefined Tags */}
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.filter(tag => !tags.includes(tag)).slice(0, 6).map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addTag(tag)}
                  className={`h-8 px-3 rounded-full text-xs ${
                    isDarkMode
                      ? "text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                      : "text-slate-600 hover:bg-purple-50/80 hover:text-purple-700"
                  }`}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm p-3 rounded-lg bg-red-50 border border-red-200">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <SoundButton
            onClick={handleSave}
            disabled={isSaving || !label.trim() || !canSaveCart()}
            soundType="success"
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Cart
              </>
            )}
          </SoundButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}