import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plug, Mail, CalendarDays, FolderOpen, Check, Settings, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import apiClient from '@/api/client'

interface IntegrationDef {
  id: string
  name: string
  description: string
  icon: typeof Mail
  color: string
  envVars: string[]
  setupGuide: string
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'email',
    name: 'Email',
    description: 'Connect your email (Gmail, Outlook) to sync communications automatically.',
    icon: Mail,
    color: 'bg-blue-100 text-blue-600',
    envVars: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL'],
    setupGuide: 'Set SMTP environment variables on your deployment to enable email integration. Supports Gmail, Outlook, or any SMTP provider.',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Sync meetings and events with Google Calendar or Outlook Calendar.',
    icon: CalendarDays,
    color: 'bg-green-100 text-green-600',
    envVars: ['MS365_CLIENT_ID', 'MS365_CLIENT_SECRET', 'MS365_TENANT_ID'],
    setupGuide: 'Configure Microsoft 365 or Google Calendar OAuth credentials. Set the client ID, secret, and tenant ID in your environment.',
  },
  {
    id: 'storage',
    name: 'Cloud Storage',
    description: 'Connect Google Drive, OneDrive, or Dropbox for document management.',
    icon: FolderOpen,
    color: 'bg-purple-100 text-purple-600',
    envVars: ['S3_BUCKET_NAME', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_REGION'],
    setupGuide: 'Configure S3-compatible storage (AWS S3, MinIO, DigitalOcean Spaces) for document uploads. Set bucket name, access key, secret key, and region.',
  },
]

export default function IntegrationsConfig() {
  const navigate = useNavigate()
  const [configDialog, setConfigDialog] = useState<IntegrationDef | null>(null)
  const [statuses, setStatuses] = useState<Record<string, boolean>>({})
  const [statusLoading, setStatusLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchStatus() {
      try {
        const { data } = await apiClient.get<{ integrations?: Record<string, boolean> }>('/settings/integrations-status')
        if (!cancelled && data?.integrations) {
          setStatuses(data.integrations)
        }
      } catch {
        // API may not exist yet — fall back to all unconfigured
        if (!cancelled) {
          setStatuses({})
        }
      } finally {
        if (!cancelled) setStatusLoading(false)
      }
    }
    fetchStatus()
    return () => { cancelled = true }
  }, [])

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
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon
          const isConnected = statuses[integration.id] ?? false
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
                  {statusLoading ? (
                    <Badge variant="default">Checking...</Badge>
                  ) : isConnected ? (
                    <Badge variant="success">
                      <div className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Configured
                      </div>
                    </Badge>
                  ) : (
                    <Badge variant="default">Not Configured</Badge>
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-1">{integration.description}</p>
              </div>

              <div>
                <Button
                  variant={isConnected ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => setConfigDialog(integration)}
                >
                  {isConnected ? (
                    <>
                      <Settings className="h-4 w-4" />
                      Configure
                    </>
                  ) : (
                    'Setup'
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Configuration Dialog */}
      <Dialog
        open={!!configDialog}
        onClose={() => setConfigDialog(null)}
        title={configDialog ? `${configDialog.name} Integration Setup` : ''}
        size="md"
      >
        {configDialog && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">{configDialog.setupGuide}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">Required Environment Variables</h4>
              <div className="bg-gray-50 border border-border rounded-lg p-4 space-y-2">
                {configDialog.envVars.map((v) => (
                  <div key={v} className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-text-primary">
                      {v}
                    </code>
                    <span className="text-xs text-text-muted">
                      {statuses[configDialog.id] ? 'Set' : 'Not set'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-text-muted">
              These variables must be set in your deployment environment (e.g., Railway, Vercel, or .env file).
              Once configured, the integration will activate automatically on the next server restart.
            </p>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setConfigDialog(null)}>Close</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
