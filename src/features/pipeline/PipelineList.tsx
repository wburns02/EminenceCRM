import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/ui/DataTable'
import type { Column } from '@/components/ui/DataTable'
import { EngagementStatusBadge } from '@/components/ui/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Engagement } from '@/api/types/engagement'
import type { EngagementStatus } from '@/components/ui/StatusBadge'

function formatEV(value: number | null | undefined): string {
  if (value == null) return '-'
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

function daysInStage(createdAt: string): number {
  const now = new Date()
  const created = new Date(createdAt)
  return Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
}

interface PipelineListProps {
  engagements: Engagement[]
  isLoading: boolean
}

// Bridge type so DataTable row[key] access works
type EngagementRow = Engagement & Record<string, unknown>

const columns: Column<EngagementRow>[] = [
  {
    key: 'codename',
    label: 'Codename',
    sortable: true,
    render: (row) => (
      <span className="font-semibold text-text-primary">{row.codename ?? row.name}</span>
    ),
  },
  {
    key: 'company',
    label: 'Company',
    sortable: true,
    render: (row) => (
      <span className="text-text-secondary">{row.company?.name ?? '-'}</span>
    ),
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    render: (row) => (
      <Badge variant={row.type === 'sell_side' ? 'primary' : 'warning'}>
        {row.type === 'sell_side' ? 'Sell-Side' : 'Buy-Side'}
      </Badge>
    ),
  },
  {
    key: 'stage',
    label: 'Stage',
    sortable: true,
    render: (row) => {
      if (!row.stage) return <span className="text-text-muted">-</span>
      return (
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: row.stage.color ?? '#00594C' }}
          />
          <span className="text-sm">{row.stage.name}</span>
        </div>
      )
    },
  },
  {
    key: 'ev_range',
    label: 'EV Range',
    sortable: true,
    render: (row) => {
      const low = formatEV(row.enterprise_value_low)
      const high = formatEV(row.enterprise_value_high)
      if (low === '-' && high === '-') return <span className="text-text-muted">-</span>
      return <span className="text-sm">{low} - {high}</span>
    },
  },
  {
    key: 'lead_advisor',
    label: 'Lead Advisor',
    sortable: true,
    render: (row) => {
      if (!row.lead_advisor) return <span className="text-text-muted">-</span>
      return <span className="text-sm">{row.lead_advisor.first_name} {row.lead_advisor.last_name}</span>
    },
  },
  {
    key: 'days',
    label: 'Days',
    sortable: true,
    width: '80px',
    render: (row) => (
      <span className="text-sm text-text-secondary">
        {daysInStage(row.engagement_date ?? row.created_at)}d
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (row) => (
      <EngagementStatusBadge status={row.status as EngagementStatus} />
    ),
  },
]

export default function PipelineList({ engagements, isLoading }: PipelineListProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
      <DataTable
        columns={columns}
        data={engagements as EngagementRow[]}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => navigate(`/engagements/${row.id}`)}
        emptyMessage="No engagements found"
      />
    </div>
  )
}
