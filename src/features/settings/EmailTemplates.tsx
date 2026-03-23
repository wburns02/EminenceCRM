import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Plus, Edit, Trash2, Eye, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { Badge } from '@/components/ui/Badge'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState } from '@/components/ui/EmptyState'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: string
  created_at: string
}

const CATEGORIES = ['Teaser', 'NDA', 'CIM', 'Follow-up', 'LOI', 'General'] as const

const MERGE_FIELDS = [
  '{{company_name}}',
  '{{contact_name}}',
  '{{deal_codename}}',
  '{{advisor_name}}',
  '{{stage}}',
  '{{date}}',
]

const SAMPLE_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    name: 'Initial Teaser',
    subject: 'Confidential Investment Opportunity - {{deal_codename}}',
    body: 'Dear {{contact_name}},\n\nWe are pleased to present a confidential investment opportunity on behalf of our client.\n\n[Teaser content]\n\nBest regards,\n{{advisor_name}}',
    category: 'Teaser',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'NDA Request',
    subject: 'Non-Disclosure Agreement - {{deal_codename}}',
    body: 'Dear {{contact_name}},\n\nThank you for your interest in {{deal_codename}}. Please find attached the Non-Disclosure Agreement for your review and signature.\n\nBest regards,\n{{advisor_name}}',
    category: 'NDA',
    created_at: new Date().toISOString(),
  },
]

export default function EmailTemplates() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [templates] = useState<EmailTemplate[]>(SAMPLE_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formCategory, setFormCategory] = useState('General')

  const filtered = templates.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (template: EmailTemplate) => {
    setFormName(template.name)
    setFormSubject(template.subject)
    setFormBody(template.body)
    setFormCategory(template.category)
    setShowForm(true)
  }

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const insertMergeField = (field: string) => {
    setFormBody((prev) => prev + field)
  }

  const handleClose = () => {
    setShowForm(false)
    setFormName('')
    setFormSubject('')
    setFormBody('')
    setFormCategory('General')
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
        <ArrowLeft className="h-4 w-4" />
        Settings
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-accent-gold" />
          <h1 className="text-2xl font-bold text-text-primary">Email Templates</h1>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search templates..."
        className="w-56"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-12 w-12" />}
          title="No templates"
          description="Create email templates with merge fields for consistent communications."
          action={
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="bg-bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">{template.name}</h3>
                    <Badge variant="default">{template.category}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">Subject: {template.subject}</p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{template.body}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 text-text-muted hover:text-primary"
                    onClick={() => handlePreview(template)}
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 text-text-muted hover:text-primary"
                    onClick={() => handleEdit(template)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 text-text-muted hover:text-danger"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Form Dialog */}
      <Dialog open={showForm} onClose={handleClose} title="Email Template" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Template Name" required>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Follow-up Email" />
            </FormField>
            <FormField label="Category">
              <Select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Subject" required>
            <Input value={formSubject} onChange={(e) => setFormSubject(e.target.value)} placeholder="RE: {{deal_codename}}" />
          </FormField>

          <FormField label="Body" required>
            <Textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="Email body with merge fields..."
              rows={8}
            />
          </FormField>

          <div>
            <p className="text-xs text-text-muted mb-2">Merge Fields (click to insert):</p>
            <div className="flex flex-wrap gap-1.5">
              {MERGE_FIELDS.map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => insertMergeField(field)}
                  className="px-2 py-1 text-xs font-mono bg-primary/5 text-primary rounded border border-primary/20 hover:bg-primary/10"
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button disabled={!formName || !formSubject}>Save Template</Button>
          </div>
        </div>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Template Preview"
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-muted uppercase">Subject</p>
              <p className="text-sm font-medium text-text-primary">{selectedTemplate.subject}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase mb-1">Body</p>
              <div className="bg-gray-50 border border-border rounded-lg p-4 text-sm text-text-secondary whitespace-pre-wrap">
                {selectedTemplate.body}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(selectedTemplate.body)}
              >
                <Copy className="h-4 w-4" />
                Copy Body
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
