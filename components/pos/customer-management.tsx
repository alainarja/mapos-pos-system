"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, User, Plus, Star, CreditCard, History, Phone, Mail, MapPin, Gift, X } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  loyaltyPoints: number
  storeCredit: number
  totalSpent: number
  visits: number
  lastVisit: string
  tier: "Bronze" | "Silver" | "Gold" | "Platinum"
  purchaseHistory: PurchaseRecord[]
}

interface PurchaseRecord {
  id: string
  date: string
  total: number
  items: number
  paymentMethod: string
}

const sampleCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
    loyaltyPoints: 1250,
    storeCredit: 25.5,
    totalSpent: 2840.75,
    visits: 47,
    lastVisit: "2024-01-15",
    tier: "Gold",
    purchaseHistory: [
      { id: "p1", date: "2024-01-15", total: 45.99, items: 3, paymentMethod: "Card" },
      { id: "p2", date: "2024-01-10", total: 23.5, items: 2, paymentMethod: "Cash" },
      { id: "p3", date: "2024-01-05", total: 67.25, items: 5, paymentMethod: "Card" },
    ],
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Ave, City, State 12345",
    loyaltyPoints: 890,
    storeCredit: 0,
    totalSpent: 1560.25,
    visits: 28,
    lastVisit: "2024-01-12",
    tier: "Silver",
    purchaseHistory: [
      { id: "p4", date: "2024-01-12", total: 89.99, items: 4, paymentMethod: "Card" },
      { id: "p5", date: "2024-01-08", total: 34.75, items: 2, paymentMethod: "Store Credit" },
    ],
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    email: "emma.r@email.com",
    phone: "+1 (555) 456-7890",
    address: "789 Pine St, City, State 12345",
    loyaltyPoints: 2100,
    storeCredit: 15.75,
    totalSpent: 4250.0,
    visits: 73,
    lastVisit: "2024-01-14",
    tier: "Platinum",
    purchaseHistory: [
      { id: "p6", date: "2024-01-14", total: 125.5, items: 8, paymentMethod: "Card" },
      { id: "p7", date: "2024-01-11", total: 78.25, items: 4, paymentMethod: "Cash" },
    ],
  },
]

interface CustomerManagementProps {
  onSelectCustomer: (customer: Customer | null) => void
  selectedCustomer: Customer | null
}

export function CustomerManagement({ onSelectCustomer, selectedCustomer }: CustomerManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<Customer | null>(null)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  )

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return "bg-amber-600"
      case "Silver":
        return "bg-gray-500"
      case "Gold":
        return "bg-yellow-500"
      case "Platinum":
        return "bg-purple-600"
      default:
        return "bg-gray-500"
    }
  }

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.email) {
      const customer: Customer = {
        id: Date.now().toString(),
        ...newCustomer,
        loyaltyPoints: 0,
        storeCredit: 0,
        totalSpent: 0,
        visits: 0,
        lastVisit: new Date().toISOString().split("T")[0],
        tier: "Bronze",
        purchaseHistory: [],
      }
      setCustomers([...customers, customer])
      setNewCustomer({ name: "", email: "", phone: "", address: "" })
      setIsAddDialogOpen(false)
    }
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomerDetails(customer)
    setIsDetailsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <User className="w-5 h-5 mr-2 text-purple-400" />
          Customer Management
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-purple-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-purple-300">Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-purple-300">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="bg-slate-700 border-purple-500/30 text-white"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-purple-300">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="bg-slate-700 border-purple-500/30 text-white"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-purple-300">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="bg-slate-700 border-purple-500/30 text-white"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-purple-300">
                  Address
                </Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="bg-slate-700 border-purple-500/30 text-white"
                  placeholder="Enter address"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCustomer}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!newCustomer.name || !newCustomer.email}
                >
                  Add Customer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
        <Input
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400"
        />
      </div>

      {/* Selected Customer */}
      {selectedCustomer && (
        <Card className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 border-purple-400/50 animate-in slide-in-from-top duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{selectedCustomer.name}</h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-purple-300 flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      {selectedCustomer.loyaltyPoints} pts
                    </span>
                    <span className="text-green-400 flex items-center">
                      <CreditCard className="w-3 h-3 mr-1" />${selectedCustomer.storeCredit}
                    </span>
                    <Badge className={getTierColor(selectedCustomer.tier)}>{selectedCustomer.tier}</Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectCustomer(null)}
                className="text-purple-300 hover:text-white hover:bg-purple-500/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredCustomers.length === 0 ? (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="p-8 text-center">
              <img
                src="/images/mapos-robot.png"
                alt="No customers"
                className="w-16 h-16 mx-auto mb-3 opacity-50 animate-pulse"
              />
              <p className="text-purple-300">No customers found</p>
              <p className="text-purple-400 text-sm">Try adjusting your search or add a new customer</p>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className={`bg-slate-800/50 border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                selectedCustomer?.id === customer.id ? "ring-2 ring-purple-400" : ""
              }`}
              onClick={() => onSelectCustomer(customer)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{customer.name}</h3>
                      <div className="flex items-center space-x-3 text-xs text-purple-300">
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {customer.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {customer.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getTierColor(customer.tier)} size="sm">
                        {customer.tier}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(customer)
                        }}
                        className="text-purple-400 hover:text-white hover:bg-purple-500/20 p-1"
                      >
                        <History className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-purple-300 flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {customer.loyaltyPoints}
                      </span>
                      <span className="text-green-400 flex items-center">
                        <Gift className="w-3 h-3 mr-1" />${customer.storeCredit}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-purple-300 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Details
            </DialogTitle>
          </DialogHeader>
          {selectedCustomerDetails && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-700/50 border-purple-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-300">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-purple-400" />
                      <span className="text-white">{selectedCustomerDetails.name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-purple-400" />
                      <span className="text-white">{selectedCustomerDetails.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-purple-400" />
                      <span className="text-white">{selectedCustomerDetails.phone}</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-purple-400 mt-0.5" />
                      <span className="text-white">{selectedCustomerDetails.address}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-purple-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-300">Loyalty & Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300 text-sm">Tier</span>
                      <Badge className={getTierColor(selectedCustomerDetails.tier)}>
                        {selectedCustomerDetails.tier}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300 text-sm">Loyalty Points</span>
                      <span className="text-white font-semibold">{selectedCustomerDetails.loyaltyPoints}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300 text-sm">Store Credit</span>
                      <span className="text-green-400 font-semibold">${selectedCustomerDetails.storeCredit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300 text-sm">Total Spent</span>
                      <span className="text-white font-semibold">${selectedCustomerDetails.totalSpent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300 text-sm">Visits</span>
                      <span className="text-white font-semibold">{selectedCustomerDetails.visits}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Purchase History */}
              <Card className="bg-slate-700/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-sm text-purple-300 flex items-center">
                    <History className="w-4 h-4 mr-2" />
                    Recent Purchase History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCustomerDetails.purchaseHistory.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between p-3 bg-slate-600/30 rounded-lg"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">{purchase.date}</p>
                          <p className="text-purple-300 text-xs">
                            {purchase.items} items • {purchase.paymentMethod}
                          </p>
                        </div>
                        <span className="text-white font-semibold">${purchase.total}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
