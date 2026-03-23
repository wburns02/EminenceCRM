import { useMemo } from 'react'
import PipelineBoard from '@/components/shared/PipelineBoard'
import type { BoardColumn, BoardItem } from '@/components/shared/PipelineBoard'
import DealCard from './DealCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Kanban } from 'lucide-react'
import type { Engagement, Stage } from '@/api/types/engagement'

interface EngagementBoardItem extends BoardItem {
  engagement: Engagement
}

interface PipelineKanbanProps {
  engagements: Engagement[]
  stages: Stage[]
  isLoading: boolean
  onMoveStage: (engagementId: string, stageId: string) => void
}

export default function PipelineKanban({ engagements, stages, isLoading, onMoveStage }: PipelineKanbanProps) {
  const columns: BoardColumn[] = useMemo(
    () =>
      stages
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((s) => ({
          id: s.id,
          title: s.name,
          color: s.color ?? '#00594C',
        })),
    [stages]
  )

  const boardItems: EngagementBoardItem[] = useMemo(
    () =>
      engagements
        .filter((e) => e.stage_id)
        .map((e) => ({
          id: e.id,
          columnId: e.stage_id!,
          engagement: e,
        })),
    [engagements]
  )

  const handleMove = (itemId: string, _fromColumnId: string, toColumnId: string) => {
    onMoveStage(itemId, toColumnId)
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0 w-72 space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (columns.length === 0) {
    return (
      <EmptyState
        icon={<Kanban className="h-10 w-10" />}
        title="No pipeline stages"
        description="Configure pipeline stages in Settings to get started."
      />
    )
  }

  return (
    <PipelineBoard
      columns={columns}
      items={boardItems}
      onMove={handleMove}
      renderItem={(item, isDragging) => (
        <DealCard engagement={item.engagement} isDragging={isDragging} />
      )}
      className="min-h-[400px]"
    />
  )
}
