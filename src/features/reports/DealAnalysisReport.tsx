import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/ui/StatsCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useVelocityReport, useFunnelReport } from '@/api/hooks/useReports'

const BRAND_COLORS = ['#00594C', '#C9A84C', '#4ECDC4', '#003D2E', '#DC3545']

export default function DealAnalysisReport() {
  const navigate = useNavigate()
  const { data: velocity, isLoading: loadingVelocity } = useVelocityReport()
  const { data: funnel, isLoading: loadingFunnel } = useFunnelReport()

  const isLoading = loadingVelocity || loadingFunnel

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  const funnelData = funnel
    ? [
        { name: 'Pipeline', value: funnel.pipeline },
        { name: 'Engaged', value: funnel.engaged },
        { name: 'Active', value: funnel.active },
        { name: 'Won', value: funnel.closed_won },
        { name: 'Lost', value: funnel.closed_lost },
      ]
    : []

  const velocityStages = velocity?.avg_days_per_stage ?? []
  const avgDays = velocity?.avg_days_to_close ?? 0

  const totalDeals =
    (funnel?.pipeline ?? 0) +
    (funnel?.engaged ?? 0) +
    (funnel?.active ?? 0) +
    (funnel?.closed_won ?? 0) +
    (funnel?.closed_lost ?? 0)

  const closeRate =
    totalDeals > 0
      ? (((funnel?.closed_won ?? 0) / totalDeals) * 100).toFixed(1)
      : '0'

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
        <ArrowLeft className="h-4 w-4" />
        Reports
      </Button>

      <div className="flex items-center gap-3">
        <Target className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-text-primary">Deal Analysis</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard
          label="Avg. Days to Close"
          value={`${avgDays.toFixed(0)}d`}
          accentColor="border-l-primary"
        />
        <StatsCard
          label="Close Rate"
          value={`${closeRate}%`}
          accentColor="border-l-success"
        />
        <StatsCard
          label="Won"
          value={funnel?.closed_won ?? 0}
          accentColor="border-l-accent-gold"
        />
        <StatsCard
          label="Lost"
          value={funnel?.closed_lost ?? 0}
          accentColor="border-l-danger"
        />
      </div>

      {totalDeals === 0 && velocityStages.length === 0 ? (
        <EmptyState
          icon={<Target className="h-12 w-12" />}
          title="No deal analysis data"
          description="Complete some deals to populate win/loss analysis."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel */}
            <div className="bg-bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Deal Funnel</h2>
              {funnelData.length === 0 ? (
                <div className="flex items-center justify-center h-[320px] text-sm text-text-muted">
                  No funnel data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={funnelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {funnelData.map((_, i) => (
                        <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Stage Velocity */}
            <div className="bg-bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Avg. Days per Stage</h2>
              {velocityStages.length === 0 ? (
                <div className="flex items-center justify-center h-[320px] text-sm text-text-muted">
                  No velocity data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={velocityStages} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis
                      dataKey="stage_name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                    <Bar dataKey="avg_days" name="Avg Days" fill="#00594C" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Stage Velocity Summary</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Stage</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Avg. Days</th>
                </tr>
              </thead>
              <tbody>
                {velocityStages.map((s) => (
                  <tr key={s.stage_name} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{s.stage_name}</td>
                    <td className="px-4 py-3 text-right text-sm text-text-primary">{s.avg_days.toFixed(1)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-text-primary">Total</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-text-primary">
                    {avgDays.toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
