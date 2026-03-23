import { useNavigate } from 'react-router-dom'
import {
  Settings,
  Users,
  GitBranch,
  Mail,
  Bell,
  Plug,
  Shield,
  ArrowRight,
} from 'lucide-react'

const sections = [
  {
    title: 'Team Management',
    description: 'Manage users, roles, and invitations.',
    icon: Users,
    path: '/settings/team',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Pipeline Configuration',
    description: 'Customize stages for sell-side and buy-side pipelines.',
    icon: GitBranch,
    path: '/settings/pipeline',
    color: 'bg-accent-teal/10 text-accent-teal',
  },
  {
    title: 'Email Templates',
    description: 'Create and manage email templates with merge fields.',
    icon: Mail,
    path: '/settings/templates',
    color: 'bg-accent-gold/10 text-accent-gold',
  },
  {
    title: 'Notifications',
    description: 'Configure email and in-app notification preferences.',
    icon: Bell,
    path: '/settings/notifications',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Integrations',
    description: 'Connect email, calendar, and storage services.',
    icon: Plug,
    path: '/settings/integrations',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Audit Log',
    description: 'View all user actions and system events.',
    icon: Shield,
    path: '/settings/audit',
    color: 'bg-amber-100 text-amber-700',
  },
]

export default function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className="bg-bg-card border border-border rounded-lg p-5 text-left hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${section.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mt-3">{section.title}</h3>
              <p className="text-xs text-text-secondary mt-1">{section.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
