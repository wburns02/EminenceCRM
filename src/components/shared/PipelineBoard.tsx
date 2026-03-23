import { useState, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

// ---------- Types ----------
export interface BoardColumn {
  id: string
  title: string
  color?: string
}

export interface BoardItem {
  id: string
  columnId: string
}

interface PipelineBoardProps<T extends BoardItem> {
  columns: BoardColumn[]
  items: T[]
  onMove: (itemId: string, fromColumnId: string, toColumnId: string) => void
  renderItem: (item: T, isDragging: boolean) => ReactNode
  renderOverlay?: (item: T) => ReactNode
  className?: string
}

// ---------- Droppable Column ----------
function DroppableColumn({
  column,
  count,
  children,
}: {
  column: BoardColumn
  count: number
  children: ReactNode
}) {
  const { isOver, setNodeRef } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-72 bg-gray-50/80 rounded-xl flex flex-col max-h-full',
        isOver && 'ring-2 ring-primary/30 bg-primary/5'
      )}
    >
      {/* Column header */}
      <div className="px-3 py-2.5 flex items-center gap-2 border-b border-border/50">
        <span
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: column.color ?? '#00594C' }}
        />
        <span className="text-sm font-semibold text-text-primary truncate">{column.title}</span>
        <span className="ml-auto text-xs font-medium text-text-muted bg-white border border-border rounded-full px-2 py-0.5">
          {count}
        </span>
      </div>
      {/* Cards container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
        {children}
      </div>
    </div>
  )
}

// ---------- Draggable Wrapper ----------
function DraggableItem<T extends BoardItem>({
  item,
  renderItem,
}: {
  item: T
  renderItem: (item: T, isDragging: boolean) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { columnId: item.columnId },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(isDragging && 'opacity-30')}
    >
      {renderItem(item, false)}
    </div>
  )
}

// ---------- Main Board ----------
export default function PipelineBoard<T extends BoardItem>({
  columns,
  items,
  onMove,
  renderItem,
  renderOverlay,
  className,
}: PipelineBoardProps<T>) {
  const [activeItem, setActiveItem] = useState<T | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    const item = items.find((i) => i.id === event.active.id)
    if (item) setActiveItem(item)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null)
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as { columnId?: string } | undefined
    const fromColumnId = activeData?.columnId
    // over.id is the column id (since we use useDroppable on columns)
    const toColumnId = String(over.id)

    if (fromColumnId && toColumnId && fromColumnId !== toColumnId) {
      onMove(String(active.id), fromColumnId, toColumnId)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
        {columns.map((col) => {
          const colItems = items.filter((i) => i.columnId === col.id)
          return (
            <DroppableColumn key={col.id} column={col} count={colItems.length}>
              {colItems.map((item) => (
                <DraggableItem key={item.id} item={item} renderItem={renderItem} />
              ))}
            </DroppableColumn>
          )
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeItem
          ? (renderOverlay ?? renderItem)(activeItem, true)
          : null}
      </DragOverlay>
    </DndContext>
  )
}
