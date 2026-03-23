import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckSquare,
  Plus,
  AlertTriangle,
  Clock,
  Calendar,
  ChevronRight,
  Circle,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { Badge } from '@/components/ui/Badge'
import { TaskPriorityBadge } from '@/components/ui/StatusBadge'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs'
import { StatsCard } from '@/components/ui/StatsCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useMyTasks, useCreateTask, useUpdateTask } from '@/api/hooks/useTasks'
import { useEngagements } from '@/api/hooks/useEngagements'
import type { Task } from '@/api/types/task'
import type { TaskPriority } from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

function TaskCard({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  const navigate = useNavigate()
  const isComplete = task.status === 'completed'
  const isOverdue =
    !isComplete && task.due_date && new Date(task.due_date) < new Date()

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        isComplete
          ? 'bg-gray-50 border-border opacity-60'
          : isOverdue
          ? 'bg-red-50/50 border-red-200'
          : 'bg-bg-card border-border hover:border-primary/30'
      }`}
    >
      <button
        onClick={() => onToggle(task)}
        className="mt-0.5 flex-shrink-0"
      >
        {isComplete ? (
          <CheckCircle className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5 text-text-muted hover:text-primary" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isComplete ? 'line-through text-text-muted' : 'text-text-primary'}`}>
            {task.title}
          </span>
          <TaskPriorityBadge priority={task.priority as TaskPriority} />
        </div>

        {task.description && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>
        )}

        <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
          {task.due_date && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-danger font-medium' : ''}`}>
              <Calendar className="h-3 w-3" />
              {formatDate(task.due_date)}
              {isOverdue && ' (overdue)'}
            </span>
          )}
          {task.assigned_to_name && (
            <span>{task.assigned_to_name}</span>
          )}
          {task.engagement_codename && (
            <button
              className="text-primary hover:underline flex items-center gap-0.5"
              onClick={() => task.engagement_id && navigate(`/engagements/${task.engagement_id}`)}
            >
              {task.engagement_codename}
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskGroup({ title, tasks, icon, onToggle }: {
  title: string
  tasks: Task[]
  icon: React.ReactNode
  onToggle: (task: Task) => void
}) {
  if (tasks.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
        {icon}
        {title}
        <Badge variant="default">{tasks.length}</Badge>
      </div>
      <div className="space-y-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const { data: myTasks, isLoading } = useMyTasks()
  const { data: engagementsData } = useEngagements({ page_size: 200 })
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPriority, setFormPriority] = useState('medium')
  const [formDueDate, setFormDueDate] = useState('')
  const [formEngagementId, setFormEngagementId] = useState('')

  const engagements = engagementsData?.items ?? []

  const toggleTask = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    updateTask.mutate({ id: task.id, status: newStatus })
  }

  const handleCreate = async () => {
    if (!formTitle.trim()) return
    await createTask.mutateAsync({
      title: formTitle,
      description: formDescription || undefined,
      priority: formPriority,
      due_date: formDueDate || undefined,
      engagement_id: formEngagementId || undefined,
    })
    setShowForm(false)
    setFormTitle('')
    setFormDescription('')
    setFormPriority('medium')
    setFormDueDate('')
    setFormEngagementId('')
  }

  const overdue = useMemo(() => {
    const items = myTasks?.overdue ?? []
    if (!search) return items
    const s = search.toLowerCase()
    return items.filter((t) => t.title.toLowerCase().includes(s))
  }, [myTasks, search])

  const today = useMemo(() => {
    const items = myTasks?.today ?? []
    if (!search) return items
    const s = search.toLowerCase()
    return items.filter((t) => t.title.toLowerCase().includes(s))
  }, [myTasks, search])

  const upcoming = useMemo(() => {
    const items = myTasks?.upcoming ?? []
    if (!search) return items
    const s = search.toLowerCase()
    return items.filter((t) => t.title.toLowerCase().includes(s))
  }, [myTasks, search])

  const completed = useMemo(() => {
    const items = myTasks?.completed ?? []
    if (!search) return items
    const s = search.toLowerCase()
    return items.filter((t) => t.title.toLowerCase().includes(s))
  }, [myTasks, search])

  const totalOpen = (myTasks?.overdue.length ?? 0) + (myTasks?.today.length ?? 0) + (myTasks?.upcoming.length ?? 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard
          label="Overdue"
          value={myTasks?.overdue.length ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          accentColor="border-l-danger"
        />
        <StatsCard
          label="Due Today"
          value={myTasks?.today.length ?? 0}
          icon={<Clock className="h-5 w-5" />}
          accentColor="border-l-warning"
        />
        <StatsCard
          label="Open"
          value={totalOpen}
          icon={<CheckSquare className="h-5 w-5" />}
          accentColor="border-l-primary"
        />
        <StatsCard
          label="Completed"
          value={myTasks?.completed.length ?? 0}
          icon={<CheckCircle className="h-5 w-5" />}
          accentColor="border-l-success"
        />
      </div>

      <Tabs defaultTab="my">
        <TabList>
          <Tab value="my">My Tasks</Tab>
          <Tab value="all">All Tasks</Tab>
          <Tab value="engagement">By Engagement</Tab>
        </TabList>

        <TabPanel value="my">
          <div className="space-y-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search tasks..."
              className="w-56"
            />

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : totalOpen === 0 && completed.length === 0 ? (
              <EmptyState
                icon={<CheckSquare className="h-12 w-12" />}
                title="No tasks"
                description="You're all caught up! Create a new task to get started."
                action={
                  <Button size="sm" onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4" />
                    New Task
                  </Button>
                }
              />
            ) : (
              <div className="space-y-6">
                <TaskGroup
                  title="Overdue"
                  tasks={overdue}
                  icon={<AlertTriangle className="h-4 w-4 text-danger" />}
                  onToggle={toggleTask}
                />
                <TaskGroup
                  title="Due Today"
                  tasks={today}
                  icon={<Clock className="h-4 w-4 text-warning" />}
                  onToggle={toggleTask}
                />
                <TaskGroup
                  title="Upcoming"
                  tasks={upcoming}
                  icon={<Calendar className="h-4 w-4 text-primary" />}
                  onToggle={toggleTask}
                />
                <TaskGroup
                  title="Completed"
                  tasks={completed}
                  icon={<CheckCircle className="h-4 w-4 text-success" />}
                  onToggle={toggleTask}
                />
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel value="all">
          <div className="bg-bg-card border border-border rounded-lg p-6">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-1">
                {[...(myTasks?.overdue ?? []), ...(myTasks?.today ?? []), ...(myTasks?.upcoming ?? []), ...(myTasks?.completed ?? [])].map((task) => (
                  <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel value="engagement">
          <div className="space-y-4">
            {engagements.length === 0 ? (
              <EmptyState
                icon={<CheckSquare className="h-12 w-12" />}
                title="No engagements"
                description="Create engagements to see tasks grouped by deal."
              />
            ) : (
              engagements.map((eng) => {
                const allTasks = [
                  ...(myTasks?.overdue ?? []),
                  ...(myTasks?.today ?? []),
                  ...(myTasks?.upcoming ?? []),
                  ...(myTasks?.completed ?? []),
                ]
                const engTasks = allTasks.filter((t) => t.engagement_id === eng.id)
                if (engTasks.length === 0) return null
                return (
                  <div key={eng.id} className="bg-bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-text-primary">
                        {eng.codename ?? eng.name}
                      </span>
                      <Badge variant="default">{engTasks.length}</Badge>
                    </div>
                    <div className="space-y-1">
                      {engTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </TabPanel>
      </Tabs>

      {/* New Task Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} title="New Task" size="md">
        <div className="space-y-4">
          <FormField label="Title" required>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Review CIM draft"
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Task details..."
              rows={2}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Priority">
              <Select value={formPriority} onChange={(e) => setFormPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Due Date">
              <Input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Linked Deal">
            <Select value={formEngagementId} onChange={(e) => setFormEngagementId(e.target.value)}>
              <option value="">None</option>
              {engagements.map((eng) => (
                <option key={eng.id} value={eng.id}>{eng.codename ?? eng.name}</option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!formTitle.trim()}
              loading={createTask.isPending}
            >
              Create Task
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
