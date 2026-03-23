import { Users } from 'lucide-react'

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Contacts</h1>
      </div>
      <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-text-secondary">Contacts page will be implemented in a later task.</p>
      </div>
    </div>
  )
}
