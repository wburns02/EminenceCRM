import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { formatDate } from '@/lib/utils'

interface AuditEntry {
  id: string
  user_name: string
  action: string
  entity_type: string
  entity_id: string
  details: string | null
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-50 text-green-700',
  update: 'bg-blue-50 text-blue-700',
  delete: 'bg-red-50 text-red-600',
  login: 'bg-purple-50 text-purple-600',
  export: 'bg-amber-50 text-amber-700',
}

export default function AuditLogPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'audit', { search, action: actionFilter, page }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, page_size: 25 }
      if (search) params.search = search
      if (actionFilter !== 'all') params.action = actionFilter
      const { data } = await apiClient.get<{
        items: AuditEntry[]
        total: number
        page: number
        pages: number
      }>('/settings/audit-log', { params })
      return data
    },
  })

  const entries = data?.items ?? []
  const totalPages = data?.pages ?? 1

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
        <ArrowLeft className="h-4 w-4" />
        Settings
      </Button>

      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-amber-600" />
        <h1 className="text-2xl font-bold text-text-primary">Audit Log</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search by user or action..."
          className="w-56"
        />
        <Select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
          className="w-36"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="export">Export</option>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setSearch(''); setActionFilter('all'); setPage(1) }}
        >
          <Filter className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Shield className="h-12 w-12" />}
            title="No audit entries"
            description="Audit log entries will appear as users perform actions in the system."
          />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">{entry.user_name}</td>
                    <td className="px-4 py-3">
                      <Badge className={ACTION_COLORS[entry.action] ?? 'bg-gray-50 text-gray-600'}>
                        {entry.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {entry.entity_type}
                      <span className="text-text-muted ml-1 text-xs">#{entry.entity_id.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted truncate max-w-[200px]">
                      {entry.details ?? '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center py-4 border-t border-border">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
