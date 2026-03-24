import { useState, useCallback } from 'react'
import { Kanban, List, Columns, Plus, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { SearchInput } from '@/components/ui/SearchInput'
import { useEngagements } from '@/api/hooks/useEngagements'
import { useStages } from '@/api/hooks/useSettings'
import { useMoveEngagementStage } from '@/api/hooks/useEngagements'
import PipelineKanban from './PipelineKanban'
import PipelineList from './PipelineList'
import PipelineSplit from './PipelineSplit'
import NewEngagementForm from './NewEngagementForm'

type ViewMode = 'kanban' | 'list' | 'split'

const viewOptions: { key: ViewMode; label: string; icon: typeof Kanban }[] = [
  { key: 'kanban', label: 'Kanban', icon: Kanban },
  { key: 'list', label: 'List', icon: List },
  { key: 'split', label: 'Split', icon: Columns },
]

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const [view, setView] = useState<ViewMode>('kanban')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)

  const { data: engagementsData, isLoading: engagementsLoading } = useEngagements({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
  })

  const { data: allStages, isLoading: stagesLoading } = useStages()
  const moveStageMutation = useMoveEngagementStage()

  const engagements = engagementsData?.items ?? []
  const isLoading = engagementsLoading || stagesLoading

  // Filter stages by selected deal type (default to sell_side for kanban)
  const filteredStages = (allStages ?? []).filter((s) => {
    if (typeFilter === 'sell_side') return s.deal_type === 'sell_side'
    if (typeFilter === 'buy_side') return s.deal_type === 'buy_side'
    // "All Types" — show sell_side stages by default (most common), but include all engagements
    return s.deal_type === 'sell_side'
  })

  const handleMoveStage = useCallback(
    (engagementId: string, stageId: string) => {
      moveStageMutation.mutate(
        { engagementId, stageId },
        {
          onError: () => {
            // Refetch to revert optimistic UI
            queryClient.invalidateQueries({ queryKey: ['engagements'] })
          },
        }
      )
    },
    [moveStageMutation, queryClient]
  )

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['engagements'] })
    queryClient.invalidateQueries({ queryKey: ['settings', 'stages'] })
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Kanban className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Deal Pipeline</h1>
            <p className="text-sm text-text-secondary">
              {engagementsData?.total ?? 0} engagements
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Engagement
          </Button>
        </div>
      </div>

      {/* Filter bar + view switcher */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {viewOptions.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.key}
                onClick={() => setView(opt.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors',
                  view === opt.key
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-secondary hover:bg-gray-50'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Type filter */}
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-36"
        >
          <option value="all">All Types</option>
          <option value="sell_side">Sell-Side</option>
          <option value="buy_side">Buy-Side</option>
        </Select>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="all">All Statuses</option>
          <option value="pipeline">Pipeline</option>
          <option value="engaged">Engaged</option>
          <option value="active">Active</option>
          <option value="closed_won">Closed Won</option>
          <option value="closed_lost">Closed Lost</option>
          <option value="on_hold">On Hold</option>
        </Select>

        {/* Search */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search deals..."
          className="w-64"
        />
      </div>

      {/* Pipeline view */}
      {view === 'kanban' && (
        <PipelineKanban
          engagements={engagements}
          stages={filteredStages}
          isLoading={isLoading}
          onMoveStage={handleMoveStage}
        />
      )}
      {view === 'list' && (
        <PipelineList
          engagements={engagements}
          isLoading={isLoading}
        />
      )}
      {view === 'split' && (
        <PipelineSplit
          engagements={engagements}
          stages={filteredStages}
          isLoading={isLoading}
        />
      )}

      {/* New engagement dialog */}
      <NewEngagementForm open={showNewForm} onClose={() => setShowNewForm(false)} />
    </div>
  )
}
