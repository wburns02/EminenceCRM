import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plug, Mail, CalendarDays, FolderOpen, Check, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const integrations = [
  {
    id: 'email',
    name: 'Email',
    description: 'Connect your email (Gmail, Outlook) to sync communications automatically.',
    icon: Mail,
    connected: false,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Sync meetings and events with Google Calendar or Outlook Calendar.',
    icon: CalendarDays,
    connected: false,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'storage',
    name: 'Cloud Storage',
    description: 'Connect Google Drive, OneDrive, or Dropbox for document management.',
    icon: FolderOpen,
    connected: false,
    color: 'bg-purple-100 text-purple-600',
  },
]

export default function IntegrationsConfig() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
        <ArrowLeft className="h-4 w-4" />
        Settings
      </Button>

      <div className="flex items-center gap-3">
        <Plug className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-text-primary">Integrations</h1>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <div
              key={integration.id}
              className="bg-bg-card border border-border rounded-lg p-6 flex items-start gap-4"
            >
              <div className={`p-3 rounded-lg ${integration.color}`}>
                <Icon className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-text-primary">{integration.name}</h3>
                  {integration.connected ? (
                    <Badge variant="success">
                      <div className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Connected
                      </div>
                    </Badge>
                  ) : (
                    <Badge variant="default">Not Connected</Badge>
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-1">{integration.description}</p>
              </div>

              <div>
                {integration.connected ? (
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                    Configure
                  </Button>
                ) : (
                  <Button variant="primary" size="sm">
                    Connect
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
