import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus, Upload, Globe, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCompanies } from '@/api/hooks/useCompanies'
import { COMPANY_TYPE_LABELS, COMPANY_TYPE_COLORS, INDUSTRIES } from '@/api/types/company'
import type { Company } from '@/api/types/company'
import type { Column } from '@/components/ui/DataTable'

export default function CompaniesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useCompanies({
    search,
    type: typeFilter,
    industry: industryFilter,
    page,
    page_size: 25,
  })

  const columns: Column<Company & Record<string, unknown>>[] = [
    {
      key: 'name',
      label: 'Company',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-text-primary">{row.name}</div>
          {row.location && (
            <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
              <MapPin className="h-3 w-3" />
              {row.location}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'types',
      label: 'Type',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.types ?? []).map((t: string) => (
            <span
              key={t}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${COMPANY_TYPE_COLORS[t] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
            >
              {COMPANY_TYPE_LABELS[t] ?? t}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'industry',
      label: 'Industry',
      sortable: true,
      render: (row) => (
        <span className="text-text-secondary">{row.industry ?? '--'}</span>
      ),
    },
    {
      key: 'revenue_range',
      label: 'Revenue',
      render: (row) => (
        <span className="text-text-secondary">{row.revenue_range ?? '--'}</span>
      ),
    },
    {
      key: 'website',
      label: 'Website',
      render: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-3 w-3" />
            Visit
          </a>
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
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">Companies</h1>
        </div>
        <div className="bg-bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-danger">Failed to load companies. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">Companies</h1>
          {data && (
            <span className="text-sm text-text-muted">({data.total})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/companies/import')}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button size="sm" onClick={() => navigate('/companies/new')}>
            <Plus className="h-4 w-4" />
            New Company
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search companies..."
          className="w-64"
        />
        <Select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="w-40"
        >
          <option value="all">All Types</option>
          <option value="seller">Seller</option>
          <option value="pe">PE Firm</option>
          <option value="strategic">Strategic</option>
          <option value="lender">Lender</option>
          <option value="other">Other</option>
        </Select>
        <Select
          value={industryFilter}
          onChange={(e) => { setIndustryFilter(e.target.value); setPage(1) }}
          className="w-44"
        >
          <option value="all">All Industries</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
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
            icon={<Building2 className="h-12 w-12" />}
            title="No companies found"
            description={search || typeFilter !== 'all' || industryFilter !== 'all' ? 'Try adjusting your filters.' : 'Get started by adding your first company.'}
            action={
              !search && typeFilter === 'all' && industryFilter === 'all' ? (
                <Button size="sm" onClick={() => navigate('/companies/new')}>
                  <Plus className="h-4 w-4" />
                  Add Company
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data.items as (Company & Record<string, unknown>)[]}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => navigate(`/companies/${row.id}`)}
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
