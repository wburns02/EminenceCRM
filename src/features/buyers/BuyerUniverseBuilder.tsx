import { useState } from 'react'
import { Search, Sparkles, Plus, Building2, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCompanies } from '@/api/hooks/useCompanies'
import { useAddBuyers } from '@/api/hooks/useBuyerInterests'
import { useScoreBuyers } from '@/api/hooks/useAI'
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
  const [aiResults, setAiResults] = useState<Array<{ buyer_id: string; score: number; reasoning: string }>>([])

  const { data, isLoading } = useCompanies({
    search,
    type: typeFilter,
    industry: industryFilter,
    page_size: 50,
  })

  const addBuyers = useAddBuyers()
  const scoreBuyers = useScoreBuyers()

  const handleAISuggestions = async () => {
    const result = await scoreBuyers.mutateAsync(engagementId)
    setAiResults(result.results ?? [])
  }

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
        <Button
          variant="outline"
          size="sm"
          onClick={handleAISuggestions}
          loading={scoreBuyers.isPending}
        >
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

      {/* AI Suggestions Results */}
      {scoreBuyers.isPending && (
        <div className="flex items-center gap-2 text-sm text-text-muted py-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          Running AI buyer matching...
        </div>
      )}

      {aiResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Suggested Buyers ({aiResults.length})
          </h4>
          <div className="bg-primary/5 border border-primary/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary uppercase">Buyer</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-text-secondary uppercase">Score</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary uppercase">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {aiResults.sort((a, b) => b.score - a.score).map((r) => (
                  <tr key={r.buyer_id} className="border-b border-primary/10 last:border-0">
                    <td className="px-3 py-2 text-sm font-medium text-text-primary">{r.buyer_id}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        r.score >= 80 ? 'bg-green-100 text-green-700' :
                        r.score >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {r.score}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-text-secondary">{r.reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
