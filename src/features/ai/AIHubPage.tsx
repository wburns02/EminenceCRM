import { Brain } from 'lucide-react'

export default function AIHubPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">AI Hub</h1>
      </div>
      <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-text-secondary">AI Hub will be implemented in a later task.</p>
      </div>
    </div>
  )
}
