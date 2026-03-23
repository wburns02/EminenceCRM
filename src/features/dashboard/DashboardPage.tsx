import { LayoutDashboard, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import QuickStatsCards from './QuickStatsCards'
import PipelineSummaryCard from './PipelineSummaryCard'
import MyTasksWidget from './MyTasksWidget'
import RecentActivityWidget from './RecentActivityWidget'
import AIAlertsWidget from './AIAlertsWidget'
import DealVelocityChart from './DealVelocityChart'
import TeamWorkloadWidget from './TeamWorkloadWidget'

export default function DashboardPage() {
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] })
    queryClient.invalidateQueries({ queryKey: ['activities'] })
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    queryClient.invalidateQueries({ queryKey: ['ai'] })
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-sm text-text-secondary">Welcome back. Here is your deal overview.</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats Row */}
      <QuickStatsCards />

      {/* Pipeline + Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineSummaryCard />
        <MyTasksWidget />
      </div>

      {/* Activity + AI Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityWidget />
        <AIAlertsWidget />
      </div>

      {/* Velocity + Team Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealVelocityChart />
        <TeamWorkloadWidget />
      </div>
    </div>
  )
}
