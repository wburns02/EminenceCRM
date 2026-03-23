import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { FileText, Link2, ExternalLink, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { useDocuments, useUploadDocument, useLinkDocument } from '@/api/hooks/useDocuments'
import DocumentUploader from '@/components/shared/DocumentUploader'
import { DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_LABELS } from '@/api/types/document'

const typeColors: Record<string, string> = {
  cim: 'bg-purple-100 text-purple-700',
  nda: 'bg-blue-100 text-blue-700',
  loi: 'bg-amber-100 text-amber-700',
  ioi: 'bg-orange-100 text-orange-700',
  financial: 'bg-green-100 text-green-700',
  legal: 'bg-red-100 text-red-700',
  teaser: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-600',
}

interface DocumentsTabProps {
  engagementId: string
}

export default function DocumentsTab({ engagementId }: DocumentsTabProps) {
  const { data: docsData, isLoading } = useDocuments(engagementId)
  const uploadDoc = useUploadDocument()
  const linkDoc = useLinkDocument()

  const documents = docsData?.items ?? []

  const handleUpload = (file: File, type: string) => {
    uploadDoc.mutate({ file, engagementId, type })
  }

  const handleLink = (name: string, type: string, url: string) => {
    linkDoc.mutate({ engagementId, name, type, externalUrl: url })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <DocumentUploader
        onUpload={handleUpload}
        onLink={handleLink}
        uploading={uploadDoc.isPending}
      />

      {/* Document grid */}
      {documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No documents"
          description="Upload files or add external links for this engagement"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    {doc.external_url ? (
                      <Link2 className="h-5 w-5 text-text-secondary" />
                    ) : (
                      <FileText className="h-5 w-5 text-text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-text-primary truncate">
                        {doc.name}
                      </h4>
                      {doc.external_url && (
                        <a
                          href={doc.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-primary" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium',
                          typeColors[doc.type] ?? typeColors.other
                        )}
                      >
                        {DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}
                      </span>
                      {doc.status && (
                        <span className="text-[10px] text-text-muted">
                          {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
                        </span>
                      )}
                      {doc.version && doc.version > 1 && (
                        <span className="text-[10px] text-text-muted">v{doc.version}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                      {doc.uploaded_by_name && <span>{doc.uploaded_by_name}</span>}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(doc.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
