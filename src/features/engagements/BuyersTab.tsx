import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Users,
  MoreVertical,
  ArrowRight,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useBuyerInterests,
  useBuyerFunnel,
  useUpdateBuyerStatus,
} from '@/api/hooks/useBuyerInterests'
import {
  BUYER_STATUSES,
  BUYER_STATUS_LABELS,
  BUYER_STATUS_COLORS,
} from '@/api/types/buyerInterest'
import type { BuyerInterest } from '@/api/types/buyerInterest'

function formatAmount(value: number | null | undefined): string {
  if (value == null) return '--'
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

function daysInStatus(statusChangedAt: string | null | undefined): number {
  if (!statusChangedAt) return 0
  const now = new Date()
  const changed = new Date(statusChangedAt)
  return Math.max(0, Math.floor((now.getTime() - changed.getTime()) / (1000 * 60 * 60 * 24)))
}

function fitScoreColor(score: number | null | undefined): string {
  if (score == null) return 'text-text-muted'
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-amber-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

// Funnel stages in order (excluding 'passed')
const FUNNEL_STAGES = [
  'identified',
  'teaser_sent',
  'nda_signed',
  'cim_sent',
  'ioi_received',
  'loi_received',
  'due_diligence',
  'closed',
] as const

interface BuyersTabProps {
  engagementId: string
}

export default function BuyersTab({ engagementId }: BuyersTabProps) {
  const { data: buyersData, isLoading: buyersLoading } = useBuyerInterests(engagementId)
  const { data: funnel } = useBuyerFunnel(engagementId)
  const updateStatus = useUpdateBuyerStatus()
  const [_statusFilter, setStatusFilter] = useState<string>('all')

  const buyers = buyersData?.items ?? []

  const getNextStatus = (current: string): string | null => {
    const idx = BUYER_STATUSES.indexOf(current as typeof BUYER_STATUSES[number])
    if (idx === -1 || idx >= BUYER_STATUSES.length - 2) return null // skip 'passed'
    return BUYER_STATUSES[idx + 1]
  }

  const handleAdvanceStatus = (buyer: BuyerInterest) => {
    const next = getNextStatus(buyer.status)
    if (next) {
      updateStatus.mutate({
        engagementId,
        buyerId: buyer.id,
        status: next,
      })
    }
  }

  const handleSetStatus = (buyer: BuyerInterest, status: string) => {
    updateStatus.mutate({
      engagementId,
      buyerId: buyer.id,
      status,
    })
  }

  if (buyersLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Buyer Funnel */}
      {funnel && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-1 overflow-x-auto">
              {FUNNEL_STAGES.map((stage, idx) => {
                const count = funnel[stage] ?? 0
                const maxCount = Math.max(
                  ...FUNNEL_STAGES.map((s) => funnel[s] ?? 0),
                  1
                )
                const widthPct = Math.max(20, (count / maxCount) * 100)

                return (
                  <div key={stage} className="flex items-center flex-1 min-w-0">
                    <button
                      onClick={() => setStatusFilter(stage)}
                      className="flex-1 min-w-0"
                    >
                      <div className="text-[10px] font-medium text-text-secondary uppercase truncate mb-1 text-center">
                        {BUYER_STATUS_LABELS[stage]}
                      </div>
                      <div
                        className="h-7 rounded flex items-center justify-center text-xs font-bold text-white transition-all mx-auto"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor:
                            count > 0 ? '#00594C' : '#E5E7EB',
                          color: count > 0 ? 'white' : '#9CA3AF',
                        }}
                      >
                        {count}
                      </div>
                    </button>
                    {idx < FUNNEL_STAGES.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-text-muted flex-shrink-0 mx-0.5" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {buyers.length} buyer{buyers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Add Buyers
        </Button>
      </div>

      {/* Buyers table */}
      {buyers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No buyers yet"
          description="Add potential buyers to start tracking the process"
          action={
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add Buyers
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase">
                    Days
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">
                    IOI
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">
                    LOI
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase">
                    Fit
                  </th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {buyers.map((buyer) => (
                  <tr
                    key={buyer.id}
                    className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-text-primary">
                        {buyer.company_name ?? 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-text-secondary">
                        {buyer.contact_name ?? '--'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border',
                          BUYER_STATUS_COLORS[buyer.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                        )}
                      >
                        {BUYER_STATUS_LABELS[buyer.status] ?? buyer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-text-secondary">
                        {daysInStatus(buyer.status_changed_at)}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-text-primary">
                        {formatAmount(buyer.ioi_amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-text-primary">
                        {formatAmount(buyer.loi_amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          fitScoreColor(buyer.fit_score)
                        )}
                      >
                        {buyer.fit_score ?? '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Dropdown
                        trigger={
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <MoreVertical className="h-4 w-4 text-text-muted" />
                          </button>
                        }
                        items={[
                          ...(getNextStatus(buyer.status)
                            ? [
                                {
                                  label: `Advance to ${BUYER_STATUS_LABELS[getNextStatus(buyer.status)!]}`,
                                  icon: <ArrowRight className="h-4 w-4" />,
                                  onClick: () => handleAdvanceStatus(buyer),
                                },
                              ]
                            : []),
                          {
                            label: 'Mark as Passed',
                            onClick: () => handleSetStatus(buyer, 'passed'),
                            danger: true,
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
