import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Phone, Mail, CalendarDays, StickyNote, Activity, FileText } from 'lucide-react'
import { useRecentActivities } from '@/api/hooks/useActivities'
import { useNavigate } from 'react-router-dom'
import type { Activity as ActivityType } from '@/api/types/activity'

const typeIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: CalendarDays,
  note: StickyNote,
  document: FileText,
}

const typeColors: Record<string, string> = {
  call: 'bg-blue-50 text-blue-600',
  email: 'bg-purple-50 text-purple-600',
  meeting: 'bg-emerald-50 text-emerald-600',
  note: 'bg-amber-50 text-amber-600',
  document: 'bg-gray-50 text-gray-500',
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ActivityItem({ activity }: { activity: ActivityType }) {
  const navigate = useNavigate()
  const Icon = typeIcons[activity.type] || Activity
  const colorClass = typeColors[activity.type] || 'bg-gray-50 text-gray-500'

  return (
    <button
      type="button"
      onClick={() => activity.engagement_id && navigate(`/engagements/${activity.engagement_id}`)}
      className="w-full text-left flex items-start gap-3 py-2.5 px-1 hover:bg-gray-50 rounded-md transition-colors group"
    >
      <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary truncate">{activity.subject}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {activity.engagement_codename && (
            <span className="text-xs text-primary font-medium">{activity.engagement_codename}</span>
          )}
          {activity.performed_by_name && (
            <span className="text-xs text-text-muted">{activity.performed_by_name}</span>
          )}
        </div>
      </div>
      <span className="text-xs text-text-muted whitespace-nowrap shrink-0">
        {formatRelativeTime(activity.created_at)}
      </span>
    </button>
  )
}

function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function RecentActivityWidget() {
  const { data, isLoading, isError } = useRecentActivities(20)

  if (isLoading) return <RecentActivitySkeleton />

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-danger">Failed to load activities.</p>
        </CardContent>
      </Card>
    )
  }

  const activities = data?.items ?? []

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-80">
        {activities.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-10 w-10" />}
            title="No recent activity"
            description="Activity will appear here as your team logs calls, emails, and meetings."
          />
        ) : (
          <div className="divide-y divide-border">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
