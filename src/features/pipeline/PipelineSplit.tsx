import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Lock, Clock, Building2, DollarSign, User, Calendar, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EngagementStatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Engagement, Stage } from '@/api/types/engagement'
import type { EngagementStatus } from '@/components/ui/StatusBadge'

function formatEV(value: number | null | undefined): string {
  if (value == null) return '?'
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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface PipelineSplitProps {
  engagements: Engagement[]
  stages: Stage[]
  isLoading: boolean
}

export default function PipelineSplit({ engagements, stages, isLoading }: PipelineSplitProps) {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = engagements.find((e) => e.id === selectedId) ?? null

  // Group by stage for left panel
  const sortedStages = stages.slice().sort((a, b) => a.order_index - b.order_index)

  if (isLoading) {
    return (
      <div className="flex gap-4 min-h-[500px]">
        <div className="w-80 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex-1">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 min-h-[500px]">
      {/* Left panel - deal list grouped by stage */}
      <div className="w-80 flex-shrink-0 border border-border rounded-lg bg-bg-card overflow-y-auto max-h-[calc(100vh-240px)]">
        {sortedStages.map((stage) => {
          const stageDeals = engagements.filter((e) => e.stage_id === stage.id)
          if (stageDeals.length === 0) return null
          return (
            <div key={stage.id}>
              {/* Stage header */}
              <div className="px-3 py-2 bg-gray-50 border-b border-border flex items-center gap-2 sticky top-0 z-10">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stage.color ?? '#00594C' }}
                />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  {stage.name}
                </span>
                <span className="ml-auto text-[10px] text-text-muted">{stageDeals.length}</span>
              </div>
              {/* Deals */}
              {stageDeals.map((deal) => (
                <button
                  key={deal.id}
                  onClick={() => setSelectedId(deal.id)}
                  className={cn(
                    'w-full px-3 py-2.5 text-left border-b border-border last:border-b-0 transition-colors',
                    selectedId === deal.id
                      ? 'bg-primary/5 border-l-2 border-l-primary'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-text-muted flex-shrink-0" />
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {deal.codename ?? deal.name}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary truncate mt-0.5">
                    {deal.company?.name ?? deal.name}
                  </div>
                </button>
              ))}
            </div>
          )
        })}
        {engagements.length === 0 && (
          <div className="p-6 text-center text-sm text-text-muted">
            No engagements to display.
          </div>
        )}
      </div>

      {/* Right panel - detail overview */}
      <div className="flex-1 border border-border rounded-lg bg-bg-card overflow-y-auto max-h-[calc(100vh-240px)]">
        {selected ? (
          <EngagementOverview engagement={selected} onOpenFull={() => navigate(`/engagements/${selected.id}`)} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={<Lock className="h-10 w-10" />}
              title="Select an engagement"
              description="Click a deal on the left to view its details here."
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Mini overview for the right panel
function EngagementOverview({
  engagement,
  onOpenFull,
}: {
  engagement: Engagement
  onOpenFull: () => void
}) {
  const stageColor = engagement.stage?.color ?? '#00594C'
  const evLow = formatEV(engagement.enterprise_value_low)
  const evHigh = formatEV(engagement.enterprise_value_high)
  const days = daysInStage(engagement.engagement_date ?? engagement.created_at)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-4 w-4 text-text-muted" />
            <h2 className="text-xl font-bold text-text-primary">
              {engagement.codename ?? engagement.name}
            </h2>
          </div>
          <p className="text-sm text-text-secondary">{engagement.name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onOpenFull}>
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          Full Detail
        </Button>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-3 mb-6">
        <EngagementStatusBadge status={engagement.status as EngagementStatus} />
        <Badge variant={engagement.type === 'sell_side' ? 'primary' : 'warning'}>
          {engagement.type === 'sell_side' ? 'Sell-Side' : 'Buy-Side'}
        </Badge>
        {engagement.stage && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stageColor }} />
            <span className="text-sm text-text-secondary">{engagement.stage.name}</span>
          </div>
        )}
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-4">
        <DetailItem
          icon={<Building2 className="h-4 w-4" />}
          label="Company"
          value={engagement.company?.name ?? '-'}
        />
        <DetailItem
          icon={<DollarSign className="h-4 w-4" />}
          label="Enterprise Value"
          value={`${evLow} - ${evHigh}`}
        />
        <DetailItem
          icon={<User className="h-4 w-4" />}
          label="Lead Advisor"
          value={
            engagement.lead_advisor
              ? `${engagement.lead_advisor.first_name} ${engagement.lead_advisor.last_name}`
              : '-'
          }
        />
        <DetailItem
          icon={<Clock className="h-4 w-4" />}
          label="Days in Stage"
          value={`${days} days`}
        />
        {engagement.industry && (
          <DetailItem
            icon={<Building2 className="h-4 w-4" />}
            label="Industry"
            value={engagement.industry}
          />
        )}
        {engagement.engagement_date && (
          <DetailItem
            icon={<Calendar className="h-4 w-4" />}
            label="Engagement Date"
            value={formatDate(engagement.engagement_date)}
          />
        )}
      </div>

      {/* Description */}
      {engagement.description && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-text-primary mb-2">Description</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{engagement.description}</p>
        </div>
      )}
    </div>
  )
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-text-muted mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  )
}
