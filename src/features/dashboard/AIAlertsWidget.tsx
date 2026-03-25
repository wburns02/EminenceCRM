import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Brain, X, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react'
import { useAIAlerts } from '@/api/hooks/useAI'
import type { AIAlert } from '@/api/types/ai'

const alertIcons: Record<string, typeof Brain> = {
  insight: Lightbulb,
  warning: AlertTriangle,
  recommendation: Brain,
  opportunity: TrendingUp,
}

const alertBadgeVariant: Record<string, 'primary' | 'warning' | 'success' | 'danger'> = {
  insight: 'primary',
  warning: 'warning',
  recommendation: 'success',
  opportunity: 'primary',
}

function AlertItem({ alert, onDismiss }: { alert: AIAlert; onDismiss: (id: string) => void }) {
  const Icon = alertIcons[alert.type ?? 'recommendation'] || Brain
  const badgeVariant = alertBadgeVariant[alert.type ?? 'recommendation'] || 'primary'

  return (
    <div className="flex items-start gap-3 py-3 px-1 group">
      <div className="p-2 rounded-lg bg-primary/5 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-text-primary truncate">{alert.title}</p>
          {alert.type && (
            <Badge variant={badgeVariant} className="text-[10px] shrink-0">{alert.type}</Badge>
          )}
        </div>
        <p className="text-xs text-text-secondary line-clamp-2">{alert.content}</p>
        {alert.engagement_codename && (
          <p className="text-xs text-primary font-medium mt-1">{alert.engagement_codename}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(alert.id)}
        className="p-1 rounded hover:bg-gray-100 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        title="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function AIAlertsSkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function AIAlertsWidget() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useAIAlerts()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
  }

  if (isLoading) return <AIAlertsSkeleton />

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>AI Insights</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-danger">Failed to load AI insights.</p>
        </CardContent>
      </Card>
    )
  }

  const alerts = (data ?? []).filter((a) => !dismissed.has(a.id))

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => navigate('/ai')}>
        <CardTitle>AI Insights</CardTitle>
        {alerts.length > 0 && (
          <Badge variant="primary">{alerts.length}</Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-80">
        {alerts.length === 0 ? (
          <EmptyState
            icon={<Brain className="h-10 w-10" />}
            title="No insights yet"
            description="AI-powered recommendations will appear here as your deal data grows."
          />
        ) : (
          <div className="divide-y divide-border">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
