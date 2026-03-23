import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Timer } from 'lucide-react'
import { useVelocityReport } from '@/api/hooks/useReports'

function VelocitySkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
      <CardContent>
        <Skeleton className="h-56 w-full" />
      </CardContent>
    </Card>
  )
}

interface TooltipPayloadItem {
  payload?: { stage_name?: string; avg_days?: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  if (!data) return null
  return (
    <div className="bg-white border border-border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-text-primary">{data.stage_name}</p>
      <p className="text-text-secondary">{data.avg_days?.toFixed(1)} avg days</p>
    </div>
  )
}

export default function DealVelocityChart() {
  const { data, isLoading, isError } = useVelocityReport()

  if (isLoading) return <VelocitySkeleton />

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>Deal Velocity</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-danger">Failed to load velocity data.</p>
        </CardContent>
      </Card>
    )
  }

  const stages = data?.avg_days_per_stage ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Deal Velocity</CardTitle>
        <span className="text-sm text-text-secondary">
          Avg. close: <strong className="text-text-primary">{data?.avg_days_to_close?.toFixed(0) ?? '---'} days</strong>
        </span>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <EmptyState
            icon={<Timer className="h-10 w-10" />}
            title="No velocity data"
            description="Velocity metrics will populate as deals move through stages."
          />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stages} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="stage_name"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,89,76,0.04)' }} />
                <Bar
                  dataKey="avg_days"
                  fill="#4ECDC4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
