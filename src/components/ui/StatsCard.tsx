import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Trend = 'up' | 'down' | 'neutral'

interface StatsCardProps {
  label: string
  value: string | number
  trend?: Trend
  trendValue?: string
  icon?: ReactNode
  accentColor?: string
  className?: string
}

const trendConfig: Record<Trend, { icon: typeof TrendingUp; color: string }> = {
  up: { icon: TrendingUp, color: 'text-success' },
  down: { icon: TrendingDown, color: 'text-danger' },
  neutral: { icon: Minus, color: 'text-text-muted' },
}

function StatsCard({
  label,
  value,
  trend,
  trendValue,
  icon,
  accentColor = 'border-l-primary',
  className,
}: StatsCardProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null

  return (
    <div
      className={cn(
        'bg-bg-card border border-border rounded-lg shadow-sm p-5 border-l-4',
        accentColor,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/5 text-primary">
            {icon}
          </div>
        )}
      </div>
      {trend && trendValue && TrendIcon && (
        <div className={cn('flex items-center gap-1 mt-2 text-sm', trendConfig[trend].color)}>
          <TrendIcon className="h-4 w-4" />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  )
}

export { StatsCard }
export type { StatsCardProps, Trend }
