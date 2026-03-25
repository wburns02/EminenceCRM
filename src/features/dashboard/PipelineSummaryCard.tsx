import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Kanban } from 'lucide-react'
import { usePipelineReport } from '@/api/hooks/useReports'

function formatValue(cents: number): string {
  if (cents >= 100_000_00) return `$${(cents / 100_000_00).toFixed(1)}M`
  if (cents >= 1_000_00) return `$${(cents / 1_000_00).toFixed(0)}K`
  return `$${(cents / 100).toFixed(0)}`
}

function PipelineSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-56 w-full" />
      </CardContent>
    </Card>
  )
}

interface TooltipPayloadItem {
  payload?: { name?: string; deal_count?: number; total_value?: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  if (!data) return null
  return (
    <div className="bg-white border border-border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-text-primary">{data.name}</p>
      <p className="text-text-secondary">{data.deal_count} deals</p>
      <p className="text-text-secondary">{formatValue(data.total_value ?? 0)}</p>
    </div>
  )
}

export default function PipelineSummaryCard() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = usePipelineReport()

  if (isLoading) return <PipelineSummarySkeleton />

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>Pipeline Summary</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-danger">Failed to load pipeline data.</p>
        </CardContent>
      </Card>
    )
  }

  const stages = data?.stages ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => navigate('/pipeline')}>
        <CardTitle>Pipeline Summary</CardTitle>
        <span className="text-sm text-text-secondary">
          {data?.total_deals ?? 0} deals &middot; {formatValue(data?.total_value ?? 0)}
        </span>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <EmptyState
            icon={<Kanban className="h-10 w-10" />}
            title="No pipeline data"
            description="Deals will appear here as they enter the pipeline."
          />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stages} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,89,76,0.04)' }} />
                <Bar dataKey="total_value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {stages.map((stage, i) => (
                    <Cell key={i} fill={stage.color || '#00594C'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
