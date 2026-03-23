import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { Dialog } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { Plus } from 'lucide-react'
import ActivityTimeline from '@/components/shared/ActivityTimeline'
import { useEngagementActivities, useCreateActivity } from '@/api/hooks/useActivities'

const ACTIVITY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'call', label: 'Calls' },
  { value: 'email', label: 'Emails' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'note', label: 'Notes' },
  { value: 'system', label: 'System' },
]

interface ActivityTabProps {
  engagementId: string
}

export default function ActivityTab({ engagementId }: ActivityTabProps) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [logOpen, setLogOpen] = useState(false)
  const [newType, setNewType] = useState('note')
  const [newSubject, setNewSubject] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const { data: activitiesData, isLoading } = useEngagementActivities(engagementId, typeFilter)
  const createActivity = useCreateActivity()

  const activities = activitiesData?.items ?? []

  const handleLogActivity = () => {
    if (!newSubject.trim()) return
    createActivity.mutate(
      {
        type: newType,
        subject: newSubject,
        description: newDescription || undefined,
        engagement_id: engagementId,
      },
      {
        onSuccess: () => {
          setNewSubject('')
          setNewDescription('')
          setNewType('note')
          setLogOpen(false)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-96" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-40"
        >
          {ACTIVITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>

        <Button size="sm" onClick={() => setLogOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Log Activity
        </Button>
      </div>

      {/* Timeline */}
      <ActivityTimeline activities={activities} />

      {/* Log Activity dialog */}
      <Dialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        title="Log Activity"
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Type" required>
            <Select value={newType} onChange={(e) => setNewType(e.target.value)}>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
            </Select>
          </FormField>

          <FormField label="Subject" required>
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Brief summary of the activity"
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Detailed notes..."
              rows={4}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setLogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLogActivity}
              loading={createActivity.isPending}
              disabled={!newSubject.trim()}
            >
              Log Activity
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
