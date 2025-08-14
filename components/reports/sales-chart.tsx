"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// Mock data for sales trend
const mockSalesData = [
  { date: '2024-01-01', sales: 1245 },
  { date: '2024-01-02', sales: 1567 },
  { date: '2024-01-03', sales: 1234 },
  { date: '2024-01-04', sales: 1789 },
  { date: '2024-01-05', sales: 2134 },
  { date: '2024-01-06', sales: 1876 },
  { date: '2024-01-07', sales: 2234 },
  { date: '2024-01-08', sales: 1654 },
  { date: '2024-01-09', sales: 1987 },
  { date: '2024-01-10', sales: 2345 },
  { date: '2024-01-11', sales: 2567 },
  { date: '2024-01-12', sales: 2123 },
  { date: '2024-01-13', sales: 2456 },
  { date: '2024-01-14', sales: 2789 }
]

export function SalesChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockSalesData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: any) => [`$${value}`, 'Sales']}
            labelFormatter={(value: any) => {
              const date = new Date(value)
              return date.toLocaleDateString()
            }}
          />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}