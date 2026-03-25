import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import {
  Phone,
  Mail,
  Users,
  StickyNote,
  Settings,
  Calendar,
  MessageSquare,
  Pencil,
} from 'lucide-react'
import type { Activity } from '@/api/types/activity'

const typeIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: StickyNote,
  system: Settings,
  task: Calendar,
}

const typeColors: Record<string, string> = {
  call: 'bg-blue-100 text-blue-600',
  email: 'bg-purple-100 text-purple-600',
  meeting: 'bg-green-100 text-green-600',
  note: 'bg-amber-100 text-amber-600',
  system: 'bg-gray-100 text-gray-500',
  task: 'bg-teal-100 text-teal-600',
}

const SYSTEM_TYPES = new Set(['system', 'stage_change', 'task_completed', 'buyer_status_change', 'document_shared', 'document_uploaded'])

interface ActivityTimelineProps {
  activities: Activity[]
  className?: string
  onEdit?: (activity: Activity) => void
}

export default function ActivityTimeline({ activities, className, onEdit }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-text-muted">
        No activities recorded yet.
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Vertical timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = typeIcons[activity.type] ?? MessageSquare
          const colorClass = typeColors[activity.type] ?? 'bg-gray-100 text-gray-500'

          const isEditable = onEdit && !SYSTEM_TYPES.has(activity.type)

          return (
            <div
              key={activity.id}
              className={cn(
                'flex gap-4 relative rounded-lg px-1 -mx-1 transition-colors',
                isEditable && 'cursor-pointer hover:bg-gray-50'
              )}
              onClick={() => isEditable && onEdit(activity)}
              role={isEditable ? 'button' : undefined}
              tabIndex={isEditable ? 0 : undefined}
              onKeyDown={isEditable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onEdit!(activity) } : undefined}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center z-10',
                  colorClass
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-text-primary">
                    {activity.subject}
                  </span>
                  <span className="text-xs text-text-muted capitalize bg-gray-50 px-1.5 py-0.5 rounded">
                    {activity.type}
                  </span>
                  {isEditable && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit!(activity) }}
                      className="p-0.5 rounded hover:bg-gray-100 transition-colors ml-auto"
                      title="Edit activity"
                    >
                      <Pencil className="h-3 w-3 text-text-muted" />
                    </button>
                  )}
                </div>

                {activity.description && (
                  <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
                    {activity.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  {activity.performed_by_name && (
                    <span>{activity.performed_by_name}</span>
                  )}
                  <span>{formatDate(activity.created_at)}</span>
                  {activity.contact_name && (
                    <span className="text-primary">{activity.contact_name}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
