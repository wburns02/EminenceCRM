import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { useTeamReport } from '@/api/hooks/useReports'

export default function TeamReport() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useTeamReport()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
          Reports
        </Button>
        <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-danger">Failed to load team report.</p>
        </div>
      </div>
    )
  }

  const members = data.members ?? []

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
        <ArrowLeft className="h-4 w-4" />
        Reports
      </Button>

      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-accent-teal" />
        <h1 className="text-2xl font-bold text-text-primary">Team Performance</h1>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No team data"
          description="Team performance data will appear once deals and tasks are assigned."
        />
      ) : (
        <>
          {/* Chart */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Activity Overview</h2>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={members} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                <Legend />
                <Bar dataKey="active_deals" name="Active Deals" fill="#00594C" radius={[0, 4, 4, 0]} />
                <Bar dataKey="open_tasks" name="Open Tasks" fill="#C9A84C" radius={[0, 4, 4, 0]} />
                <Bar dataKey="activities_this_week" name="Activities (Week)" fill="#4ECDC4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Team Member</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase">Active Deals</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase">Open Tasks</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase">Overdue</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase">Activities (Week)</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.name} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-text-primary">{m.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="primary">{m.active_deals}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-text-primary">{m.open_tasks}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={m.overdue_tasks > 0 ? 'danger' : 'success'}>
                        {m.overdue_tasks}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-text-primary">{m.activities_this_week}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
