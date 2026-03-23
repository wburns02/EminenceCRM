import { Kanban } from 'lucide-react'

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Kanban className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Deal Pipeline</h1>
      </div>
      <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-text-secondary">Pipeline will be implemented in Task 14.</p>
      </div>
    </div>
  )
}
