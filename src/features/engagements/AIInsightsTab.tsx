import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Sparkles,
  Brain,
  Target,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import {
  useEngagementAIAlerts,
  useGenerateDealSummary,
  useScoreBuyers,
} from '@/api/hooks/useAI'
import type { AIAlert } from '@/api/types/ai'

const typeIcons: Record<string, typeof Sparkles> = {
  insight: Sparkles,
  recommendation: Target,
  warning: Brain,
  opportunity: Target,
}

const typeColors: Record<string, string> = {
  insight: 'bg-blue-100 text-blue-700',
  recommendation: 'bg-purple-100 text-purple-700',
  warning: 'bg-amber-100 text-amber-700',
  opportunity: 'bg-green-100 text-green-700',
}

const priorityBadgeVariant: Record<string, 'danger' | 'warning' | 'default'> = {
  high: 'danger',
  medium: 'warning',
  low: 'default',
}

interface AIInsightsTabProps {
  engagementId: string
}

export default function AIInsightsTab({ engagementId }: AIInsightsTabProps) {
  const { data: alerts = [], isLoading } = useEngagementAIAlerts(engagementId)
  const generateSummary = useGenerateDealSummary()
  const scoreBuyers = useScoreBuyers()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [dealSummary, setDealSummary] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleGenerateSummary = () => {
    generateSummary.mutate(engagementId, {
      onSuccess: (data) => {
        setDealSummary(data.summary)
      },
    })
  }

  const handleScoreBuyers = () => {
    scoreBuyers.mutate(engagementId)
  }

  const activeAlerts = alerts.filter((a: AIAlert) => !a.dismissed)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleGenerateSummary}
          loading={generateSummary.isPending}
          variant="outline"
        >
          <Sparkles className="h-4 w-4" />
          Generate Summary
        </Button>
        <Button
          onClick={handleScoreBuyers}
          loading={scoreBuyers.isPending}
          variant="outline"
        >
          <Target className="h-4 w-4" />
          Score Buyers
        </Button>
      </div>

      {/* Deal summary if generated */}
      {dealSummary && (
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  AI Deal Summary
                </h3>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {dealSummary}
                </p>
              </div>
              <button
                onClick={() => setDealSummary(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-text-muted" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Alerts list */}
      {activeAlerts.length === 0 && !dealSummary ? (
        <EmptyState
          icon={<Brain className="h-12 w-12" />}
          title="No AI insights"
          description="Generate a deal summary or score buyers to get AI-powered insights"
        />
      ) : (
        <div className="space-y-3">
          {activeAlerts.map((alert: AIAlert) => {
            const Icon = typeIcons[alert.type ?? 'insight'] ?? Sparkles
            const colorClass = typeColors[alert.type ?? 'insight'] ?? 'bg-gray-100 text-gray-600'
            const isExpanded = expandedIds.has(alert.id)

            return (
              <Card key={alert.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center',
                        colorClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-text-primary">
                          {alert.title}
                        </h4>
                        {alert.type && (
                          <Badge variant="default">
                            {alert.type}
                          </Badge>
                        )}
                        {alert.priority && (
                          <Badge variant={priorityBadgeVariant[alert.priority] ?? 'default'}>
                            {alert.priority}
                          </Badge>
                        )}
                      </div>

                      <p
                        className={cn(
                          'text-sm text-text-secondary',
                          !isExpanded && 'line-clamp-2'
                        )}
                      >
                        {alert.content}
                      </p>

                      {alert.content.length > 200 && (
                        <button
                          onClick={() => toggleExpanded(alert.id)}
                          className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              Show more
                            </>
                          )}
                        </button>
                      )}

                      {alert.created_at && (
                        <div className="text-xs text-text-muted mt-2">
                          {formatDate(alert.created_at)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
