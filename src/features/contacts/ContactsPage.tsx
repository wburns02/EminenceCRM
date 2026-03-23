import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Mail, Phone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useContacts } from '@/api/hooks/useContacts'
import { CONTACT_ROLES, CONTACT_ROLE_LABELS } from '@/api/types/contact'
import type { Contact } from '@/api/types/contact'
import type { Column } from '@/components/ui/DataTable'

export default function ContactsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useContacts({
    search,
    role: roleFilter,
    page,
    page_size: 25,
  })

  const columns: Column<Contact & Record<string, unknown>>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-text-primary">
            {row.first_name} {row.last_name}
          </div>
          {row.title && (
            <div className="text-xs text-text-muted">{row.title}</div>
          )}
        </div>
      ),
    },
    {
      key: 'company_name',
      label: 'Company',
      sortable: true,
      render: (row) =>
        row.company_name ? (
          <span className="flex items-center gap-1 text-text-secondary">
            <Building2 className="h-3 w-3" />
            {row.company_name}
          </span>
        ) : (
          <span className="text-text-muted">--</span>
        ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) =>
        row.role ? (
          <Badge variant="default">
            {CONTACT_ROLE_LABELS[row.role] ?? row.role}
          </Badge>
        ) : (
          <span className="text-text-muted">--</span>
        ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) =>
        row.email ? (
          <a
            href={`mailto:${row.email}`}
            className="flex items-center gap-1 text-primary hover:underline text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3 w-3" />
            {row.email}
          </a>
        ) : (
          <span className="text-text-muted">--</span>
        ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) =>
        row.phone ? (
          <span className="flex items-center gap-1 text-text-secondary text-sm">
            <Phone className="h-3 w-3" />
            {row.phone}
          </span>
        ) : (
          <span className="text-text-muted">--</span>
        ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.is_active !== false ? 'success' : 'default'}>
          {row.is_active !== false ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ]

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">Contacts</h1>
        </div>
        <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-danger">Failed to load contacts. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">Contacts</h1>
          {data && <span className="text-sm text-text-muted">({data.total})</span>}
        </div>
        <Button size="sm" onClick={() => navigate('/contacts/new')}>
          <Plus className="h-4 w-4" />
          New Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search contacts..."
          className="w-64"
        />
        <Select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="w-40"
        >
          <option value="all">All Roles</option>
          {CONTACT_ROLES.map((r) => (
            <option key={r} value={r}>{CONTACT_ROLE_LABELS[r]}</option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No contacts found"
            description={search || roleFilter !== 'all' ? 'Try adjusting your filters.' : 'Get started by adding your first contact.'}
            action={
              !search && roleFilter === 'all' ? (
                <Button size="sm" onClick={() => navigate('/contacts/new')}>
                  <Plus className="h-4 w-4" />
                  Add Contact
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data.items as (Contact & Record<string, unknown>)[]}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => navigate(`/contacts/${row.id}`)}
            />
            {data.pages > 1 && (
              <div className="flex justify-center py-4 border-t border-border">
                <Pagination
                  currentPage={data.page}
                  totalPages={data.pages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
