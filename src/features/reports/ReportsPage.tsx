import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowRight,
} from 'lucide-react'

const reports = [
  {
    title: 'Pipeline Report',
    description: 'Deal count and value by stage, advisor, and industry.',
    icon: BarChart3,
    path: '/reports/pipeline',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Revenue Report',
    description: 'Fees earned YTD, projected fees, retainer collected.',
    icon: DollarSign,
    path: '/reports/revenue',
    color: 'bg-accent-gold/10 text-accent-gold',
  },
  {
    title: 'Team Performance',
    description: 'Deals, tasks, and activities per team member.',
    icon: Users,
    path: '/reports/team',
    color: 'bg-accent-teal/10 text-accent-teal',
  },
  {
    title: 'Deal Analysis',
    description: 'Win/loss analysis, close rate, velocity, time-to-close.',
    icon: Target,
    path: '/reports/deals',
    color: 'bg-purple-100 text-purple-600',
  },
]

export default function ReportsPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <button
              key={report.path}
              onClick={() => navigate(report.path)}
              className="bg-bg-card border border-border rounded-lg p-6 text-left hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mt-4">{report.title}</h3>
              <p className="text-sm text-text-secondary mt-1">{report.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
