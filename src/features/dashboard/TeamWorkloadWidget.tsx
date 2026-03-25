import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Users } from 'lucide-react'
import { useTeamReport } from '@/api/hooks/useReports'
import type { TeamMember } from '@/api/types/report'

function WorkloadBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function MemberRow({ member, maxDeals }: { member: TeamMember; maxDeals: number }) {
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <span className="text-sm font-medium text-text-primary truncate">{member.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-text-muted">{member.active_deals} deals</span>
          {member.overdue_tasks > 0 && (
            <Badge variant="danger" className="text-[10px]">{member.overdue_tasks} overdue</Badge>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-text-muted">Deals</span>
            <span className="text-[10px] text-text-muted">{member.active_deals}</span>
          </div>
          <WorkloadBar value={member.active_deals} max={maxDeals} color="bg-primary" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-text-muted">Activities/wk</span>
            <span className="text-[10px] text-text-muted">{member.activities_this_week}</span>
          </div>
          <WorkloadBar value={member.activities_this_week} max={20} color="bg-accent-teal" />
        </div>
      </div>
    </div>
  )
}

function TeamWorkloadSkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function TeamWorkloadWidget() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useTeamReport()

  if (isLoading) return <TeamWorkloadSkeleton />

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>Team Workload</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-danger">Failed to load team data.</p>
        </CardContent>
      </Card>
    )
  }

  const members = data?.members ?? []
  const maxDeals = Math.max(...members.map((m) => m.active_deals), 1)

  return (
    <Card className="flex flex-col">
      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => navigate('/settings/team')}>
        <CardTitle>Team Workload</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-80">
        {members.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No team data"
            description="Team workload will display once team members are assigned to deals."
          />
        ) : (
          <div className="divide-y divide-border">
            {members.map((member) => (
              <MemberRow key={member.name} member={member} maxDeals={maxDeals} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
