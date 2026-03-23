import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/ui/StatsCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePipelineReport } from '@/api/hooks/useReports'

const BRAND_COLORS = ['#00594C', '#C9A84C', '#4ECDC4', '#003D2E', '#007A5E', '#10B981', '#F59E0B']

export default function PipelineReport() {
  const navigate = useNavigate()
  const { data, isLoading, error } = usePipelineReport()

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

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
          Reports
        </Button>
        <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-danger">Failed to load pipeline report.</p>
        </div>
      </div>
    )
  }

  const stages = data?.stages ?? []
  const totalDeals = data?.total_deals ?? 0
  const totalValue = data?.total_value ?? 0

  const chartData = stages.map((s) => ({
    name: s.name,
    deals: s.deal_count,
    value: s.total_value / 100,
    color: s.color || '#00594C',
  }))

  const formatValue = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
        <ArrowLeft className="h-4 w-4" />
        Reports
      </Button>

      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Pipeline Report</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="Total Deals" value={totalDeals} accentColor="border-l-primary" />
        <StatsCard label="Total Pipeline Value" value={formatValue(totalValue / 100)} accentColor="border-l-accent-gold" />
        <StatsCard label="Stages" value={stages.length} accentColor="border-l-accent-teal" />
      </div>

      {stages.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="No pipeline data"
          description="Create engagements to populate the pipeline report."
        />
      ) : (
        <>
          {/* Deal Count by Stage */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Deals by Stage</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
                <Bar dataKey="deals" name="Deals" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Value by Stage */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Value by Stage</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  formatter={(v) => formatValue(Number(v))}
                />
                <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={BRAND_COLORS[(i + 1) % BRAND_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stage Table */}
          <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Stage</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Deals</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Value</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">% of Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((s) => (
                  <tr key={s.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: s.color || '#00594C' }}
                        />
                        <span className="text-sm font-medium text-text-primary">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-text-primary">{s.deal_count}</td>
                    <td className="px-4 py-3 text-right text-sm text-text-primary">{formatValue(s.total_value / 100)}</td>
                    <td className="px-4 py-3 text-right text-sm text-text-muted">
                      {totalDeals > 0 ? ((s.deal_count / totalDeals) * 100).toFixed(0) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
