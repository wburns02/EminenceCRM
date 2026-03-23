import { useState } from 'react'
import { Search, Sparkles, Plus, Building2, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCompanies } from '@/api/hooks/useCompanies'
import { useAddBuyers } from '@/api/hooks/useBuyerInterests'
import { COMPANY_TYPE_LABELS, COMPANY_TYPE_COLORS, INDUSTRIES } from '@/api/types/company'
import type { Company } from '@/api/types/company'

interface BuyerUniverseBuilderProps {
  engagementId: string
  existingBuyerCompanyIds?: string[]
  onAdded?: () => void
}

export default function BuyerUniverseBuilder({
  engagementId,
  existingBuyerCompanyIds = [],
  onAdded,
}: BuyerUniverseBuilderProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const { data, isLoading } = useCompanies({
    search,
    type: typeFilter,
    industry: industryFilter,
    page_size: 50,
  })

  const addBuyers = useAddBuyers()

  const companies = (data?.items ?? []).filter(
    (c) => !existingBuyerCompanyIds.includes(c.id)
  )

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBulkAdd = async () => {
    if (selected.size === 0) return
    await addBuyers.mutateAsync({
      engagementId,
      companyIds: Array.from(selected),
    })
    setSelected(new Set())
    onAdded?.()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Buyer Universe Builder
        </h3>
        <Button variant="outline" size="sm" disabled>
          <Sparkles className="h-4 w-4" />
          AI Suggestions
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search companies..."
          className="w-56"
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-36"
        >
          <option value="all">All Types</option>
          <option value="pe">PE Firm</option>
          <option value="strategic">Strategic</option>
          <option value="lender">Lender</option>
        </Select>
        <Select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="w-40"
        >
          <option value="all">All Industries</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </Select>
      </div>

      {/* Selected count + add button */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-primary/5 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-primary">
            {selected.size} {selected.size === 1 ? 'company' : 'companies'} selected
          </span>
          <Button
            size="sm"
            onClick={handleBulkAdd}
            loading={addBuyers.isPending}
          >
            <Plus className="h-4 w-4" />
            Add to Deal
          </Button>
        </div>
      )}

      {/* Company List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title="No companies found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {companies.map((company: Company) => {
            const isSelected = selected.has(company.id)
            return (
              <button
                key={company.id}
                type="button"
                onClick={() => toggleSelect(company.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-primary/5 border border-primary/30'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className={`w-6 h-6 rounded border flex items-center justify-center ${
                  isSelected ? 'bg-primary border-primary text-white' : 'border-border'
                }`}>
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary">{company.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {company.industry && (
                      <span className="text-xs text-text-muted">{company.industry}</span>
                    )}
                    {company.location && (
                      <span className="text-xs text-text-muted">{company.location}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(company.types ?? []).map((t: string) => (
                    <span
                      key={t}
                      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium border ${COMPANY_TYPE_COLORS[t] ?? ''}`}
                    >
                      {COMPANY_TYPE_LABELS[t] ?? t}
                    </span>
                  ))}
                </div>
                {company.revenue_range && (
                  <Badge variant="default" className="text-[10px]">{company.revenue_range}</Badge>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
