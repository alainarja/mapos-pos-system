"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Category } from "@/types"
import { useInventoryStore } from "@/stores/inventory"

interface CategoryDialogProps {
  open: boolean
  onClose: () => void
  category?: Category | null
}

const categoryIcons = [
  "☕", "🍵", "🍿", "🥐", "🥤", "🍽️",
  "🍎", "🥬", "🥩", "🍕", "🍰", "🍫",
  "🧴", "🧽", "📱", "👕", "📚", "🏠"
]

export function CategoryDialog({ open, onClose, category }: CategoryDialogProps) {
  const { addCategory, updateCategory } = useInventoryStore()
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    icon: '📦',
    parentId: undefined,
    isActive: true,
    order: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData(category)
    } else {
      setFormData({
        name: '',
        description: '',
        icon: '📦',
        parentId: undefined,
        isActive: true,
        order: 0
      })
    }
  }, [category, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (category) {
        updateCategory(category.id, formData)
      } else {
        const newCategory: Category = {
          ...formData,
          id: `category-${Date.now()}`
        } as Category
        addCategory(newCategory)
      }
      onClose()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Category description"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-9 gap-2 p-2 border rounded-lg">
              {categoryIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`p-2 text-2xl rounded hover:bg-purple-100 transition-colors ${
                    formData.icon === icon ? 'bg-purple-200' : ''
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              min="0"
              value={formData.order || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Category</Label>
              <p className="text-sm text-slate-500">
                Inactive categories won't appear in product selection
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              {isLoading ? 'Saving...' : category ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}