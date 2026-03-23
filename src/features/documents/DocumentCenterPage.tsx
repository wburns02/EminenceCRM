import { FileText } from 'lucide-react'

export default function DocumentCenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Document Center</h1>
      </div>
      <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-text-secondary">Document center will be implemented in a later task.</p>
      </div>
    </div>
  )
}
