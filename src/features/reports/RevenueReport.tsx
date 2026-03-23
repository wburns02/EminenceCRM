import { useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/ui/StatsCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useRevenueReport } from '@/api/hooks/useReports'

const BRAND_COLORS = ['#00594C', '#C9A84C', '#4ECDC4', '#003D2E']

export default function RevenueReport() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useRevenueReport()

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
          Reports
        </Button>
        <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-danger">Failed to load revenue report.</p>
        </div>
      </div>
    )
  }

  const barData = [
    { name: 'Retainer', value: data.retainer_collected / 100 },
    { name: 'Success Fees', value: data.success_fees_earned / 100 },
    { name: 'Total YTD', value: data.fees_earned_ytd / 100 },
    { name: 'Projected', value: data.fees_projected / 100 },
  ]

  const pieData = [
    { name: 'Retainer', value: data.retainer_collected / 100 },
    { name: 'Success Fees', value: data.success_fees_earned / 100 },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
        <ArrowLeft className="h-4 w-4" />
        Reports
      </Button>

      <div className="flex items-center gap-3">
        <DollarSign className="h-6 w-6 text-accent-gold" />
        <h1 className="text-2xl font-bold text-text-primary">Revenue Report</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard
          label="Fees Earned YTD"
          value={fmt(data.fees_earned_ytd / 100)}
          icon={<DollarSign className="h-5 w-5" />}
          accentColor="border-l-accent-gold"
        />
        <StatsCard
          label="Projected Fees"
          value={fmt(data.fees_projected / 100)}
          accentColor="border-l-primary"
        />
        <StatsCard
          label="Retainer Collected"
          value={fmt(data.retainer_collected / 100)}
          accentColor="border-l-accent-teal"
        />
        <StatsCard
          label="Success Fees"
          value={fmt(data.success_fees_earned / 100)}
          accentColor="border-l-success"
        />
      </div>

      {data.fees_earned_ytd === 0 && data.fees_projected === 0 ? (
        <EmptyState
          icon={<DollarSign className="h-12 w-12" />}
          title="No revenue data"
          description="Record fees on engagements to populate this report."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Revenue Breakdown</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  formatter={(v) => fmt(Number(v))}
                />
                <Legend />
                <Bar dataKey="value" name="Amount" fill="#00594C" radius={[4, 4, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Fee Composition</h2>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-[320px] text-sm text-text-muted">
                No fee data to display.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${fmt(entry.value)}`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                    formatter={(v) => fmt(Number(v))}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
