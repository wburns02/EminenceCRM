import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Lock, Clock } from 'lucide-react'
import type { Engagement } from '@/api/types/engagement'

function formatEV(value: number | null | undefined): string {
  if (value == null) return '?'
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName ?? '')[0] ?? ''}${(lastName ?? '')[0] ?? ''}`.toUpperCase()
}

function daysInStage(createdAt: string): number {
  const now = new Date()
  const created = new Date(createdAt)
  return Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
}

interface DealCardProps {
  engagement: Engagement
  isDragging?: boolean
}

export default function DealCard({ engagement, isDragging }: DealCardProps) {
  const navigate = useNavigate()
  const stageColor = engagement.stage?.color ?? '#00594C'
  const evLow = formatEV(engagement.enterprise_value_low)
  const evHigh = formatEV(engagement.enterprise_value_high)
  const evRange = engagement.enterprise_value_low || engagement.enterprise_value_high
    ? `${evLow} - ${evHigh}`
    : null
  const advisor = engagement.lead_advisor
  const initials = advisor ? getInitials(advisor.first_name, advisor.last_name) : null
  const days = daysInStage(engagement.engagement_date ?? engagement.created_at)

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate while dragging
    if (isDragging) return
    e.stopPropagation()
    navigate(`/engagements/${engagement.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'bg-white rounded-lg border border-border p-3 cursor-pointer transition-shadow',
        'hover:shadow-md',
        isDragging && 'shadow-lg ring-2 ring-primary/20 opacity-90'
      )}
      style={{ borderLeftWidth: '3px', borderLeftColor: stageColor }}
    >
      {/* Codename */}
      <div className="flex items-center gap-1.5 mb-1">
        <Lock className="h-3 w-3 text-text-muted flex-shrink-0" />
        <span className="text-sm font-semibold text-text-primary truncate">
          {engagement.codename ?? engagement.name}
        </span>
      </div>

      {/* Company name */}
      <p className="text-xs text-text-secondary truncate mb-2">
        {engagement.company?.name ?? engagement.name}
      </p>

      {/* EV range + industry */}
      <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-2">
        {evRange && <span className="font-medium">{evRange}</span>}
        {evRange && engagement.industry && <span>&middot;</span>}
        {engagement.industry && (
          <span className="bg-gray-100 text-text-secondary px-1.5 py-0.5 rounded text-[10px] font-medium truncate">
            {engagement.industry}
          </span>
        )}
      </div>

      {/* Advisor initials + days in stage */}
      <div className="flex items-center justify-between">
        {initials ? (
          <div
            className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ backgroundColor: stageColor }}
            title={`${advisor?.first_name} ${advisor?.last_name}`}
          >
            {initials}
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          <Clock className="h-3 w-3" />
          <span>{days}d</span>
        </div>
      </div>
    </div>
  )
}
