import { useState, useMemo } from 'react'
import { FileCheck, AlertTriangle, Clock, Search } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Badge } from '@/components/ui/Badge'
import { StatsCard } from '@/components/ui/StatsCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useEngagements } from '@/api/hooks/useEngagements'
import { useAllBuyerInterests } from '@/api/hooks/useBuyerInterests'
import { formatDate } from '@/lib/utils'
import type { Engagement } from '@/api/types/engagement'

// Statuses at or after NDA being sent (teaser_sent means NDA is typically sent with teaser)
const NDA_SENT_STATUSES = new Set([
  'teaser_sent',
  'nda_signed',
  'cim_sent',
  'ioi_received',
  'loi_received',
  'due_diligence',
  'closed',
])

// Statuses at or after NDA being signed
const NDA_SIGNED_STATUSES = new Set([
  'nda_signed',
  'cim_sent',
  'ioi_received',
  'loi_received',
  'due_diligence',
  'closed',
])

function NDATrackerInner({ engagements }: { engagements: Engagement[] }) {
  const [search, setSearch] = useState('')

  const engagementIds = useMemo(
    () => engagements.map((e) => e.id),
    [engagements]
  )

  const { data: allBuyers } = useAllBuyerInterests(engagementIds)

  const stats = useMemo(() => {
    const buyers = allBuyers ?? []
    const now = Date.now()
    const fiveDays = 5 * 24 * 60 * 60 * 1000

    let ndaSent = 0
    let ndaSigned = 0
    let overdue = 0

    for (const buyer of buyers) {
      if (NDA_SENT_STATUSES.has(buyer.status)) {
        ndaSent++
      }
      if (NDA_SIGNED_STATUSES.has(buyer.status)) {
        ndaSigned++
      }
      // Overdue: NDA sent (teaser_sent) but not yet signed, and it's been > 5 days
      if (buyer.status === 'teaser_sent' && buyer.status_changed_at) {
        const changedAt = new Date(buyer.status_changed_at).getTime()
        if (now - changedAt > fiveDays) {
          overdue++
        }
      }
    }

    return { ndaSent, ndaSigned, overdue }
  }, [allBuyers])

  const filteredEngagements = engagements.filter(
    (e) =>
      !search ||
      (e.codename ?? e.name).toLowerCase().includes(search.toLowerCase())
  )

  const activeDeals = engagements.filter((e) => e.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard
          label="Active Deals"
          value={activeDeals}
          icon={<FileCheck className="h-5 w-5" />}
          accentColor="border-l-primary"
        />
        <StatsCard
          label="NDAs Sent"
          value={stats.ndaSent}
          icon={<Clock className="h-5 w-5" />}
          accentColor="border-l-accent-teal"
        />
        <StatsCard
          label="NDAs Signed"
          value={stats.ndaSigned}
          icon={<FileCheck className="h-5 w-5" />}
          accentColor="border-l-success"
        />
        <StatsCard
          label="Overdue"
          value={stats.overdue}
          icon={<AlertTriangle className="h-5 w-5" />}
          accentColor="border-l-danger"
        />
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by deal name..."
        className="w-64"
      />

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Deal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Stage</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredEngagements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-muted">
                  No deals found.
                </td>
              </tr>
            ) : (
              filteredEngagements.map((eng) => (
                <tr key={eng.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">
                    {eng.codename ?? eng.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={eng.status === 'active' ? 'success' : 'default'}>
                      {eng.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {eng.type === 'sell_side' ? 'Sell-Side' : 'Buy-Side'}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {eng.stage?.name ?? '--'}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-muted">
                    {formatDate(eng.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function NDATracker() {
  const { data: engagementsData, isLoading } = useEngagements({ page_size: 200 })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const engagements = engagementsData?.items ?? []

  if (engagements.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-12 w-12" />}
        title="No deals to track"
        description="NDA tracking will appear once you have active engagements with buyer interests."
      />
    )
  }

  return <NDATrackerInner engagements={engagements} />
}
