import { useState, useMemo } from 'react'
import { Activity as ActivityIcon, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import ActivityTimeline from '@/components/shared/ActivityTimeline'
import { useRecentActivities, useCreateActivity } from '@/api/hooks/useActivities'
import { useEngagements } from '@/api/hooks/useEngagements'
import type { Activity } from '@/api/types/activity'

const ACTIVITY_TYPES = ['call', 'email', 'meeting', 'note', 'task'] as const

export default function ActivityPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [engagementFilter, setEngagementFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formType, setFormType] = useState('call')
  const [formSubject, setFormSubject] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formEngagementId, setFormEngagementId] = useState('')

  const { data: activitiesData, isLoading } = useRecentActivities(200)
  const { data: engagementsData } = useEngagements({ page_size: 100 })
  const createActivity = useCreateActivity()

  const engagements = engagementsData?.items ?? []
  const allActivities = activitiesData?.items ?? []

  const filtered = useMemo(() => {
    return allActivities.filter((a: Activity) => {
      if (search) {
        const s = search.toLowerCase()
        if (
          !a.subject.toLowerCase().includes(s) &&
          !(a.description ?? '').toLowerCase().includes(s) &&
          !(a.contact_name ?? '').toLowerCase().includes(s) &&
          !(a.performed_by_name ?? '').toLowerCase().includes(s)
        ) return false
      }
      if (typeFilter !== 'all' && a.type !== typeFilter) return false
      if (engagementFilter !== 'all' && a.engagement_id !== engagementFilter) return false
      return true
    })
  }, [allActivities, search, typeFilter, engagementFilter])

  const pageSize = 25
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSubmit = async () => {
    if (!formSubject.trim()) return
    await createActivity.mutateAsync({
      type: formType,
      subject: formSubject,
      description: formDescription || undefined,
      engagement_id: formEngagementId || undefined,
    })
    setShowForm(false)
    setFormSubject('')
    setFormDescription('')
    setFormEngagementId('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <ActivityIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">Activity Feed</h1>
          {activitiesData && (
            <span className="text-sm text-text-muted">({filtered.length})</span>
          )}
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      <Tabs defaultTab="all">
        <TabList>
          <Tab value="all">All Activity</Tab>
          <Tab value="my">My Activity</Tab>
        </TabList>

        <TabPanel value="all">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                value={search}
                onChange={(v) => { setSearch(v); setPage(1) }}
                placeholder="Search activities..."
                className="w-56"
              />
              <Select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
                className="w-36"
              >
                <option value="all">All Types</option>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </Select>
              <Select
                value={engagementFilter}
                onChange={(e) => { setEngagementFilter(e.target.value); setPage(1) }}
                className="w-44"
              >
                <option value="all">All Deals</option>
                {engagements.map((eng) => (
                  <option key={eng.id} value={eng.id}>{eng.codename ?? eng.name}</option>
                ))}
              </Select>
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setTypeFilter('all'); setEngagementFilter('all'); setPage(1) }}>
                <Filter className="h-4 w-4" />
                Clear
              </Button>
            </div>

            {/* Timeline */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : paged.length === 0 ? (
              <EmptyState
                icon={<ActivityIcon className="h-12 w-12" />}
                title="No activities found"
                description={search || typeFilter !== 'all' ? 'Try adjusting your filters.' : 'Log your first activity to get started.'}
                action={
                  <Button size="sm" onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4" />
                    Log Activity
                  </Button>
                }
              />
            ) : (
              <div className="bg-bg-card border border-border rounded-lg p-6">
                <ActivityTimeline activities={paged} />
                {totalPages > 1 && (
                  <div className="flex justify-center pt-4 mt-4 border-t border-border">
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                )}
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel value="my">
          <div className="bg-bg-card border border-border rounded-lg p-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <ActivityTimeline
                activities={allActivities.filter((a) => a.performed_by_name).slice(0, 25)}
              />
            )}
          </div>
        </TabPanel>
      </Tabs>

      {/* Log Activity Dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Log Activity"
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Type" required>
            <Select value={formType} onChange={(e) => setFormType(e.target.value)}>
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Subject" required>
            <Input
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              placeholder="Call with buyer about LOI terms"
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Details..."
              rows={3}
            />
          </FormField>

          <FormField label="Linked Deal">
            <Select value={formEngagementId} onChange={(e) => setFormEngagementId(e.target.value)}>
              <option value="">None</option>
              {engagements.map((eng) => (
                <option key={eng.id} value={eng.id}>{eng.codename ?? eng.name}</option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formSubject.trim()}
              loading={createActivity.isPending}
            >
              Log Activity
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
