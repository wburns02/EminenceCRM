import { cn } from '@/lib/utils'
import type { Stage } from '@/api/types/engagement'

interface StageProgressBarProps {
  stages: Stage[]
  currentStageId: string | null | undefined
  onStageClick?: (stage: Stage) => void
  className?: string
}

export default function StageProgressBar({
  stages,
  currentStageId,
  onStageClick,
  className,
}: StageProgressBarProps) {
  const sorted = [...stages].sort((a, b) => a.order_index - b.order_index)
  const currentIndex = sorted.findIndex((s) => s.id === currentStageId)

  return (
    <div className={cn('flex items-center gap-0', className)}>
      {sorted.map((stage, idx) => {
        const isCurrent = stage.id === currentStageId
        const isPast = idx < currentIndex
        const color = stage.color ?? '#00594C'

        return (
          <div key={stage.id} className="flex items-center flex-1 min-w-0">
            <button
              type="button"
              onClick={() => onStageClick?.(stage)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all relative',
                isCurrent
                  ? 'text-white shadow-sm'
                  : isPast
                    ? 'text-white/90'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200',
                onStageClick && 'cursor-pointer'
              )}
              style={
                isCurrent
                  ? { backgroundColor: color }
                  : isPast
                    ? { backgroundColor: color, opacity: 0.6 }
                    : undefined
              }
            >
              <span
                className={cn(
                  'flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2',
                  isCurrent
                    ? 'bg-white border-white'
                    : isPast
                      ? 'bg-white/30 border-white/50'
                      : 'bg-white border-gray-300'
                )}
                style={isCurrent ? { color } : isPast ? { color: 'white' } : undefined}
              >
                {isPast ? '\u2713' : idx + 1}
              </span>
              <span className="truncate">{stage.name}</span>
            </button>
            {idx < sorted.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-3 flex-shrink-0',
                  idx < currentIndex ? 'bg-primary/40' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
