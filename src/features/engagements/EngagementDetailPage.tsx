import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { EngagementStatusBadge } from '@/components/ui/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs'
import {
  ArrowLeft,
  Lock,
  Building2,
} from 'lucide-react'
import { useEngagement } from '@/api/hooks/useEngagements'
import { useStages } from '@/api/hooks/useSettings'
import { useMoveEngagementStage } from '@/api/hooks/useEngagements'
import StageProgressBar from '@/components/shared/StageProgressBar'
import OverviewTab from './OverviewTab'
import BuyersTab from './BuyersTab'
import DocumentsTab from './DocumentsTab'
import ActivityTab from './ActivityTab'
import TasksTab from './TasksTab'
import FinancialsTab from './FinancialsTab'
import AIInsightsTab from './AIInsightsTab'
import type { EngagementStatus } from '@/components/ui/StatusBadge'
import type { Stage } from '@/api/types/engagement'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'buyers', label: 'Buyers' },
  { value: 'documents', label: 'Documents' },
  { value: 'activity', label: 'Activity' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'financials', label: 'Financials' },
  { value: 'ai', label: 'AI' },
] as const

export default function EngagementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: engagement, isLoading, error } = useEngagement(id)
  const { data: allStages = [] } = useStages()
  const moveStage = useMoveEngagementStage()

  const activeTab = searchParams.get('tab') ?? 'overview'

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab })
  }

  const handleStageClick = (stage: Stage) => {
    if (!engagement || stage.id === engagement.stage_id) return
    moveStage.mutate({ engagementId: engagement.id, stageId: stage.id })
  }

  // Filter stages by engagement deal type
  const dealStages = engagement
    ? allStages.filter((s) => s.deal_type === engagement.type)
    : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !engagement) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/pipeline')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Pipeline
        </Button>
        <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-text-secondary">
            {error ? 'Failed to load engagement.' : 'Engagement not found.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/pipeline')}>
        <ArrowLeft className="h-4 w-4" />
        Pipeline
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {engagement.codename && (
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-text-muted" />
                <h1 className="text-2xl font-bold text-text-primary">
                  {engagement.codename}
                </h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {engagement.company && (
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Building2 className="h-3.5 w-3.5" />
                {engagement.company.name}
              </div>
            )}
            {!engagement.codename && (
              <span className="text-lg font-semibold text-text-primary">{engagement.name}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {engagement.stage && (
            <Badge
              variant="primary"
              className="text-xs"
              style={{ backgroundColor: `${engagement.stage.color ?? '#00594C'}20`, color: engagement.stage.color ?? '#00594C' } as React.CSSProperties}
            >
              {engagement.stage.name}
            </Badge>
          )}
          <EngagementStatusBadge status={engagement.status as EngagementStatus} />
          <Badge variant={engagement.type === 'sell_side' ? 'primary' : 'warning'}>
            {engagement.type === 'sell_side' ? 'Sell-Side' : 'Buy-Side'}
          </Badge>
        </div>
      </div>

      {/* Stage progress bar */}
      {dealStages.length > 0 && (
        <StageProgressBar
          stages={dealStages}
          currentStageId={engagement.stage_id}
          onStageClick={handleStageClick}
        />
      )}

      {/* Tabs */}
      <Tabs defaultTab={activeTab} onChange={handleTabChange}>
        <TabList>
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tab>
          ))}
        </TabList>

        <TabPanel value="overview">
          <OverviewTab engagement={engagement} />
        </TabPanel>

        <TabPanel value="buyers">
          <BuyersTab engagementId={engagement.id} />
        </TabPanel>

        <TabPanel value="documents">
          <DocumentsTab engagementId={engagement.id} />
        </TabPanel>

        <TabPanel value="activity">
          <ActivityTab engagementId={engagement.id} />
        </TabPanel>

        <TabPanel value="tasks">
          <TasksTab engagementId={engagement.id} />
        </TabPanel>

        <TabPanel value="financials">
          <FinancialsTab engagementId={engagement.id} />
        </TabPanel>

        <TabPanel value="ai">
          <AIInsightsTab engagementId={engagement.id} />
        </TabPanel>
      </Tabs>
    </div>
  )
}
