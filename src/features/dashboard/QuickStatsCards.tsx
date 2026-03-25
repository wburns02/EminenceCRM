import { useNavigate } from 'react-router-dom'
import { Briefcase, FileText, FileCheck, DollarSign } from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { usePipelineReport, useRevenueReport, useFunnelReport } from '@/api/hooks/useReports'

function formatDollars(cents: number): string {
  if (cents >= 100_000_00) {
    return `$${(cents / 100_000_00).toFixed(1)}M`
  }
  if (cents >= 1_000_00) {
    return `$${(cents / 1_000_00).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

function QuickStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-bg-card border border-border rounded-lg p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function QuickStatsCards() {
  const navigate = useNavigate()
  const pipeline = usePipelineReport()
  const revenue = useRevenueReport()
  const funnel = useFunnelReport()

  const isLoading = pipeline.isLoading || revenue.isLoading || funnel.isLoading

  if (isLoading) return <QuickStatsCardsSkeleton />

  const activeDeals = pipeline.data?.total_deals ?? 0
  const ioisPending = funnel.data?.engaged ?? 0
  const lois = funnel.data?.active ?? 0
  const closedYTD = revenue.data?.fees_earned_ytd ?? 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div onClick={() => navigate('/pipeline')} className="cursor-pointer hover:shadow-md transition-shadow rounded-lg">
        <StatsCard
          label="Active Deals"
          value={activeDeals}
          icon={<Briefcase className="h-5 w-5" />}
          accentColor="border-l-primary"
        />
      </div>
      <div onClick={() => navigate('/pipeline')} className="cursor-pointer hover:shadow-md transition-shadow rounded-lg">
        <StatsCard
          label="IOIs Pending"
          value={ioisPending}
          icon={<FileText className="h-5 w-5" />}
          accentColor="border-l-accent-gold"
        />
      </div>
      <div onClick={() => navigate('/pipeline')} className="cursor-pointer hover:shadow-md transition-shadow rounded-lg">
        <StatsCard
          label="LOIs Outstanding"
          value={lois}
          icon={<FileCheck className="h-5 w-5" />}
          accentColor="border-l-accent-teal"
        />
      </div>
      <div onClick={() => navigate('/reports/revenue')} className="cursor-pointer hover:shadow-md transition-shadow rounded-lg">
        <StatsCard
          label="Fees Earned YTD"
          value={formatDollars(closedYTD)}
          icon={<DollarSign className="h-5 w-5" />}
          accentColor="border-l-success"
        />
      </div>
    </div>
  )
}
