import { useState, useMemo } from 'react'
import { FileText, Upload, Link2, Eye, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { useEngagements } from '@/api/hooks/useEngagements'
import { useDocuments, useUploadDocument, useLinkDocument } from '@/api/hooks/useDocuments'
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
} from '@/api/types/document'
import type { Document } from '@/api/types/document'
import { formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-50 text-gray-600',
  final: 'bg-green-50 text-green-700',
  shared: 'bg-blue-50 text-blue-700',
  archived: 'bg-amber-50 text-amber-700',
}

const TYPE_COLORS: Record<string, string> = {
  cim: 'bg-purple-50 text-purple-700',
  nda: 'bg-blue-50 text-blue-700',
  loi: 'bg-amber-50 text-amber-700',
  ioi: 'bg-orange-50 text-orange-700',
  financial: 'bg-green-50 text-green-700',
  legal: 'bg-red-50 text-red-700',
  teaser: 'bg-teal-50 text-teal-700',
  other: 'bg-gray-50 text-gray-600',
}

function DocumentRow({ doc }: { doc: Document }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-border last:border-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <FileText className="h-5 w-5 text-text-muted flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{doc.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[doc.type] ?? TYPE_COLORS.other}`}>
              {DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}
            </span>
            {doc.status && (
              <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[doc.status] ?? ''}`}>
                {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
              </span>
            )}
            {doc.version && doc.version > 1 && (
              <span className="text-[10px] text-text-muted">v{doc.version}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {doc.uploaded_by_name && (
          <span className="text-xs text-text-muted hidden sm:block">{doc.uploaded_by_name}</span>
        )}
        <span className="text-xs text-text-muted hidden sm:block">{formatDate(doc.created_at)}</span>
        <div className="flex items-center gap-1">
          {doc.file_url && (
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-gray-100 text-text-muted hover:text-primary transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
          {doc.external_url && (
            <a
              href={doc.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-gray-100 text-text-muted hover:text-primary transition-colors"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function AllDocumentsView({ filtersVisible = true }: { filtersVisible?: boolean }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  // Load all documents (no specific engagement filter)
  const { data, isLoading } = useDocuments(undefined)

  const filtered = useMemo(() => {
    const items = data?.items ?? []
    return items.filter((doc) => {
      if (search && !doc.name.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter !== 'all' && doc.type !== typeFilter) return false
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false
      return true
    })
  }, [data, search, typeFilter, statusFilter])

  const pageSize = 20
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      {filtersVisible && (
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search documents..." className="w-56" />
          <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="w-36">
            <option value="all">All Types</option>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="w-36">
            <option value="all">All Statuses</option>
            {Object.entries(DOCUMENT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : paged.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No documents found"
            description="Upload or link documents from engagement detail pages."
          />
        ) : (
          <>
            {paged.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center py-3 border-t border-border">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function RecentDocumentsView() {
  const { data, isLoading } = useDocuments(undefined)

  const recent = useMemo(() => {
    const items = data?.items ?? []
    return [...items]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
  }, [data])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (recent.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="No recent documents"
        description="Documents will appear here once uploaded."
      />
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
      {recent.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} />
      ))}
    </div>
  )
}

function ByEngagementView() {
  const { data: engagementsData, isLoading } = useEngagements({ page_size: 200 })
  const engagements = engagementsData?.items ?? []

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (engagements.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="No engagements"
        description="Create engagements to organize documents."
      />
    )
  }

  return (
    <div className="space-y-4">
      {engagements.map((eng) => (
        <div key={eng.id} className="bg-bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">{eng.codename ?? eng.name}</span>
              <Badge variant={eng.type === 'sell_side' ? 'primary' : 'warning'} className="text-[10px]">
                {eng.type === 'sell_side' ? 'Sell' : 'Buy'}
              </Badge>
            </div>
          </div>
          <div className="p-4 text-sm text-text-muted text-center">
            Documents loaded per-engagement on detail page.
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DocumentCenterPage() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [filtersVisible, setFiltersVisible] = useState(true)

  // Upload dialog state
  const [uploadEngagement, setUploadEngagement] = useState('')
  const [uploadType, setUploadType] = useState('other')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const uploadDoc = useUploadDocument()

  // Link dialog state
  const [linkEngagement, setLinkEngagement] = useState('')
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkType, setLinkType] = useState('other')
  const linkDoc = useLinkDocument()

  const { data: engagementsData } = useEngagements({ page_size: 200 })
  const engagements = engagementsData?.items ?? []

  const handleUpload = async () => {
    if (!uploadFile || !uploadEngagement) return
    await uploadDoc.mutateAsync({
      file: uploadFile,
      engagementId: uploadEngagement,
      type: uploadType,
    })
    setUploadFile(null)
    setUploadEngagement('')
    setUploadType('other')
    setUploadOpen(false)
  }

  const handleLink = async () => {
    if (!linkName || !linkUrl || !linkEngagement) return
    await linkDoc.mutateAsync({
      engagementId: linkEngagement,
      name: linkName,
      type: linkType,
      externalUrl: linkUrl,
    })
    setLinkName('')
    setLinkUrl('')
    setLinkType('other')
    setLinkEngagement('')
    setLinkOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">Document Center</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLinkOpen(true)}>
            <Link2 className="h-4 w-4" />
            Link
          </Button>
          <Button
            variant={filtersVisible ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFiltersVisible((v) => !v)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultTab="all">
        <TabList>
          <Tab value="engagement">By Engagement</Tab>
          <Tab value="all">All Documents</Tab>
          <Tab value="recent">Recent</Tab>
        </TabList>

        <TabPanel value="engagement">
          <ByEngagementView />
        </TabPanel>

        <TabPanel value="all">
          <AllDocumentsView filtersVisible={filtersVisible} />
        </TabPanel>

        <TabPanel value="recent">
          <RecentDocumentsView />
        </TabPanel>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document" size="sm">
        <div className="space-y-4">
          <FormField label="Engagement" required>
            <Select value={uploadEngagement} onChange={(e) => setUploadEngagement(e.target.value)}>
              <option value="">Select engagement...</option>
              {engagements.map((eng) => (
                <option key={eng.id} value={eng.id}>{eng.codename ?? eng.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Document Type">
            <Select value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="File" required>
            <Input
              type="file"
              accept=".pdf,.docx,.xlsx,.pptx,.doc,.xls,.ppt,.txt,.csv"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || !uploadEngagement}
              loading={uploadDoc.isPending}
            >
              Upload
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={linkOpen} onClose={() => setLinkOpen(false)} title="Link External Document" size="sm">
        <div className="space-y-4">
          <FormField label="Engagement" required>
            <Select value={linkEngagement} onChange={(e) => setLinkEngagement(e.target.value)}>
              <option value="">Select engagement...</option>
              {engagements.map((eng) => (
                <option key={eng.id} value={eng.id}>{eng.codename ?? eng.name}</option>
              ))}
            </Select>
          </FormField>
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
                <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
              ))}
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setLinkOpen(false)}>Cancel</Button>
            <Button
              onClick={handleLink}
              disabled={!linkName || !linkUrl || !linkEngagement}
              loading={linkDoc.isPending}
            >
              Add Link
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
