import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { Dialog } from '@/components/ui/Dialog'
import { TaskPriorityBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Plus, CheckSquare, Square, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { useEngagementTasks, useCreateTask, useUpdateTask } from '@/api/hooks/useTasks'
import type { Task } from '@/api/types/task'
import type { TaskPriority } from '@/components/ui/StatusBadge'

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false
  return new Date(task.due_date) < new Date()
}

interface TasksTabProps {
  engagementId: string
}

export default function TasksTab({ engagementId }: TasksTabProps) {
  const { data: tasksData, isLoading } = useEngagementTasks(engagementId)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDueDate, setNewDueDate] = useState('')

  const tasks = tasksData?.items ?? []

  // Group tasks: overdue first, then pending/in_progress, then completed
  const overdueTasks = tasks.filter((t) => isOverdue(t))
  const activeTasks = tasks.filter(
    (t) => !isOverdue(t) && t.status !== 'completed' && t.status !== 'cancelled'
  )
  const completedTasks = tasks.filter(
    (t) => t.status === 'completed' || t.status === 'cancelled'
  )

  const toggleTask = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    updateTask.mutate({ id: task.id, status: newStatus })
  }

  const handleCreateTask = () => {
    if (!newTitle.trim()) return
    createTask.mutate(
      {
        title: newTitle,
        description: newDescription || undefined,
        priority: newPriority,
        due_date: newDueDate || undefined,
        engagement_id: engagementId,
      },
      {
        onSuccess: () => {
          setNewTitle('')
          setNewDescription('')
          setNewPriority('medium')
          setNewDueDate('')
          setAddOpen(false)
        },
      }
    )
  }

  const renderTask = (task: Task, showOverdue = false) => (
    <div
      key={task.id}
      className={cn(
        'flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors',
        showOverdue && 'bg-red-50/50'
      )}
    >
      <button
        onClick={() => toggleTask(task)}
        className="mt-0.5 flex-shrink-0"
      >
        {task.status === 'completed' ? (
          <CheckSquare className="h-5 w-5 text-primary" />
        ) : (
          <Square className="h-5 w-5 text-text-muted hover:text-primary transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              task.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary'
            )}
          >
            {task.title}
          </span>
          <TaskPriorityBadge priority={task.priority as TaskPriority} />
        </div>

        {task.description && (
          <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{task.description}</p>
        )}

        <div className="flex items-center gap-3 mt-1">
          {task.assigned_to_name && (
            <span className="text-xs text-text-secondary">{task.assigned_to_name}</span>
          )}
          {task.due_date && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue(task) ? 'text-danger font-medium' : 'text-text-muted'
              )}
            >
              <Clock className="h-3 w-3" />
              {formatDate(task.due_date)}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>
        <EmptyState
          icon={<CheckSquare className="h-12 w-12" />}
          title="No tasks"
          description="Create tasks to track work for this engagement"
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </Button>
          }
        />
        {renderAddDialog()}
      </div>
    )
  }

  function renderAddDialog() {
    return (
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Task"
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Title" required>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task title"
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Priority">
              <Select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </FormField>

            <FormField label="Due Date">
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              loading={createTask.isPending}
              disabled={!newTitle.trim()}
            >
              Create Task
            </Button>
          </div>
        </div>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </Button>
      </div>

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="h-4 w-4" />
                Overdue ({overdueTasks.length})
              </div>
            </CardTitle>
          </CardHeader>
          <div>{overdueTasks.map((t) => renderTask(t, true))}</div>
        </Card>
      )}

      {/* Active tasks */}
      {activeTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active ({activeTasks.length})</CardTitle>
          </CardHeader>
          <div>{activeTasks.map((t) => renderTask(t))}</div>
        </Card>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="text-text-secondary">Completed ({completedTasks.length})</span>
            </CardTitle>
          </CardHeader>
          <div>{completedTasks.map((t) => renderTask(t))}</div>
        </Card>
      )}

      {renderAddDialog()}
    </div>
  )
}
