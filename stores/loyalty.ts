import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  LoyaltyProgram, 
  LoyaltyTier, 
  LoyaltyBenefit, 
  Customer, 
  CustomerSegment,
  SegmentCriteria 
} from '@/types'

interface LoyaltyStore {
  // State
  loyaltyProgram: LoyaltyProgram
  tiers: LoyaltyTier[]
  customerSegments: CustomerSegment[]
  isLoading: boolean
  
  // Actions
  updateLoyaltyProgram: (program: Partial<LoyaltyProgram>) => void
  addTier: (tier: Omit<LoyaltyTier, 'id'>) => void
  updateTier: (id: string, updates: Partial<LoyaltyTier>) => void
  deleteTier: (id: string) => void
  reorderTiers: (tiers: LoyaltyTier[]) => void
  
  // Customer Segment Management
  createSegment: (segment: Omit<CustomerSegment, 'id' | 'customerCount'>) => void
  updateSegment: (id: string, updates: Partial<CustomerSegment>) => void
  deleteSegment: (id: string) => void
  getSegmentCustomers: (segmentId: string) => Customer[]
  
  // Points Calculations
  calculatePointsEarned: (amount: number, tier: string) => number
  calculatePointsValue: (points: number) => number
  processLoyaltyTransaction: (customerId: string, amount: number, type: 'earn' | 'redeem') => void
  
  // Tier Management
  checkTierUpgrade: (customer: Customer) => LoyaltyTier | null
  upgradeTier: (customerId: string, newTier: string) => void
  getTierBenefits: (tierName: string) => LoyaltyBenefit[]
  
  // Analytics
  getLoyaltyStats: () => {
    totalMembers: number
    activeMembers: number
    pointsIssued: number
    pointsRedeemed: number
    tierDistribution: Record<string, number>
    averagePointsPerCustomer: number
  }
}

const defaultTiers: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    description: 'Welcome to our loyalty program!',
    minimumSpent: 0,
    pointsMultiplier: 1,
    color: '#CD7F32',
    icon: '🥉',
    benefits: [
      {
        id: 'bronze-birthday',
        type: 'birthday_bonus',
        name: 'Birthday Bonus',
        description: 'Get 100 bonus points on your birthday',
        value: 100
      }
    ],
    requirements: [
      {
        type: 'total_spent',
        value: 0,
        period: 'lifetime'
      }
    ]
  },
  {
    id: 'silver',
    name: 'Silver',
    description: 'Earn 1.5x points on every purchase',
    minimumSpent: 500,
    pointsMultiplier: 1.5,
    color: '#C0C0C0',
    icon: '🥈',
    benefits: [
      {
        id: 'silver-multiplier',
        type: 'discount',
        name: 'Points Multiplier',
        description: '1.5x points on all purchases',
        value: 1.5
      },
      {
        id: 'silver-birthday',
        type: 'birthday_bonus',
        name: 'Birthday Bonus',
        description: 'Get 200 bonus points on your birthday',
        value: 200
      }
    ],
    requirements: [
      {
        type: 'total_spent',
        value: 500,
        period: 'lifetime'
      }
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'Earn 2x points and get exclusive perks',
    minimumSpent: 1500,
    pointsMultiplier: 2,
    color: '#FFD700',
    icon: '🥇',
    benefits: [
      {
        id: 'gold-multiplier',
        type: 'discount',
        name: 'Points Multiplier',
        description: '2x points on all purchases',
        value: 2
      },
      {
        id: 'gold-discount',
        type: 'discount',
        name: 'Member Discount',
        description: '5% discount on all purchases',
        value: 5
      },
      {
        id: 'gold-birthday',
        type: 'birthday_bonus',
        name: 'Birthday Bonus',
        description: 'Get 500 bonus points on your birthday',
        value: 500
      }
    ],
    requirements: [
      {
        type: 'total_spent',
        value: 1500,
        period: 'lifetime'
      }
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum',
    description: 'Our highest tier with premium benefits',
    minimumSpent: 3000,
    pointsMultiplier: 2.5,
    color: '#E5E4E2',
    icon: '💎',
    benefits: [
      {
        id: 'platinum-multiplier',
        type: 'discount',
        name: 'Points Multiplier',
        description: '2.5x points on all purchases',
        value: 2.5
      },
      {
        id: 'platinum-discount',
        type: 'discount',
        name: 'Member Discount',
        description: '10% discount on all purchases',
        value: 10
      },
      {
        id: 'platinum-birthday',
        type: 'birthday_bonus',
        name: 'Birthday Bonus',
        description: 'Get 1000 bonus points on your birthday',
        value: 1000
      },
      {
        id: 'platinum-early-access',
        type: 'early_access',
        name: 'Early Access',
        description: 'Get early access to sales and new products',
        value: 1
      }
    ],
    requirements: [
      {
        type: 'total_spent',
        value: 3000,
        period: 'lifetime'
      }
    ]
  }
]

const defaultSegments: CustomerSegment[] = [
  {
    id: 'vip',
    name: 'VIP Customers',
    description: 'High-value customers with $2000+ lifetime spend',
    color: '#9333EA',
    customerCount: 0,
    criteria: [
      {
        field: 'totalSpent',
        operator: 'greater_than',
        value: 2000
      }
    ]
  },
  {
    id: 'frequent',
    name: 'Frequent Shoppers',
    description: 'Customers with 10+ visits in the last 6 months',
    color: '#10B981',
    customerCount: 0,
    criteria: [
      {
        field: 'visitCount',
        operator: 'greater_than',
        value: 10
      }
    ]
  },
  {
    id: 'new',
    name: 'New Customers',
    description: 'Customers who joined in the last 30 days',
    color: '#3B82F6',
    customerCount: 0,
    criteria: [
      {
        field: 'daysSinceLastVisit',
        operator: 'less_than',
        value: 30
      }
    ]
  },
  {
    id: 'at-risk',
    name: 'At-Risk Customers',
    description: 'Previously active customers who haven\'t visited in 90+ days',
    color: '#EF4444',
    customerCount: 0,
    criteria: [
      {
        field: 'daysSinceLastVisit',
        operator: 'greater_than',
        value: 90
      },
      {
        field: 'visitCount',
        operator: 'greater_than',
        value: 3
      }
    ]
  }
]

const defaultLoyaltyProgram: LoyaltyProgram = {
  id: 'default',
  name: 'Retail Rewards',
  description: 'Earn points on every purchase and unlock exclusive benefits',
  pointsPerDollar: 10, // 10 points per dollar spent
  pointsValue: 1, // 1 cent per point (100 points = $1)
  tiers: defaultTiers,
  isActive: true,
  expirationPeriod: 24, // 24 months
  allowNegativeBalance: false,
  roundingRule: 'down'
}

export const useLoyaltyStore = create<LoyaltyStore>()(
  persist(
    (set, get) => ({
      // Initial State
      loyaltyProgram: defaultLoyaltyProgram,
      tiers: defaultTiers,
      customerSegments: defaultSegments,
      isLoading: false,

      // Loyalty Program Management
      updateLoyaltyProgram: (updates) => {
        set((state) => ({
          loyaltyProgram: { ...state.loyaltyProgram, ...updates }
        }))
      },

      // Tier Management
      addTier: (tierData) => {
        const newTier: LoyaltyTier = {
          ...tierData,
          id: `tier-${Date.now()}`
        }
        set((state) => ({
          tiers: [...state.tiers, newTier].sort((a, b) => a.minimumSpent - b.minimumSpent)
        }))
      },

      updateTier: (id, updates) => {
        set((state) => ({
          tiers: state.tiers.map(tier =>
            tier.id === id ? { ...tier, ...updates } : tier
          )
        }))
      },

      deleteTier: (id) => {
        set((state) => ({
          tiers: state.tiers.filter(tier => tier.id !== id)
        }))
      },

      reorderTiers: (tiers) => {
        set({ tiers })
      },

      // Customer Segment Management
      createSegment: (segmentData) => {
        const newSegment: CustomerSegment = {
          ...segmentData,
          id: `segment-${Date.now()}`,
          customerCount: 0
        }
        set((state) => ({
          customerSegments: [...state.customerSegments, newSegment]
        }))
      },

      updateSegment: (id, updates) => {
        set((state) => ({
          customerSegments: state.customerSegments.map(segment =>
            segment.id === id ? { ...segment, ...updates } : segment
          )
        }))
      },

      deleteSegment: (id) => {
        set((state) => ({
          customerSegments: state.customerSegments.filter(segment => segment.id !== id)
        }))
      },

      getSegmentCustomers: (segmentId) => {
        // This would typically fetch from a customer store or API
        // For now, return empty array - implement when customer store is ready
        return []
      },

      // Points Calculations
      calculatePointsEarned: (amount, tierName) => {
        const { tiers, loyaltyProgram } = get()
        const tier = tiers.find(t => t.name.toLowerCase() === tierName.toLowerCase())
        if (!tier) return Math.floor(amount * loyaltyProgram.pointsPerDollar)
        
        let points = amount * loyaltyProgram.pointsPerDollar * tier.pointsMultiplier
        
        // Apply rounding rule
        switch (loyaltyProgram.roundingRule) {
          case 'up':
            return Math.ceil(points)
          case 'down':
            return Math.floor(points)
          default:
            return Math.round(points)
        }
      },

      calculatePointsValue: (points) => {
        const { loyaltyProgram } = get()
        return points * loyaltyProgram.pointsValue / 100 // Convert cents to dollars
      },

      processLoyaltyTransaction: (customerId, amount, type) => {
        // This would update customer points in the customer store
        // Implementation depends on customer store structure
        console.log(`Processing loyalty transaction: ${type} ${amount} for customer ${customerId}`)
      },

      // Tier Management
      checkTierUpgrade: (customer) => {
        const { tiers } = get()
        const currentTier = tiers.find(t => t.name.toLowerCase() === customer.tier.name?.toLowerCase()) || tiers[0]
        
        // Find the highest tier the customer qualifies for
        const qualifyingTiers = tiers.filter(tier => {
          return tier.requirements.every(req => {
            switch (req.type) {
              case 'total_spent':
                return customer.totalSpent >= req.value
              case 'visit_count':
                return customer.visitCount >= req.value
              case 'points_earned':
                return customer.loyaltyPointsEarned >= req.value
              default:
                return false
            }
          })
        })

        const highestTier = qualifyingTiers.reduce((highest, current) => 
          current.minimumSpent > highest.minimumSpent ? current : highest
        , qualifyingTiers[0])

        return highestTier && highestTier.id !== currentTier.id ? highestTier : null
      },

      upgradeTier: (customerId, newTier) => {
        // This would update customer tier in the customer store
        console.log(`Upgrading customer ${customerId} to tier ${newTier}`)
      },

      getTierBenefits: (tierName) => {
        const { tiers } = get()
        const tier = tiers.find(t => t.name.toLowerCase() === tierName.toLowerCase())
        return tier?.benefits || []
      },

      // Analytics
      getLoyaltyStats: () => {
        // This would typically aggregate data from customer transactions
        // For now, return mock data
        return {
          totalMembers: 1847,
          activeMembers: 1203,
          pointsIssued: 847592,
          pointsRedeemed: 234758,
          tierDistribution: {
            'Bronze': 1102,
            'Silver': 485,
            'Gold': 187,
            'Platinum': 73
          },
          averagePointsPerCustomer: 459
        }
      }
    }),
    {
      name: 'loyalty-store'
    }
  )
)