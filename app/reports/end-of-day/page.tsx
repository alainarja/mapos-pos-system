import EndOfDayReport from '@/components/reports/end-of-day-report'

export default function EndOfDayPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EndOfDayReport showCashReconciliation={true} />
    </div>
  )
}