import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { CheckSquare, AlertTriangle, Clock, Calendar } from 'lucide-react'
import { useMyTasks } from '@/api/hooks/useTasks'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/api/types/task'
import { useNavigate } from 'react-router-dom'

function TaskItem({ task, variant }: { task: Task; variant: 'overdue' | 'today' | 'upcoming' }) {
  const navigate = useNavigate()
  const colors = {
    overdue: { border: 'border-l-danger', badge: 'danger' as const, icon: AlertTriangle },
    today: { border: 'border-l-accent-gold', badge: 'warning' as const, icon: Clock },
    upcoming: { border: 'border-l-gray-300', badge: 'default' as const, icon: Calendar },
  }
  const config = colors[variant]
  const Icon = config.icon

  return (
    <button
      type="button"
      onClick={() => task.engagement_id && navigate(`/engagements/${task.engagement_id}`)}
      className={`w-full text-left border-l-[3px] ${config.border} pl-3 py-2 hover:bg-gray-50 rounded-r-md transition-colors`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <Icon className="h-4 w-4 mt-0.5 shrink-0 text-text-muted" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{task.title}</p>
            {task.engagement_codename && (
              <p className="text-xs text-text-muted truncate">{task.engagement_codename}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {task.due_date && (
            <span className="text-xs text-text-muted whitespace-nowrap">{formatDate(task.due_date)}</span>
          )}
          <Badge variant={config.badge} className="text-[10px]">{variant}</Badge>
        </div>
      </div>
    </button>
  )
}

function MyTasksSkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-l-[3px] border-l-gray-200 pl-3 py-2">
            <SkeletonText lines={2} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function MyTasksWidget() {
  const { data, isLoading, isError } = useMyTasks()

  if (isLoading) return <MyTasksSkeleton />

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>My Tasks</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-danger">Failed to load tasks.</p>
        </CardContent>
      </Card>
    )
  }

  const overdue = data?.overdue ?? []
  const today = data?.today ?? []
  const upcoming = data?.upcoming ?? []
  const allTasks = [
    ...overdue.map((t) => ({ task: t, variant: 'overdue' as const })),
    ...today.map((t) => ({ task: t, variant: 'today' as const })),
    ...upcoming.slice(0, 5).map((t) => ({ task: t, variant: 'upcoming' as const })),
  ]

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Tasks</CardTitle>
        {overdue.length > 0 && (
          <Badge variant="danger">{overdue.length} overdue</Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-80">
        {allTasks.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="h-10 w-10" />}
            title="All caught up!"
            description="No pending tasks right now."
          />
        ) : (
          <div className="space-y-1">
            {allTasks.map(({ task, variant }) => (
              <TaskItem key={task.id} task={task} variant={variant} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
