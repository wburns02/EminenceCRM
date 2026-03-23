import { Activity } from 'lucide-react'

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Activity Feed</h1>
      </div>
      <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-text-secondary">Activity feed will be implemented in a later task.</p>
      </div>
    </div>
  )
}
