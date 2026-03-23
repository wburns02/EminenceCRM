import { cn } from '@/lib/utils'

type EngagementStatus = 'prospect' | 'active' | 'due_diligence' | 'negotiation' | 'closed_won' | 'closed_lost' | 'on_hold'
type BuyerStatus = 'interested' | 'engaged' | 'due_diligence' | 'offer_made' | 'passed' | 'won'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

const engagementStatusColors: Record<EngagementStatus, string> = {
  prospect: 'bg-blue-50 text-blue-700 border-blue-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  due_diligence: 'bg-amber-50 text-amber-700 border-amber-200',
  negotiation: 'bg-purple-50 text-purple-700 border-purple-200',
  closed_won: 'bg-success/10 text-success border-success/30',
  closed_lost: 'bg-gray-50 text-gray-500 border-gray-200',
  on_hold: 'bg-orange-50 text-orange-700 border-orange-200',
}

const engagementStatusLabels: Record<EngagementStatus, string> = {
  prospect: 'Prospect',
  active: 'Active',
  due_diligence: 'Due Diligence',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
  on_hold: 'On Hold',
}

const buyerStatusColors: Record<BuyerStatus, string> = {
  interested: 'bg-blue-50 text-blue-700 border-blue-200',
  engaged: 'bg-green-50 text-green-700 border-green-200',
  due_diligence: 'bg-amber-50 text-amber-700 border-amber-200',
  offer_made: 'bg-purple-50 text-purple-700 border-purple-200',
  passed: 'bg-gray-50 text-gray-500 border-gray-200',
  won: 'bg-success/10 text-success border-success/30',
}

const buyerStatusLabels: Record<BuyerStatus, string> = {
  interested: 'Interested',
  engaged: 'Engaged',
  due_diligence: 'Due Diligence',
  offer_made: 'Offer Made',
  passed: 'Passed',
  won: 'Won',
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-50 text-gray-600 border-gray-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-danger/10 text-danger border-danger/30',
}

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

interface StatusBadgeProps {
  className?: string
}

interface EngagementStatusBadgeProps extends StatusBadgeProps {
  status: EngagementStatus
}

interface BuyerStatusBadgeProps extends StatusBadgeProps {
  status: BuyerStatus
}

interface TaskPriorityBadgeProps extends StatusBadgeProps {
  priority: TaskPriority
}

function EngagementStatusBadge({ status, className }: EngagementStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        engagementStatusColors[status],
        className
      )}
    >
      {engagementStatusLabels[status]}
    </span>
  )
}

function BuyerStatusBadge({ status, className }: BuyerStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        buyerStatusColors[status],
        className
      )}
    >
      {buyerStatusLabels[status]}
    </span>
  )
}

function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        priorityColors[priority],
        className
      )}
    >
      {priorityLabels[priority]}
    </span>
  )
}

export { EngagementStatusBadge, BuyerStatusBadge, TaskPriorityBadge }
export type {
  EngagementStatus,
  BuyerStatus,
  TaskPriority,
  EngagementStatusBadgeProps,
  BuyerStatusBadgeProps,
  TaskPriorityBadgeProps,
}
