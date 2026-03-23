import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Upload, Link2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/ui/FormField'
import { Dialog } from '@/components/ui/Dialog'
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '@/api/types/document'

interface DocumentUploaderProps {
  onUpload: (file: File, type: string, name?: string) => void
  onLink: (name: string, type: string, url: string) => void
  uploading?: boolean
  className?: string
}

export default function DocumentUploader({
  onUpload,
  onLink,
  uploading,
  className,
}: DocumentUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkType, setLinkType] = useState('other')
  const [uploadType, setUploadType] = useState('other')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        onUpload(file, uploadType)
      }
    },
    [onUpload, uploadType]
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file, uploadType)
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleLinkSubmit = () => {
    if (linkName && linkUrl) {
      onLink(linkName, linkType, linkUrl)
      setLinkName('')
      setLinkUrl('')
      setLinkType('other')
      setLinkDialogOpen(false)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload type selection */}
      <div className="flex items-center gap-3">
        <Select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value)}
          className="w-40"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {DOCUMENT_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          loading={uploading}
        >
          <Upload className="h-4 w-4" />
          Upload File
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLinkDialogOpen(true)}
        >
          <Link2 className="h-4 w-4" />
          Add Link
        </Button>
      </div>

      {/* Drag and drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-gray-50'
        )}
      >
        <FileText className="h-8 w-8 mx-auto mb-2 text-text-muted" />
        <p className="text-sm text-text-secondary">
          {uploading ? 'Uploading...' : 'Drag and drop a file here, or click to browse'}
        </p>
        <p className="text-xs text-text-muted mt-1">PDF, DOCX, XLSX, PPTX up to 50MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.docx,.xlsx,.pptx,.doc,.xls,.ppt,.txt,.csv"
      />

      {/* Link dialog */}
      <Dialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        title="Add External Link"
        size="sm"
      >
        <div className="space-y-4">
          <FormField label="Document Name" required>
            <Input
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder="Q3 Financial Model"
            />
          </FormField>

          <FormField label="URL" required>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://docs.google.com/..."
            />
          </FormField>

          <FormField label="Document Type">
            <Select value={linkType} onChange={(e) => setLinkType(e.target.value)}>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {DOCUMENT_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkSubmit} disabled={!linkName || !linkUrl}>
              Add Link
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
