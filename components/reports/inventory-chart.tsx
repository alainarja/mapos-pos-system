"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface InventoryData {
  category: string
  itemCount: number
  value: number
}

interface InventoryChartProps {
  data: InventoryData[]
}

export function InventoryChart({ data }: InventoryChartProps) {
  const formatTooltip = (value: any, name: string) => {
    if (name === 'value') {
      return [`$${value.toFixed(2)}`, 'Value']
    }
    if (name === 'itemCount') {
      return [`${value}`, 'Items']
    }
    return [value, name]
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-slate-500">
        No inventory data available
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="category" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            yAxisId="left"
            dataKey="value" 
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
            name="value"
          />
          <Bar 
            yAxisId="right"
            dataKey="itemCount" 
            fill="#06b6d4"
            radius={[4, 4, 0, 0]}
            name="itemCount"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}