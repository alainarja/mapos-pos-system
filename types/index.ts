export interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  stock: number
  barcode?: string
  cost?: number
  supplier?: string
  description?: string
  minStock?: number
  maxStock?: number
  unit?: string
  sku?: string
  brand?: string
  isFeatured?: boolean
  isNew?: boolean
  createdAt?: Date
  updatedAt?: Date
  // Enhanced product properties
  tags?: string[]
  availability?: 'available' | 'limited' | 'unavailable' | 'backorder'
  discountPrice?: number
  discountPercentage?: number
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  expiryDate?: Date
  batchNumber?: string
  location?: string // Storage location
  reorderLevel?: number
  leadTime?: number // days
  averageSales?: number // units per day/week
  seasonality?: 'all_year' | 'seasonal' | 'holiday'
  rating?: number
  reviewCount?: number
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  parentId?: string
  isActive: boolean
  order: number
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  category?: string
  discount?: number
  discountType?: 'percentage' | 'fixed'
  taxRate?: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  loyaltyPoints: number
  storeCredit: number
  tier: LoyaltyTier
  address?: Address
  birthDate?: Date
  notes?: string
  isActive: boolean
  createdAt: Date
  lastVisit?: Date
  totalSpent: number
  visitCount: number
  averageOrderValue: number
  preferredCategories: string[]
  customerSegment: CustomerSegment
  loyaltyPointsEarned: number
  loyaltyPointsRedeemed: number
  referralCode?: string
  referredBy?: string
  tags: string[]
  customFields?: Record<string, any>
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Transaction {
  id: string
  date: string
  time: string
  total: number
  subtotal: number
  tax: number
  discount: number
  items: CartItem[]
  paymentMethod: string
  cashier: string
  customerId?: string
  status: 'pending' | 'completed' | 'refunded' | 'cancelled'
  receiptNumber: string
}

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'manager' | 'cashier'
  permissions: string[]
  isActive: boolean
  lastLogin?: Date
  currentShift?: Shift
}

export interface Shift {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  startingCash: number
  endingCash?: number
  sales: number
  transactions: Transaction[]
  status: 'active' | 'closed'
}

export interface InventoryAlert {
  id: string
  productId: string
  type: 'low_stock' | 'out_of_stock' | 'expired' | 'overstock' | 'reorder_needed' | 'slow_moving'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
  isRead: boolean
  actionRequired?: boolean
  estimatedImpact?: 'low' | 'medium' | 'high'
}

export interface SalesReport {
  period: {
    start: Date
    end: Date
  }
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  topProducts: Array<{
    product: Product
    quantitySold: number
    revenue: number
  }>
  topCategories: Array<{
    category: string
    revenue: number
    percentage: number
  }>
  hourlyBreakdown: Array<{
    hour: string
    sales: number
    transactions: number
  }>
  paymentMethods: Array<{
    method: string
    amount: number
    percentage: number
  }>
}

export interface InventoryReport {
  totalProducts: number
  totalValue: number
  lowStockItems: Product[]
  outOfStockItems: Product[]
  topSellingItems: Product[]
  slowMovingItems: Product[]
  categoryBreakdown: Array<{
    category: string
    itemCount: number
    value: number
  }>
}

export interface Settings {
  store: {
    name: string
    address: Address
    phone: string
    email: string
    taxRate: number
    currency: string
    timezone: string
  }
  receipt: {
    header: string
    footer: string
    logo?: string
    showLogo: boolean
  }
  payment: {
    acceptCash: boolean
    acceptCard: boolean
    acceptDigitalWallet: boolean
    acceptGiftCard: boolean
  }
  inventory: {
    enableLowStockAlerts: boolean
    lowStockThreshold: number
    enableBarcodeScanning: boolean
  }
  print: {
    autoPrintEnabled: boolean
    printImmediately: boolean
    showPreview: boolean
    customerCopy: boolean
    merchantCopy: boolean
    confirmBeforePrint: boolean
    printDelay: number
    defaultPrinter: string
    includeLogo: boolean
    includeBarcode: boolean
    includeCustomerInfo: boolean
    paperSize: 'thermal' | 'a4' | 'letter'
  }
  theme: {
    mode: 'light' | 'dark' | 'auto'
    primaryColor: string
  }
  sound: {
    enabled: boolean
    volume: number
    clickSound: boolean
    successSound: boolean
    errorSound: boolean
    specialSound: boolean
  }
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  action?: {
    label: string
    callback: () => void
  }
}

export interface Coupon {
  id: string
  code: string
  name: string
  description: string
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'category_discount'
  value: number // percentage (0-100) or fixed amount
  minimumPurchase?: number
  maximumDiscount?: number
  applicableCategories?: string[] // for category-specific discounts
  buyQuantity?: number // for buy X get Y free
  getQuantity?: number // for buy X get Y free
  freeItemCategories?: string[] // categories eligible for free items
  startDate: Date
  endDate: Date
  usageLimit?: number // total usage limit
  usageCount: number // current usage count
  isActive: boolean
  canStack: boolean // can be combined with other coupons
  stackingRules?: {
    allowWithOtherCoupons: boolean
    allowWithDiscounts: boolean
    maxStackingValue?: number // maximum total discount when stacked
  }
  createdAt: Date
  updatedAt: Date
}

export interface AppliedCoupon {
  coupon: Coupon
  appliedAt: Date
  discountAmount: number
  applicableItems?: string[] // IDs of items this coupon applies to
  freeItems?: CartItem[] // free items granted by this coupon
}

export interface CartCouponState {
  appliedCoupons: AppliedCoupon[]
  totalCouponDiscount: number
  couponValidationErrors: string[]
}

export interface HeldCart {
  id: string
  items: CartItem[]
  selectedCustomer: Customer | null
  discount: number
  discountInfo: {
    type: 'percentage' | 'fixed'
    value: number
    reason?: string
    managerId?: string
    timestamp: Date
  } | null
  appliedCoupons: AppliedCoupon[]
  subtotal: number
  tax: number
  total: number
  totalSavings: number
  timestamp: Date
  holdReason?: string
  cashier: string
  customerName?: string
}

export interface SavedCart {
  id: string
  items: CartItem[]
  selectedCustomer: Customer | null
  discount: number
  discountInfo: {
    type: 'percentage' | 'fixed'
    value: number
    reason?: string
    managerId?: string
    timestamp: Date
  } | null
  appliedCoupons: AppliedCoupon[]
  subtotal: number
  tax: number
  total: number
  totalSavings: number
  createdAt: Date
  updatedAt: Date
  savedBy: string // user who saved the cart
  userId: string // user ID for multi-user environments
  label: string // custom name/label for the saved cart
  description?: string // optional description
  customerName?: string
  isTemplate?: boolean // whether this cart is a template for reuse
  tags?: string[] // optional tags for categorization
  category?: 'customer' | 'template' | 'quote' | 'saved' // cart category
}

export interface CartSaveOptions {
  label: string
  description?: string
  isTemplate?: boolean
  tags?: string[]
  category?: 'customer' | 'template' | 'quote' | 'saved'
}

// Search and Filter Types
export interface PriceRange {
  min: number
  max: number
  label: string
}

export interface ProductFilter {
  categories: string[]
  priceRange: PriceRange | null
  customPriceRange: { min: number; max: number } | null
  stockStatus: ('in_stock' | 'low_stock' | 'out_of_stock')[]
  brands: string[]
  tags: ('new' | 'featured')[]
  suppliers: string[]
}

export interface SortOption {
  field: 'name' | 'price' | 'stock' | 'category' | 'created' | 'updated'
  direction: 'asc' | 'desc'
  label: string
}

export interface SearchState {
  query: string
  filters: ProductFilter
  sortBy: SortOption
  isFilterSidebarOpen: boolean
  resultsCount: number
  activeFilterCount: number
}

export interface FilterChip {
  id: string
  label: string
  type: 'category' | 'price' | 'stock' | 'brand' | 'tag' | 'supplier'
  value: any
  removable: boolean
}

// Returns & Exchanges Types
export interface ReturnTransaction {
  id: string
  type: 'return' | 'exchange' | 'refund'
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'rejected'
  date: string
  time: string
  originalTransaction: Transaction | null
  originalReceiptNumber?: string
  
  // Return/Exchange Items
  returnItems: ReturnItem[]
  exchangeItems: ExchangeItem[]
  
  // Financial Details
  refundAmount: number
  exchangeDifference: number
  totalRefund: number
  
  // Validation & Approval
  requiresManagerApproval: boolean
  managerApproval?: {
    managerId: string
    managerName: string
    approvedAt: string
    reason: string
  }
  
  // Processing Details
  refundMethod: 'original' | 'cash' | 'store_credit' | 'card'
  processedBy: string
  customerId?: string
  
  // Policy Validation
  withinReturnPeriod: boolean
  returnPolicyViolations: string[]
  
  // Documentation
  receiptNumber: string
  notes?: string
  
  // Inventory Impact
  inventoryUpdated: boolean
  restockedItems: string[]
}

export interface ReturnItem {
  id: string
  originalTransactionId: string
  productId: string
  name: string
  price: number
  originalQuantity: number
  returnQuantity: number
  reason: string
  condition: 'new' | 'opened' | 'damaged' | 'defective'
  notes?: string
  sku?: string
  image?: string
}

export interface ExchangeItem {
  id: string
  originalItem: ReturnItem
  newProductId: string
  newProductName: string
  newPrice: number
  quantity: number
  priceDifference: number
  image?: string
}

export interface ReturnReason {
  id: string
  label: string
  requiresManager: boolean
  allowsExchange: boolean
  restockable: boolean
}

export interface ReturnPolicy {
  returnPeriodDays: number
  exchangePeriodDays: number
  requireReceiptForReturns: boolean
  requireReceiptForExchanges: boolean
  maxRefundWithoutReceipt: number
  managerApprovalThreshold: number
  allowDamagedReturns: boolean
  allowOpenedReturns: boolean
  restockingFee: number
  restockingFeeThreshold: number
}

// Loyalty System Types
export interface LoyaltyTier {
  id: string
  name: string
  description: string
  minimumSpent: number
  pointsMultiplier: number
  benefits: LoyaltyBenefit[]
  color: string
  icon: string
  nextTier?: LoyaltyTier
  requirements: TierRequirement[]
}

export interface LoyaltyBenefit {
  id: string
  type: 'discount' | 'free_item' | 'birthday_bonus' | 'early_access' | 'free_shipping'
  name: string
  description: string
  value: number
  conditions?: string
}

export interface TierRequirement {
  type: 'total_spent' | 'visit_count' | 'points_earned'
  value: number
  period?: 'lifetime' | 'year' | 'month'
}

export interface LoyaltyProgram {
  id: string
  name: string
  description: string
  pointsPerDollar: number
  pointsValue: number // value in cents per point
  tiers: LoyaltyTier[]
  isActive: boolean
  expirationPeriod?: number // months
  allowNegativeBalance: boolean
  roundingRule: 'up' | 'down' | 'nearest'
}

export interface CustomerSegment {
  id: string
  name: string
  description: string
  criteria: SegmentCriteria[]
  color: string
  customerCount: number
}

export interface SegmentCriteria {
  field: 'totalSpent' | 'visitCount' | 'averageOrderValue' | 'daysSinceLastVisit' | 'tier'
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in'
  value: any
}

// Gift Card Types
export interface GiftCard {
  id: string
  cardNumber: string
  balance: number
  originalValue: number
  isActive: boolean
  expirationDate?: Date
  createdAt: Date
  purchasedBy?: Customer
  purchaseTransactionId?: string
  lastUsedAt?: Date
  usageHistory: GiftCardTransaction[]
}

export interface GiftCardTransaction {
  id: string
  type: 'purchase' | 'redemption' | 'refund' | 'adjustment'
  amount: number
  transactionId: string
  date: Date
  notes?: string
}

// Promotion and Discount Types
export interface Promotion {
  id: string
  name: string
  description: string
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle' | 'tiered'
  value: number
  conditions: PromotionCondition[]
  startDate: Date
  endDate: Date
  isActive: boolean
  usageLimit?: number
  usageCount: number
  customerLimit?: number
  applicableCategories?: string[]
  excludedCategories?: string[]
  applicableProducts?: string[]
  excludedProducts?: string[]
  minimumPurchase?: number
  maximumDiscount?: number
  stackable: boolean
  priority: number
  autoApply: boolean
  requiresCouponCode: boolean
  couponCode?: string
}

export interface PromotionCondition {
  type: 'minimum_amount' | 'item_quantity' | 'category' | 'customer_tier' | 'day_of_week' | 'time_range'
  value: any
  operator?: 'equals' | 'greater_than' | 'less_than' | 'in'
}

export interface AppliedPromotion {
  promotion: Promotion
  discountAmount: number
  appliedAt: Date
  applicableItems?: string[]
  metadata?: Record<string, any>
}

// Advanced Payment Types
export interface PaymentMethod {
  id: string
  type: 'cash' | 'card' | 'digital_wallet' | 'gift_card' | 'store_credit' | 'layaway' | 'finance'
  name: string
  isActive: boolean
  processingFee?: number
  minimumAmount?: number
  maximumAmount?: number
  requiresSignature?: boolean
  allowsPartialPayment: boolean
  allowsRefund: boolean
  configuration?: Record<string, any>
}

export interface SplitPayment {
  id: string
  method: PaymentMethod
  amount: number
  transactionReference?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  metadata?: Record<string, any>
}

// Cash Register Management Types
export interface CashRegister {
  id: string
  name: string
  location: string
  currentBalance: number
  expectedBalance: number
  lastReconciliation: Date
  status: 'open' | 'closed' | 'suspended'
  cashDrops: CashDrop[]
  cashIns: CashIn[]
  floatAmount: number
  overShortAmount: number
  transactions: string[] // transaction IDs
}

export interface CashDrop {
  id: string
  amount: number
  reason: string
  performedBy: string
  timestamp: Date
  notes?: string
  deposited: boolean
  depositReference?: string
}

export interface CashIn {
  id: string
  amount: number
  reason: string
  performedBy: string
  timestamp: Date
  notes?: string
  source: 'bank' | 'change_fund' | 'other'
}

// Advanced Shift Management Types
export interface ShiftPerformance {
  salesTarget?: number
  salesAchieved: number
  transactionTarget?: number
  transactionAchieved: number
  averageTransactionValue: number
  customersSserved: number
  itemsSold: number
  returnsProcessed: number
  discountsApplied: number
  upsellsAchieved: number
}

export interface ShiftHandover {
  fromShift: string
  toShift: string
  handoverTime: Date
  notes: string
  completedBy: string
  acknowledgedBy?: string
  issues: HandoverIssue[]
}

export interface HandoverIssue {
  type: 'cash_variance' | 'equipment' | 'inventory' | 'customer' | 'other'
  description: string
  severity: 'low' | 'medium' | 'high'
  resolved: boolean
  reportedBy: string
}

// Enhanced Reporting Types
export interface AdvancedSalesReport extends SalesReport {
  customerMetrics: {
    newCustomers: number
    returningCustomers: number
    customerRetentionRate: number
    averageCustomerLifetimeValue: number
  }
  productMetrics: {
    totalItemsSold: number
    averageItemsPerTransaction: number
    topPerformingCategories: CategoryPerformance[]
    slowMovingItems: Product[]
  }
  profitMetrics: {
    grossProfit: number
    grossMargin: number
    profitByCategory: CategoryProfitability[]
  }
  promotionMetrics: {
    promotionsUsed: PromotionUsage[]
    totalDiscountGiven: number
    averageDiscountPerTransaction: number
  }
}

export interface CategoryPerformance {
  category: string
  itemsSold: number
  revenue: number
  profit: number
  margin: number
  growthRate: number
}

export interface CategoryProfitability {
  category: string
  revenue: number
  cost: number
  profit: number
  margin: number
}

export interface PromotionUsage {
  promotion: Promotion
  usageCount: number
  totalDiscount: number
  revenueImpact: number
}

export interface KPIMetric {
  name: string
  value: number
  target?: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
  period: string
}

// Enhanced Stock Management Types
export interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: Address
  website?: string
  taxId?: string
  paymentTerms?: string
  leadTime: number // days
  minimumOrderAmount?: number
  rating?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  products?: string[] // product IDs supplied by this supplier
  lastOrderDate?: Date
  totalOrders?: number
  notes?: string
}

export interface StockMovement {
  id: string
  productId: string
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'damage' | 'expired' | 'reorder'
  quantity: number
  previousStock: number
  newStock: number
  unitCost?: number
  totalValue: number
  reason?: string
  reference?: string // order number, transaction ID, etc.
  batchNumber?: string
  expiryDate?: Date
  supplierId?: string
  userId: string
  userName: string
  timestamp: Date
  notes?: string
}

export interface StockHistory {
  productId: string
  movements: StockMovement[]
  totalIn: number
  totalOut: number
  currentStock: number
  averageCost: number
  lastMovement?: Date
  velocity?: number // units per day
  turnoverRate?: number
}

export interface ReorderPoint {
  id: string
  productId: string
  minStock: number
  reorderLevel: number
  maxStock: number
  reorderQuantity: number
  leadTime: number // days
  safetyStock: number
  isAutoReorderEnabled: boolean
  lastCalculated: Date
  demandForecast?: number
  seasonalFactor?: number
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplierName: string
  status: 'draft' | 'pending' | 'sent' | 'confirmed' | 'received' | 'cancelled'
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  orderDate: Date
  expectedDelivery?: Date
  deliveredDate?: Date
  createdBy: string
  notes?: string
  reference?: string
}

export interface PurchaseOrderItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  unitCost: number
  totalCost: number
  receivedQuantity?: number
  notes?: string
}

export interface StockAlert {
  id: string
  productId: string
  productName: string
  type: 'low_stock' | 'out_of_stock' | 'expired' | 'overstock' | 'reorder_needed' | 'slow_moving' | 'fast_moving' | 'supplier_delay'
  message: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  currentStock: number
  recommendedAction: string
  estimatedImpact: 'low' | 'medium' | 'high'
  createdAt: Date
  isRead: boolean
  isResolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  daysUntilCritical?: number
  affectedSales?: number
}

export interface StockAnalytics {
  productId: string
  productName: string
  category: string
  currentStock: number
  stockValue: number
  averageMonthlySales: number
  stockVelocity: number // units per day
  daysOfStock: number
  turnoverRate: number // times per year
  reorderFrequency: number // times per year
  stockoutRisk: 'low' | 'medium' | 'high'
  overstock: boolean
  fastMoving: boolean
  slowMoving: boolean
  seasonal: boolean
  profitability: 'high' | 'medium' | 'low'
  margin: number
  lastSaleDate?: Date
  peakDemandPeriod?: string
  recommendations: string[]
}

export interface InventoryForecast {
  productId: string
  period: 'week' | 'month' | 'quarter'
  expectedDemand: number
  currentStock: number
  suggestedReorder: number
  stockoutProbability: number
  overstock: boolean
  confidence: number // 0-100%
  seasonalityFactor: number
  trendFactor: number
  lastUpdated: Date
}

export interface StockAdjustmentRequest {
  id: string
  productId: string
  productName: string
  currentStock: number
  newStock: number
  adjustmentQuantity: number
  adjustmentType: 'increase' | 'decrease'
  reason: 'damaged' | 'expired' | 'stolen' | 'found' | 'correction' | 'return' | 'other'
  notes?: string
  requestedBy: string
  requestedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: Date
  appliedAt?: Date
  requiresApproval: boolean
}

export interface StockLocation {
  id: string
  name: string
  type: 'warehouse' | 'store' | 'backroom' | 'display' | 'damaged' | 'quarantine'
  description?: string
  capacity?: number
  isActive: boolean
  products: StockLocationItem[]
}

export interface StockLocationItem {
  productId: string
  quantity: number
  binLocation?: string
  lastUpdated: Date
  notes?: string
}

export interface StockTransfer {
  id: string
  fromLocationId: string
  toLocationId: string
  fromLocationName: string
  toLocationName: string
  items: StockTransferItem[]
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  transferDate: Date
  completedDate?: Date
  transferredBy: string
  receivedBy?: string
  notes?: string
}

export interface StockTransferItem {
  productId: string
  productName: string
  quantity: number
  receivedQuantity?: number
  notes?: string
}

export interface StockMetrics {
  totalProducts: number
  totalStockValue: number
  totalStockUnits: number
  averageStockVelocity: number
  averageTurnoverRate: number
  stockAccuracy: number
  lowStockItems: number
  outOfStockItems: number
  overstockItems: number
  expiringSoonItems: number
  expiredItems: number
  fastMovingItems: number
  slowMovingItems: number
  reorderNeededItems: number
  totalPurchaseOrders: number
  pendingDeliveries: number
  supplierPerformance: number
  stockoutEvents: number
  lastStockTakeDate?: Date
}

export interface StockTake {
  id: string
  name: string
  description?: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  type: 'full' | 'cycle' | 'spot'
  scheduledDate: Date
  startedDate?: Date
  completedDate?: Date
  location?: string
  createdBy: string
  assignedTo?: string[]
  items: StockTakeItem[]
  totalVariance: number
  totalVarianceValue: number
  accuracyPercentage: number
  notes?: string
}

export interface StockTakeItem {
  productId: string
  productName: string
  sku: string
  expectedQuantity: number
  countedQuantity?: number
  variance?: number
  varianceValue?: number
  countedBy?: string
  countedAt?: Date
  verified: boolean
  notes?: string
}