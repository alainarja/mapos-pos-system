"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  User, 
  Plus, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Customer } from '@/types'
import { customerService, CustomerCreateData, CustomerSearchParams } from '@/lib/services/customer-service'

interface CustomerSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectCustomer: (customer: Customer | null) => void
  selectedCustomer: Customer | null
  className?: string
}

interface NewCustomerForm {
  name: string
  email: string
  phone: string
  street?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
}

export function CustomerSelector({ 
  isOpen, 
  onClose, 
  onSelectCustomer, 
  selectedCustomer,
  className = ""
}: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<Customer | null>(null)
  
  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  })

  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-focus search input when dialog opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchTerm.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchTerm.trim())
      }, 500)
    } else if (searchTerm.trim().length === 0) {
      setSearchResults([])
      setSearchError(null)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  const handleSearch = async (query: string) => {
    if (query.length < 2) return

    setIsSearching(true)
    setSearchError(null)

    try {
      const searchParams: CustomerSearchParams = {
        search: query,
        limit: 10
      }

      // If query looks like email, search by email
      if (customerService.isValidEmail(query)) {
        searchParams.email = query
      }
      
      // If query looks like phone, search by phone
      if (customerService.isValidPhone(query.replace(/\D/g, ''))) {
        searchParams.phone = query.replace(/\D/g, '')
      }

      const result = await customerService.searchCustomers(searchParams)
      setSearchResults(result.data)
      
      if (result.data.length === 0) {
        setSearchError('No customers found matching your search')
      }
    } catch (error) {
      console.error('Customer search error:', error)
      setSearchError(error instanceof Error ? error.message : 'Search failed')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreateCustomer = async () => {
    // Validate required fields
    if (!newCustomer.name.trim()) {
      setCreateError('Customer name is required')
      return
    }
    
    if (!newCustomer.email.trim() || !customerService.isValidEmail(newCustomer.email)) {
      setCreateError('Valid email address is required')
      return
    }
    
    if (!newCustomer.phone.trim() || !customerService.isValidPhone(newCustomer.phone)) {
      setCreateError('Valid phone number is required')
      return
    }

    setIsCreating(true)
    setCreateError(null)

    try {
      const customerData: CustomerCreateData = {
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim().toLowerCase(),
        phone: newCustomer.phone.trim(),
        address: (newCustomer.street || newCustomer.city || newCustomer.state || newCustomer.zipCode) ? {
          street: newCustomer.street?.trim(),
          city: newCustomer.city?.trim(),
          state: newCustomer.state?.trim(),
          zipCode: newCustomer.zipCode?.trim(),
          country: 'US' // Default to US
        } : undefined,
        notes: newCustomer.notes?.trim()
      }

      const createdCustomer = await customerService.createCustomer(customerData)
      
      setCreateSuccess(createdCustomer)
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        notes: ''
      })
      
      // Automatically select the newly created customer
      onSelectCustomer(createdCustomer)
      
      setTimeout(() => {
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Customer creation error:', error)
      setCreateError(error instanceof Error ? error.message : 'Failed to create customer')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer)
    onClose()
  }

  const handleClearCustomer = () => {
    onSelectCustomer(null)
    onClose()
  }

  const resetForm = () => {
    setShowCreateForm(false)
    setCreateError(null)
    setCreateSuccess(null)
    setSearchTerm('')
    setSearchResults([])
    setSearchError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-4xl max-h-[90vh] overflow-hidden ${className}`}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {showCreateForm ? 'Create New Customer' : 'Select Customer'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetForm()
                onClose()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {!showCreateForm ? (
            // Search and Selection View
            <div className="space-y-6">
              {/* Current Selection */}
              {selectedCustomer && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">Current Customer</p>
                      <p className="text-blue-700">{selectedCustomer.name}</p>
                      <p className="text-sm text-blue-600">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCustomer}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Clear Customer
                    </Button>
                  </div>
                </div>
              )}

              {/* Search Section */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {isSearching && (
                      <Loader2 className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" />
                    )}
                  </div>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Customer
                  </Button>
                </div>

                {searchError && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{searchError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Search Results</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((customer) => (
                      <div
                        key={customer.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{customer.name}</h4>
                              {customer.tier && (
                                <Badge variant={customer.tier === 'gold' ? 'default' : 'secondary'} className="flex items-center">
                                  <Star className="h-3 w-3 mr-1 inline-block" />
                                  <span>{customer.tier}</span>
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            </div>
                            {customer.address && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {customer.address.city}, {customer.address.state}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {customer.loyaltyPoints} points • ${customer.totalSpent.toFixed(2)} spent • {customer.visitCount} visits
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Create Customer Form
            <div className="space-y-6">
              {createSuccess ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-green-900">Customer Created Successfully!</h3>
                    <p className="text-green-700">
                      {createSuccess.name} has been added and selected for this transaction.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer-name">Name *</Label>
                      <Input
                        id="customer-name"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                        placeholder="Customer full name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customer-email">Email *</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                        placeholder="customer@example.com"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customer-phone">Phone *</Label>
                      <Input
                        id="customer-phone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customer-street">Street Address</Label>
                      <Input
                        id="customer-street"
                        value={newCustomer.street}
                        onChange={(e) => setNewCustomer({...newCustomer, street: e.target.value})}
                        placeholder="123 Main Street"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customer-city">City</Label>
                      <Input
                        id="customer-city"
                        value={newCustomer.city}
                        onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                        placeholder="New York"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customer-state">State</Label>
                      <Input
                        id="customer-state"
                        value={newCustomer.state}
                        onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})}
                        placeholder="NY"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customer-zipCode">ZIP Code</Label>
                      <Input
                        id="customer-zipCode"
                        value={newCustomer.zipCode}
                        onChange={(e) => setNewCustomer({...newCustomer, zipCode: e.target.value})}
                        placeholder="10001"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customer-notes">Notes</Label>
                    <textarea
                      id="customer-notes"
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                      placeholder="Any additional notes about the customer..."
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  {createError && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{createError}</AlertDescription>
                    </Alert>
                  )}

                  <Separator />

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      disabled={isCreating}
                    >
                      Back to Search
                    </Button>
                    
                    <Button
                      onClick={handleCreateCustomer}
                      disabled={isCreating || !newCustomer.name.trim() || !newCustomer.email.trim() || !newCustomer.phone.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Customer
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}