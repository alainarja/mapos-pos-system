import { Expense } from '@/stores/cash-management'

export function exportExpensesToCSV(expenses: Expense[], filename?: string): void {
  // Create CSV headers
  const headers = [
    'Date',
    'Time',
    'Description',
    'Category',
    'Amount',
    'Currency',
    'USD Equivalent',
    'Exchange Rate',
    'Cashier'
  ]
  
  // Convert expenses to CSV rows
  const rows = expenses.map(expense => {
    const date = new Date(expense.timestamp)
    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      expense.description,
      expense.category,
      expense.amount.toFixed(2),
      expense.currency,
      expense.amountInUsd?.toFixed(2) || '',
      expense.exchangeRate?.toString() || '',
      expense.cashier || ''
    ]
  })
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename || `expenses_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportExpensesWithSummary(
  expenses: Expense[],
  exchangeRate: number,
  filename?: string
): void {
  // Calculate summaries
  const totalUsd = expenses
    .filter(e => e.currency === 'USD')
    .reduce((sum, e) => sum + e.amount, 0)
    
  const totalLbp = expenses
    .filter(e => e.currency === 'LBP')
    .reduce((sum, e) => sum + e.amount, 0)
    
  const totalInUsd = expenses
    .reduce((sum, e) => sum + (e.amountInUsd || e.amount), 0)
    
  // Group by category
  const byCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { count: 0, totalUsd: 0, totalLbp: 0 }
    }
    acc[expense.category].count++
    if (expense.currency === 'USD') {
      acc[expense.category].totalUsd += expense.amount
    } else {
      acc[expense.category].totalLbp += expense.amount
    }
    return acc
  }, {} as Record<string, { count: number, totalUsd: number, totalLbp: number }>)
  
  // Create enhanced CSV with summary
  const headers = [
    'Date',
    'Time',
    'Description',
    'Category',
    'Amount',
    'Currency',
    'USD Equivalent',
    'Exchange Rate',
    'Cashier'
  ]
  
  const rows = expenses.map(expense => {
    const date = new Date(expense.timestamp)
    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      expense.description,
      expense.category,
      expense.amount.toFixed(2),
      expense.currency,
      expense.amountInUsd?.toFixed(2) || '',
      expense.exchangeRate?.toString() || '',
      expense.cashier || ''
    ]
  })
  
  // Add summary section
  const summarySection = [
    '',
    '--- SUMMARY ---',
    '',
    `Total Expenses (USD): $${totalUsd.toFixed(2)}`,
    `Total Expenses (LBP): ${totalLbp.toLocaleString()} LBP`,
    `Total in USD (at rate ${exchangeRate}): $${totalInUsd.toFixed(2)}`,
    '',
    '--- BY CATEGORY ---',
    ...Object.entries(byCategory).map(([category, data]) => 
      `${category}: ${data.count} items | USD: $${data.totalUsd.toFixed(2)} | LBP: ${data.totalLbp.toLocaleString()}`
    ),
    '',
    `Export Date: ${new Date().toLocaleString()}`,
    `Exchange Rate Used: 1 USD = ${exchangeRate} LBP`
  ]
  
  // Combine all sections
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ...summarySection
  ].join('\n')
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename || `expenses_summary_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}