import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Mail, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface NotificationSetting {
  key: string
  label: string
  description: string
  email: boolean
  inApp: boolean
}

const DEFAULT_SETTINGS: NotificationSetting[] = [
  {
    key: 'task_assigned',
    label: 'Task Assigned',
    description: 'When a task is assigned to you.',
    email: true,
    inApp: true,
  },
  {
    key: 'task_due',
    label: 'Task Due',
    description: 'When a task is approaching its due date.',
    email: true,
    inApp: true,
  },
  {
    key: 'deal_stage_change',
    label: 'Deal Stage Change',
    description: 'When a deal moves to a new stage.',
    email: false,
    inApp: true,
  },
  {
    key: 'buyer_status_update',
    label: 'Buyer Status Update',
    description: 'When a buyer interest status changes.',
    email: false,
    inApp: true,
  },
  {
    key: 'document_uploaded',
    label: 'Document Uploaded',
    description: 'When a new document is added to a deal.',
    email: false,
    inApp: true,
  },
  {
    key: 'new_activity',
    label: 'New Activity',
    description: 'When activity is logged on your deals.',
    email: false,
    inApp: true,
  },
  {
    key: 'team_mention',
    label: 'Team Mention',
    description: 'When you are mentioned in a note or comment.',
    email: true,
    inApp: true,
  },
  {
    key: 'deal_closed',
    label: 'Deal Closed',
    description: 'When a deal is closed (won or lost).',
    email: true,
    inApp: true,
  },
  {
    key: 'weekly_summary',
    label: 'Weekly Summary',
    description: 'Weekly digest of your pipeline and tasks.',
    email: true,
    inApp: false,
  },
]

export default function NotificationPrefs() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<NotificationSetting[]>(DEFAULT_SETTINGS)

  const toggleEmail = (key: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, email: !s.email } : s))
    )
  }

  const toggleInApp = (key: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, inApp: !s.inApp } : s))
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
        <ArrowLeft className="h-4 w-4" />
        Settings
      </Button>

      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-text-primary">Notification Preferences</h1>
      </div>

      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-border">
          <div className="flex-1 text-xs font-medium text-text-secondary uppercase">Notification</div>
          <div className="w-24 text-center text-xs font-medium text-text-secondary uppercase flex items-center justify-center gap-1">
            <Mail className="h-3 w-3" />
            Email
          </div>
          <div className="w-24 text-center text-xs font-medium text-text-secondary uppercase flex items-center justify-center gap-1">
            <Monitor className="h-3 w-3" />
            In-App
          </div>
        </div>

        {/* Rows */}
        {settings.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center px-6 py-4 border-b border-border last:border-0 hover:bg-gray-50"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{setting.label}</p>
              <p className="text-xs text-text-muted">{setting.description}</p>
            </div>
            <div className="w-24 flex justify-center">
              <button
                onClick={() => toggleEmail(setting.key)}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  setting.email ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    setting.email ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="w-24 flex justify-center">
              <button
                onClick={() => toggleInApp(setting.key)}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  setting.inApp ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    setting.inApp ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button>Save Preferences</Button>
      </div>
    </div>
  )
}
